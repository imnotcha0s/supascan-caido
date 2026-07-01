import type { SDK } from "caido:plugin";
import { RequestSpec } from "caido:utils";
import type { API } from "../index";
import type { Registry } from "../registry";
import type { RateLimiter } from "../ratelimit";
import { reportExposedRpc } from "../findings";
import {
  credsFor,
  activeSession,
  hasUsableCreds,
  parseWordlist,
  extractHintFunction,
  type ProbeCreds,
} from "../extract";

/**
 * Enumerate RPC functions via OpenAPI and test each for unauthenticated access.
 */
export async function runRpcCheck(
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
  if (!hasUsableCreds(instance)) {
    onProgress("No credentials (anon key or session) — cannot run RPC check.");
    return;
  }
  const creds = credsFor(instance);
  const active = activeSession(instance);
  if (active) {
    onProgress(`Running as authenticated session: ${active.email}`);
  }

  // Step 1: Enumerate functions via OpenAPI, then merge with any RPCs already
  // observed in traffic. Enumeration can return nothing (schema not exposed in
  // the OpenAPI output), so the observed list is an important fallback.
  onProgress("Fetching OpenAPI spec to enumerate RPC functions...");
  const enumerated = await enumFunctions(sdk, limiter, projectUrl, creds);
  if (enumerated === undefined) {
    onProgress("Could not fetch OpenAPI spec — falling back to observed RPCs.");
  } else if (enumerated.length > 0) {
    onProgress(`OpenAPI exposed ${enumerated.length} function(s).`);
  }

  const functions = [...new Set([...(enumerated ?? []), ...instance.rpcs])];
  if (functions.length === 0) {
    onProgress("No RPC functions found (none in OpenAPI or observed in traffic).");
    return;
  }

  onProgress(`Testing ${functions.length} RPC function(s): ${functions.join(", ")}`);

  // Update instance with discovered RPCs
  const inst = await registry.getInstance(projectRef);
  if (inst) {
    inst.rpcs = [...new Set([...inst.rpcs, ...functions])];
    await registry.upsertInstance(inst);
  }

  // Step 2: Call each function with no args
  for (const fnName of functions) {
    if (limiter.isKilled()) {
      onProgress("Stopped by kill switch.");
      return;
    }

    onProgress(`Testing RPC: ${fnName}`);
    const result = await callRpc(sdk, limiter, projectUrl, creds, fnName);
    if (result === undefined) continue;

    // 200 or 204 without auth = exposed
    const exposed = result.statusCode === 200 || result.statusCode === 204;
    await recordRpc(registry, projectRef, fnName, result.statusCode, exposed);
    if (exposed) {
      await reportExposedRpc(sdk, projectUrl, fnName, result.requestId);
      onProgress(`FINDING: RPC "${fnName}" is callable without authentication`);
    } else {
      onProgress(`RPC "${fnName}": ${result.statusCode}`);
    }
  }

  onProgress("RPC check complete.");
}

async function recordRpc(
  registry: Registry,
  projectRef: string,
  name: string,
  status: number,
  exposed: boolean
): Promise<void> {
  const inst = await registry.getInstance(projectRef);
  if (!inst) return;
  inst.rpcStates = { ...(inst.rpcStates ?? {}) };
  inst.rpcStates[name] = { name, status, exposed };
  await registry.upsertInstance(inst);
}

async function enumFunctions(
  sdk: SDK<API>,
  limiter: RateLimiter,
  projectUrl: string,
  creds: ProbeCreds
): Promise<string[] | undefined> {
  const allowed = await limiter.acquire();
  if (!allowed) return undefined;
  try {
    const url = `${projectUrl}/rest/v1/`;
    const spec = new RequestSpec(url);
    spec.setMethod("GET");
    spec.setHeader("apikey", creds.apikey);
    spec.setHeader("Authorization", `Bearer ${creds.bearer}`);
    spec.setHeader("Accept", "application/openapi+json");

    const result = await sdk.requests.send(spec);
    const statusCode = result.response?.getCode() ?? 0;
    if (statusCode !== 200) return [];

    const body = result.response?.getBody()?.toText() ?? "";
    let openApi: unknown;
    try {
      openApi = JSON.parse(body);
    } catch {
      return [];
    }

    // Extract paths that start with /rpc/
    const functions: string[] = [];
    if (
      openApi &&
      typeof openApi === "object" &&
      "paths" in openApi &&
      openApi.paths &&
      typeof openApi.paths === "object"
    ) {
      for (const path of Object.keys(openApi.paths as Record<string, unknown>)) {
        const m = /^\/rpc\/(.+)$/.exec(path);
        if (m?.[1]) {
          functions.push(m[1]);
        }
      }
    }
    return functions;
  } catch (err) {
    sdk.console.error(`[SupaScan] RPC enum error: ${String(err)}`);
    return undefined;
  } finally {
    limiter.release();
  }
}

