import type { SDK } from "caido:plugin";
import { RequestSpec } from "caido:utils";
import type { API } from "../index";
import type { Registry } from "../registry";
import type { RateLimiter } from "../ratelimit";
import { reportOpenSignup } from "../findings";
import { randomString, addUserToInstance, apiKeyFor } from "../extract";

/**
 * Check if the Supabase project allows open user registration.
 * Uses a random test email to avoid polluting real user records.
 * NOTE: This will create a real (unverified) user if signup is open.
 * The test email uses a domain that should not exist in production.
 */
export async function runAuthCheck(
  sdk: SDK<API>,
  registry: Registry,
  limiter: RateLimiter,
  projectRef: string,
  onProgress: (msg: string) => void
): Promise<void> {
  const instance = await registry.getInstance(projectRef);
  if (!instance) {
    onProgress("Instance not found.");
    return;
  }

  const { projectUrl } = instance;
  const apikey = apiKeyFor(instance);
  if (apikey.length === 0) {
    onProgress("No credentials (anon key or session) — cannot run auth check.");
    return;
  }

  // Use the configured test email verbatim. Supports a {rand} placeholder for
  // testers who want a unique address each run (e.g. you+{rand}@example.com).
  const configuredEmail = limiter.getSettings().testEmail;
  const testEmail = configuredEmail.includes("{rand}")
    ? configuredEmail.replace("{rand}", randomString(8).toLowerCase())
    : configuredEmail;
  const testPassword = randomString(16);

  onProgress(`Testing signup with: ${testEmail}`);

  if (limiter.isKilled()) return;

  const allowed = await limiter.acquire();
  if (!allowed) {
    onProgress("Rate limited or killed.");
    return;
  }

  try {
    const url = `${projectUrl}/auth/v1/signup`;
    const spec = new RequestSpec(url);
    spec.setMethod("POST");
    spec.setHeader("apikey", apikey);
    spec.setHeader("Content-Type", "application/json");
    spec.setBody(
      JSON.stringify({
        email: testEmail,
        password: testPassword,
      })
    );

    const result = await sdk.requests.send(spec);
    const statusCode = result.response?.getCode() ?? 0;
    const body = result.response?.getBody()?.toText() ?? "";
    const requestId = result.request?.getId() ?? "";

    onProgress(`Signup response: ${statusCode}`);

    if (statusCode === 200 || statusCode === 201) {
      let parsed: unknown;
      try {
        parsed = JSON.parse(body);
      } catch {
        parsed = null;
      }

      const isSignupSuccess =
        parsed !== null &&
        typeof parsed === "object" &&
        ("access_token" in (parsed as Record<string, unknown>) ||
          "id" in (parsed as Record<string, unknown>));

      if (isSignupSuccess) {
        await reportOpenSignup(sdk, projectUrl, requestId);
        onProgress("FINDING: Open signup is enabled.");
      } else {
        onProgress("Signup returned 200 but no access_token — may require email confirmation.");
      }
    } else if (statusCode === 400) {
      // Likely email validation failed or signup disabled
      let errMsg = "";
      try {
        const p = JSON.parse(body) as { msg?: string; message?: string };
        errMsg = p.msg ?? p.message ?? "";
      } catch {
        errMsg = body.slice(0, 100);
      }
      onProgress(`Signup rejected (400): ${errMsg}`);
    } else if (statusCode === 422) {
      onProgress(`Signup rejected (422 — validation error or disabled)`);
    } else {
      onProgress(`Unexpected signup response: ${statusCode}`);
    }
  } catch (err) {
    sdk.console.error(`[SupaScan] Auth check error: ${String(err)}`);
    onProgress(`Auth check error: ${String(err)}`);
  } finally {
    limiter.release();
  }

  onProgress("Auth check complete.");
}

export type CustomSignupResult = {
  ok: boolean;
  statusCode?: number;
  body?: string;
  hasToken?: boolean;
  sessionSet?: boolean; // true if an access_token was captured as the active session
  error?: string;
};

/**
 * Extract an access_token from an auth response body, if present.
 */