type RpcResult = {
  statusCode: number;
  requestId: string;
  body: string;
};

async function callRpc(
  sdk: SDK<API>,
  limiter: RateLimiter,
  projectUrl: string,
  creds: ProbeCreds,
  fnName: string
): Promise<RpcResult | undefined> {
  const allowed = await limiter.acquire();
  if (!allowed) return undefined;
  try {
    const url = `${projectUrl}/rest/v1/rpc/${fnName}`;
    const spec = new RequestSpec(url);
    spec.setMethod("POST");
    spec.setHeader("apikey", creds.apikey);
    spec.setHeader("Authorization", `Bearer ${creds.bearer}`);
    spec.setHeader("Content-Type", "application/json");
    spec.setBody("{}");

    const result = await sdk.requests.send(spec);
    const statusCode = result.response?.getCode() ?? 0;
    const requestId = result.request?.getId() ?? "";
    const body = result.response?.getBody()?.toText() ?? "";
    return { statusCode, requestId, body };
  } catch (err) {
    sdk.console.error(`[SupaScan] RPC call error for ${fnName}: ${String(err)}`);
    return undefined;
  } finally {
    limiter.release();
  }
}

/**
 * Common / interesting Postgres & Supabase RPC function names to brute-force.
 */
export const COMMON_RPCS = [
  "get_user", "get_users", "get_current_user", "current_user_id", "whoami",
  "is_admin", "is_authenticated", "is_super_admin", "has_role", "check_role",
  "create_user", "update_user", "delete_user", "list_users", "search_users",
  "get_profile", "update_profile", "handle_new_user", "reset_password",
  "set_role", "grant_admin", "make_admin", "promote_user", "set_config",
  "get_config", "get_secret", "get_secrets", "read_secret", "get_api_key",
  "vault_decrypt", "decrypt", "encrypt", "decrypt_secret",
  "http", "http_get", "http_post", "http_request", "fetch_url", "get_url",
  "pg_read_file", "pg_ls_dir", "exec", "exec_sql", "execute_sql", "run_sql",
  "query", "raw_query", "admin", "backup", "export_data", "import_data",
  "send_email", "send_sms", "get_balance", "transfer", "process_payment",
];

/**
 * Brute-force RPC function names from a custom wordlist plus the built-in
 * common list. A PostgREST "Perhaps you meant to call the function …" hint
 * confirms a function exists (even when called with the wrong args), and reveals
 * correctly-spelled names to queue.
 */
export async function runRpcBruteforce(
  sdk: SDK<API>,
  registry: Registry,
  limiter: RateLimiter,
  projectRef: string,
  wordlist: string,
  onProgress: (msg: string) => void
): Promise<void> {
  const instance = await registry.getInstance(projectRef);
  if (!instance) {
    onProgress("Instance not found.");
    return;
  }
  if (!hasUsableCreds(instance)) {
    onProgress("No credentials (anon key or session) — cannot brute-force RPCs.");
    return;
  }

  const creds = credsFor(instance);
  const active = activeSession(instance);
  if (active) onProgress(`Running as authenticated session: ${active.email}`);

  const { projectUrl } = instance;
  const custom = parseWordlist(wordlist);
  const queue = [...new Set([...custom, ...COMMON_RPCS, ...instance.rpcs])];
  const seen = new Set(queue);
  onProgress(`Brute-forcing ${queue.length} RPC name(s)...`);

  let found = 0;
  while (queue.length > 0) {
    const fnName = queue.shift();
    if (fnName === undefined) break;
    if (limiter.isKilled()) {
      onProgress("Stopped by kill switch.");
      return;
    }

    const result = await callRpc(sdk, limiter, projectUrl, creds, fnName);
    if (result === undefined) continue;

    // A hint reveals a real function name (possibly the same one with args).
    const hint = extractHintFunction(result.body);
    if (hint !== undefined && !seen.has(hint)) {
      seen.add(hint);
      queue.push(hint);
      onProgress(`Hint: '${fnName}' → real function '${hint}' (queued)`);
    }

    const exposed = result.statusCode === 200 || result.statusCode === 204;
    // The function exists (as spelled) if it wasn't a plain "not found" 404,
    // or a hint points back to this exact name.
    const exists = result.statusCode !== 404 || hint === fnName;
    if (!exists) continue;

    found++;
    await recordRpc(registry, projectRef, fnName, result.statusCode, exposed);
    if (exposed) {
      await reportExposedRpc(sdk, projectUrl, fnName, result.requestId);
      onProgress(`FINDING: RPC "${fnName}" callable without auth`);
    } else {
      onProgress(`Found RPC "${fnName}" (${result.statusCode})`);
    }
  }

  onProgress(`RPC brute-force complete — ${found} function(s) found.`);
}