function extractAccessToken(body: string): string | undefined {
  try {
    const parsed = JSON.parse(body) as { access_token?: unknown };
    if (typeof parsed.access_token === "string" && parsed.access_token.length > 0) {
      return parsed.access_token;
    }
  } catch {
    // not JSON
  }
  return undefined;
}

/**
 * Perform a single, user-driven signup with a custom email/password and optional
 * user metadata. Returns the raw response for inspection in the UI.
 */
export async function runCustomSignup(
  sdk: SDK<API>,
  registry: Registry,
  limiter: RateLimiter,
  projectRef: string,
  email: string,
  password: string,
  dataJson: string
): Promise<CustomSignupResult> {
  const instance = await registry.getInstance(projectRef);
  if (!instance) return { ok: false, error: "Instance not found." };

  const { projectUrl } = instance;
  const apikey = apiKeyFor(instance);
  if (apikey.length === 0) return { ok: false, error: "No credentials (anon key or session) for this instance." };
  if (email.trim().length === 0) return { ok: false, error: "Email is required." };

  let extraData: Record<string, unknown> | undefined;
  if (dataJson.trim().length > 0) {
    try {
      extraData = JSON.parse(dataJson) as Record<string, unknown>;
    } catch {
      return { ok: false, error: "Extra data is not valid JSON." };
    }
  }

  const allowed = await limiter.acquire();
  if (!allowed) return { ok: false, error: "Rate limited or stopped." };

  try {
    const url = `${projectUrl}/auth/v1/signup`;
    const spec = new RequestSpec(url);
    spec.setMethod("POST");
    spec.setHeader("apikey", apikey);
    spec.setHeader("Content-Type", "application/json");
    const reqBody: Record<string, unknown> = { email: email.trim(), password };
    if (extraData !== undefined) reqBody.data = extraData;
    spec.setBody(JSON.stringify(reqBody));

    const result = await sdk.requests.send(spec);
    const statusCode = result.response?.getCode() ?? 0;
    const body = result.response?.getBody()?.toText() ?? "";
    const token = extractAccessToken(body);
    let sessionSet = false;

    // Capture the authenticated session so subsequent checks run as this user.
    if (token !== undefined) {
      addUserToInstance(instance, email.trim(), token, "signup");
      await registry.upsertInstance(instance);
      sessionSet = true;
    }

    return { ok: true, statusCode, body, hasToken: token !== undefined, sessionSet };
  } catch (err) {
    return { ok: false, error: String(err) };
  } finally {
    limiter.release();
  }
}

export type SignInResult = {
  ok: boolean;
  statusCode?: number;
  body?: string;
  token?: string;
  error?: string;
};

/**
 * Sign in an existing user via the password grant to obtain an access token.
 * Used by the session manager to add existing users to an instance.
 */
export async function runSignIn(
  sdk: SDK<API>,
  registry: Registry,
  limiter: RateLimiter,
  projectRef: string,
  email: string,
  password: string
): Promise<SignInResult> {
  const instance = await registry.getInstance(projectRef);
  if (!instance) return { ok: false, error: "Instance not found." };

  const { projectUrl } = instance;
  const apikey = apiKeyFor(instance);
  if (apikey.length === 0) return { ok: false, error: "No credentials (anon key or session) for this instance." };
  if (email.trim().length === 0) return { ok: false, error: "Email is required." };

  const allowed = await limiter.acquire();
  if (!allowed) return { ok: false, error: "Rate limited or stopped." };

  try {
    const url = `${projectUrl}/auth/v1/token?grant_type=password`;
    const spec = new RequestSpec(url);
    spec.setMethod("POST");
    spec.setHeader("apikey", apikey);
    spec.setHeader("Content-Type", "application/json");
    spec.setBody(JSON.stringify({ email: email.trim(), password }));

    const result = await sdk.requests.send(spec);
    const statusCode = result.response?.getCode() ?? 0;
    const body = result.response?.getBody()?.toText() ?? "";
    const token = extractAccessToken(body);
    return { ok: true, statusCode, body, token };
  } catch (err) {
    return { ok: false, error: String(err) };
  } finally {
    limiter.release();
  }
}
