import type { SDK, DefineAPI, DefineEvents } from "caido:plugin";
import type { SupabaseInstance, ActivityEntry, PluginSettings } from "./types";
import { Registry } from "./registry";

// Re-export shared types so the frontend can import them from "backend".
export type {
  SupabaseInstance,
  TableState,
  IdorResult,
  BucketState,
  StorageObject,
  RpcState,
  SchemaState,
  ActivityEntry,
  PluginSettings,
  SessionUser,
} from "./types";
import { RateLimiter } from "./ratelimit";
import {
  fingerprintRequest,
  fingerprintResponse,
  headersToRecord,
} from "./fingerprint";
import { runReadChecks } from "./probes/read";
import { runWriteProbes } from "./probes/write";
import {
  runAuthCheck,
  runCustomSignup,
  runSignIn,
  type CustomSignupResult,
  type SignInResult,
} from "./probes/auth";
import { runRpcCheck, runRpcBruteforce } from "./probes/rpc";
import { runStorageEnum } from "./probes/storage";
import { runIdorCheck } from "./probes/idor";
import { runRoleCheck } from "./probes/roles";
import { randomString, decodeJwt, addUserToInstance } from "./extract";
import { isInScope } from "./scope";
import { loadSettings, saveSettingsToDisk } from "./settings";

// ---- API & Event type definitions ----

export type API = DefineAPI<{
  getInstances: typeof getInstances;
  getSettings: typeof getSettings;
  saveSettings: typeof saveSettings;
  getActivityLog: typeof getActivityLog;
  clearActivityLog: typeof clearActivityLog;
  clearTables: typeof clearTables;
  runReadChecks: typeof runReadChecksRpc;
  runWriteProbes: typeof runWriteProbesRpc;
  runAuthCheck: typeof runAuthCheckRpc;
  runRpcCheck: typeof runRpcCheckRpc;
  runRpcBruteforce: typeof runRpcBruteforceRpc;
  runStorageEnum: typeof runStorageEnumRpc;
  runIdorCheck: typeof runIdorCheckRpc;
  runRoleCheck: typeof runRoleCheckRpc;
  customSignup: typeof customSignupRpc;
  signInUser: typeof signInUser;
  addSessionToken: typeof addSessionToken;
  setActiveSession: typeof setActiveSession;
  removeSession: typeof removeSession;
  stopAllChecks: typeof stopAllChecks;
  seedFromRequest: typeof seedFromRequest;
  addManualInstance: typeof addManualInstance;
}>;

export type BackendEvents = DefineEvents<{
  "supascan:instances-updated": { instances: SupabaseInstance[] };
  "supascan:activity-updated": { entries: ActivityEntry[] };
  "supascan:check-progress": { projectRef: string; message: string };
}>;

// ---- Module-level singletons (initialized in init()) ----

let _registry: Registry | undefined;
let _limiter: RateLimiter | undefined;

function getRegistry(): Registry {
  if (!_registry) throw new Error("Registry not initialized");
  return _registry;
}

function getLimiter(): RateLimiter {
  if (!_limiter) throw new Error("RateLimiter not initialized");
  return _limiter;
}

// ---- Broadcast helpers ----

async function broadcastInstances(sdk: SDK<API>): Promise<void> {
  try {
    const instances = await getRegistry().getInstances();
    sdk.api.send("supascan:instances-updated", { instances });
  } catch (err) {
    sdk.console.error(`[SupaScan] broadcastInstances error: ${String(err)}`);
  }
}

async function broadcastActivity(sdk: SDK<API>): Promise<void> {
  try {
    const entries = await getRegistry().getActivityLog();
    sdk.api.send("supascan:activity-updated", { entries });
  } catch (err) {
    sdk.console.error(`[SupaScan] broadcastActivity error: ${String(err)}`);
  }
}

async function logActivity(
  sdk: SDK<API>,
  method: string,
  url: string,
  statusCode?: number,
  note?: string
): Promise<void> {
  const entry: ActivityEntry = {
    id: randomString(16),
    timestamp: new Date().toISOString(),
    method,
    url,
    statusCode,
    note,
  };
  await getRegistry().addActivityEntry(entry);
  await broadcastActivity(sdk);
}

// ---- RPC API implementations ----

async function getInstances(_sdk: SDK<API>): Promise<SupabaseInstance[]> {
  return getRegistry().getInstances();
}

async function getSettings(_sdk: SDK<API>): Promise<PluginSettings> {
  return getLimiter().getSettings();
}

async function saveSettings(
  sdk: SDK<API>,
  settings: PluginSettings
): Promise<void> {
  getLimiter().updateSettings(settings);
  saveSettingsToDisk(sdk, settings);
}

async function getActivityLog(_sdk: SDK<API>): Promise<ActivityEntry[]> {
  return getRegistry().getActivityLog();
}

async function clearActivityLog(sdk: SDK<API>): Promise<void> {
  await getRegistry().clearActivityLog();
  await broadcastActivity(sdk);
}

async function clearTables(sdk: SDK<API>, projectRef: string): Promise<void> {
  const inst = await getRegistry().getInstance(projectRef);
  if (!inst) return;
  inst.tables = {};
  await getRegistry().upsertInstance(inst);
  await broadcastInstances(sdk);
  await logActivity(sdk, "SYSTEM", `Cleared tables for ${projectRef}`);
}

async function runReadChecksRpc(
  sdk: SDK<API>,
  projectRef: string
): Promise<void> {
  const limiter = getLimiter();
  const registry = getRegistry();

  await runReadChecks(sdk, registry, limiter, projectRef, async (msg) => {
    sdk.api.send("supascan:check-progress", { projectRef, message: msg });
    await logActivity(sdk, "PROBE", `[read] ${msg}`);
    await broadcastInstances(sdk);
  });
  await broadcastInstances(sdk);
}

async function runWriteProbesRpc(
  sdk: SDK<API>,
  projectRef: string
): Promise<void> {
  const limiter = getLimiter();
  const registry = getRegistry();

  await runWriteProbes(sdk, registry, limiter, projectRef, async (msg) => {
    sdk.api.send("supascan:check-progress", { projectRef, message: msg });
    await logActivity(sdk, "PROBE", `[write] ${msg}`);
    await broadcastInstances(sdk);
  });
  await broadcastInstances(sdk);
}

async function runAuthCheckRpc(
  sdk: SDK<API>,
  projectRef: string
): Promise<void> {
  const limiter = getLimiter();
  const registry = getRegistry();

  await runAuthCheck(sdk, registry, limiter, projectRef, async (msg) => {
    sdk.api.send("supascan:check-progress", { projectRef, message: msg });
    await logActivity(sdk, "PROBE", `[auth] ${msg}`);
  });
}

async function customSignupRpc(
  sdk: SDK<API>,
  projectRef: string,
  email: string,
  password: string,
  dataJson: string
): Promise<CustomSignupResult> {
  const result = await runCustomSignup(
    sdk,
    getRegistry(),
    getLimiter(),
    projectRef,
    email,
    password,
    dataJson
  );
  await logActivity(
    sdk,
    "POST",
    `/auth/v1/signup (${email})`,
    result.statusCode,
    result.sessionSet ? "custom signup — session captured" : "custom signup"
  );
  if (result.sessionSet) await broadcastInstances(sdk);
  return result;
}

async function setActiveSession(
  sdk: SDK<API>,
  projectRef: string,
  sessionId: string
): Promise<void> {
  const inst = await getRegistry().getInstance(projectRef);
  if (!inst) return;
  // Empty string means "anonymous".
  inst.activeSessionId = sessionId.length > 0 ? sessionId : undefined;
  await getRegistry().upsertInstance(inst);
  await broadcastInstances(sdk);
  const label = inst.activeSessionId
    ? `as ${(inst.sessions ?? []).find((s) => s.id === inst.activeSessionId)?.email ?? sessionId}`
    : "as anon";
  await logActivity(sdk, "SYSTEM", `Active session for ${projectRef} set ${label}`);
}

async function signInUser(
  sdk: SDK<API>,
  projectRef: string,
  email: string,
  password: string
): Promise<SignInResult & { added?: boolean }> {
  const result = await runSignIn(sdk, getRegistry(), getLimiter(), projectRef, email, password);
  await logActivity(
    sdk,
    "POST",
    `/auth/v1/token?grant_type=password (${email})`,
    result.statusCode,
    result.token ? "sign-in — session added" : "sign-in"
  );
  if (result.ok && result.token !== undefined) {
    const inst = await getRegistry().getInstance(projectRef);
    if (inst) {
      addUserToInstance(inst, email.trim(), result.token, "signin");
      await getRegistry().upsertInstance(inst);
      await broadcastInstances(sdk);
      return { ...result, added: true };
    }
  }
  return { ...result, added: false };
}

async function addSessionToken(
  sdk: SDK<API>,
  projectRef: string,
  email: string,
  token: string
): Promise<{ ok: boolean; error?: string }> {
  const inst = await getRegistry().getInstance(projectRef);
  if (!inst) return { ok: false, error: "Instance not found." };
  if (email.trim().length === 0) return { ok: false, error: "Email/label is required." };
  if (decodeJwt(token.trim()) === undefined) {
    return { ok: false, error: "Token is not a valid JWT." };
  }
  addUserToInstance(inst, email.trim(), token.trim(), "manual");
  await getRegistry().upsertInstance(inst);
  await broadcastInstances(sdk);
  await logActivity(sdk, "SYSTEM", `Added manual session ${email} to ${projectRef}`);
  return { ok: true };
}

async function removeSession(
  sdk: SDK<API>,
  projectRef: string,
  sessionId: string
): Promise<void> {
  const inst = await getRegistry().getInstance(projectRef);
  if (!inst) return;
  inst.sessions = (inst.sessions ?? []).filter((s) => s.id !== sessionId);
  if (inst.activeSessionId === sessionId) inst.activeSessionId = undefined;
  await getRegistry().upsertInstance(inst);
  await broadcastInstances(sdk);
}


async function runRpcCheckRpc(
  sdk: SDK<API>,
  projectRef: string
): Promise<void> {
  const limiter = getLimiter();
  const registry = getRegistry();

  await runRpcCheck(sdk, registry, limiter, projectRef, async (msg) => {
    sdk.api.send("supascan:check-progress", { projectRef, message: msg });
    await logActivity(sdk, "PROBE", `[rpc] ${msg}`);
    await broadcastInstances(sdk);
  });
  await broadcastInstances(sdk);
}

async function runRpcBruteforceRpc(
  sdk: SDK<API>,
  projectRef: string,
  wordlist: string
): Promise<void> {
  const limiter = getLimiter();
  const registry = getRegistry();

  await runRpcBruteforce(sdk, registry, limiter, projectRef, wordlist, async (msg) => {
    sdk.api.send("supascan:check-progress", { projectRef, message: msg });
    await logActivity(sdk, "PROBE", `[rpc-bf] ${msg}`);
    await broadcastInstances(sdk);
  });
  await broadcastInstances(sdk);
}

async function runStorageEnumRpc(
  sdk: SDK<API>,
  projectRef: string,
  bucketWordlist: string
): Promise<void> {
  const limiter = getLimiter();
  const registry = getRegistry();

  await runStorageEnum(sdk, registry, limiter, projectRef, bucketWordlist, async (msg) => {
    sdk.api.send("supascan:check-progress", { projectRef, message: msg });
    await logActivity(sdk, "PROBE", `[storage] ${msg}`);
    await broadcastInstances(sdk);
  });
  await broadcastInstances(sdk);
}

async function runIdorCheckRpc(
  sdk: SDK<API>,
  projectRef: string
): Promise<void> {
  const limiter = getLimiter();
  const registry = getRegistry();

  await runIdorCheck(sdk, registry, limiter, projectRef, async (msg) => {
    sdk.api.send("supascan:check-progress", { projectRef, message: msg });
    await logActivity(sdk, "PROBE", `[idor] ${msg}`);
    await broadcastInstances(sdk);
  });
  await broadcastInstances(sdk);
}

async function runRoleCheckRpc(
  sdk: SDK<API>,
  projectRef: string
): Promise<void> {
  const limiter = getLimiter();
  const registry = getRegistry();

  await runRoleCheck(sdk, registry, limiter, projectRef, async (msg) => {
    sdk.api.send("supascan:check-progress", { projectRef, message: msg });
    await logActivity(sdk, "PROBE", `[roles] ${msg}`);
    await broadcastInstances(sdk);
  });
  await broadcastInstances(sdk);
}

async function stopAllChecks(sdk: SDK<API>): Promise<void> {
  getLimiter().kill();
  await logActivity(sdk, "SYSTEM", "[SupaScan] All checks stopped by user");
  // Reset kill switch after a brief pause so user can start new checks
  setTimeout(() => {
    getLimiter().reset();
  }, 2000);
}

async function seedFromRequest(sdk: SDK<API>, requestId: string): Promise<void> {
  // Look up the request by ID and attempt to fingerprint it manually
  try {
    const reqResp = await sdk.requests.get(requestId);
    if (!reqResp) {
      sdk.console.warn(`[SupaScan] seedFromRequest: request ${requestId} not found`);
      return;
    }
    const req = reqResp.request;
    const host = req.getHost();
    const path = req.getPath();
    const method = req.getMethod();
    const rawHeaders = req.getHeaders();
    const headers = headersToRecord(rawHeaders);
    const body = req.getBody()?.toText() ?? "";

    await fingerprintRequest(
      sdk,
      getRegistry(),
      requestId,
      host,
      path,
      method,
      headers,
      body
    );

    const resp = reqResp.response;
    if (resp) {
      const rawRespHeaders = resp.getHeaders();
      const respHeaders = headersToRecord(rawRespHeaders);
      const respBody = resp.getBody()?.toText() ?? "";
      const statusCode = resp.getCode();
      await fingerprintResponse(
        sdk,
        getRegistry(),
        requestId,
        host,
        path,
        method,
        headers,
        respHeaders,
        respBody,
        statusCode
      );
    }

    await broadcastInstances(sdk);
    await logActivity(sdk, method, `${host}${path}`, resp?.getCode(), "seeded manually");
  } catch (err) {
    sdk.console.error(`[SupaScan] seedFromRequest error: ${String(err)}`);
  }
}

async function addManualInstance(
  sdk: SDK<API>,
  projectUrl: string,
  anonKey: string
): Promise<{ ok: boolean; error?: string }> {
  // Normalize URL: strip trailing slash, ensure https://
  let url = projectUrl.trim().replace(/\/$/, "");
  if (!url.startsWith("http")) url = `https://${url}`;

  // Extract project ref from URL
  const refMatch = /([a-z0-9]{20})\.supabase\.co/i.exec(url);
  if (!refMatch?.[1]) {
    return { ok: false, error: "URL must contain a valid Supabase project ref (<20-char-ref>.supabase.co)" };
  }
  const projectRef = refMatch[1].toLowerCase();
  const normalizedUrl = `https://${projectRef}.supabase.co`;

  // Decode anon key if provided
  let anonKeyRole: string | undefined;
  if (anonKey.trim().length > 0) {
    const payload = decodeJwt(anonKey.trim());
    if (!payload) {
      return { ok: false, error: "Anon key is not a valid JWT" };
    }
    if (payload.role === "service_role") {
      return { ok: false, error: "Will not store a service_role key — SupaScan never uses service_role keys" };
    }
    anonKeyRole = payload.role !== undefined ? String(payload.role) : undefined;
  }

  const inScope = await isInScope(sdk, `${projectRef}.supabase.co`);

  const existing = await getRegistry().getInstance(projectRef);
  const inst: SupabaseInstance = existing ?? {
    projectRef,
    projectUrl: normalizedUrl,
    tables: {},
    rpcs: [],
    buckets: [],
    firstSeenRequestId: "manual",
    inScope,
  };

  if (anonKey.trim().length > 0) {
    inst.anonKey = anonKey.trim();
    inst.anonKeyRole = anonKeyRole;
  }
  inst.inScope = inScope;

  await getRegistry().upsertInstance(inst);
  await broadcastInstances(sdk);
  await logActivity(sdk, "MANUAL", normalizedUrl, undefined, "manually added instance");
  sdk.console.log(`[SupaScan] Manual instance added: ${normalizedUrl}`);
  return { ok: true };
}

// ---- Plugin entry point ----

export async function init(sdk: SDK<API>): Promise<void> {
  sdk.console.log("[SupaScan] Initializing...");

  // Initialize singletons. Settings are loaded from disk so they survive reloads.
  _registry = new Registry(sdk);
  _limiter = new RateLimiter(loadSettings(sdk));
  await _registry.init();

  // Register RPC API handlers
  sdk.api.register("getInstances", getInstances);
  sdk.api.register("getSettings", getSettings);
  sdk.api.register("saveSettings", saveSettings);
  sdk.api.register("getActivityLog", getActivityLog);
  sdk.api.register("clearActivityLog", clearActivityLog);
  sdk.api.register("clearTables", clearTables);
  sdk.api.register("runReadChecks", runReadChecksRpc);
  sdk.api.register("runWriteProbes", runWriteProbesRpc);
  sdk.api.register("runAuthCheck", runAuthCheckRpc);
  sdk.api.register("customSignup", customSignupRpc);
  sdk.api.register("signInUser", signInUser);
  sdk.api.register("addSessionToken", addSessionToken);
  sdk.api.register("setActiveSession", setActiveSession);
  sdk.api.register("removeSession", removeSession);
  sdk.api.register("runRpcCheck", runRpcCheckRpc);
  sdk.api.register("runRpcBruteforce", runRpcBruteforceRpc);
  sdk.api.register("runStorageEnum", runStorageEnumRpc);
  sdk.api.register("runIdorCheck", runIdorCheckRpc);
  sdk.api.register("runRoleCheck", runRoleCheckRpc);
  sdk.api.register("stopAllChecks", stopAllChecks);
  sdk.api.register("seedFromRequest", seedFromRequest);
  sdk.api.register("addManualInstance", addManualInstance);

  // Register passive intercept callbacks
  sdk.events.onInterceptRequest(async (sdk, request) => {
    try {
      const host = request.getHost();
      const path = request.getPath();
      const method = request.getMethod();
      const rawHeaders = request.getHeaders();
      const headers = headersToRecord(rawHeaders);
      const body = request.getBody()?.toText() ?? "";
      const requestId = request.getId();

      await fingerprintRequest(
        sdk as unknown as SDK<API>,
        getRegistry(),
        requestId,
        host,
        path,
        method,
        headers,
        body
      );

      await broadcastInstances(sdk as unknown as SDK<API>);
    } catch (err) {
      sdk.console.error(`[SupaScan] intercept request error: ${String(err)}`);
    }
  });

  sdk.events.onInterceptResponse(async (sdk, request, response) => {
    try {
      const host = request.getHost();
      const path = request.getPath();
      const method = request.getMethod();
      const rawReqHeaders = request.getHeaders();
      const reqHeaders = headersToRecord(rawReqHeaders);
      const rawRespHeaders = response.getHeaders();
      const respHeaders = headersToRecord(rawRespHeaders);
      const respBody = response.getBody()?.toText() ?? "";
      const statusCode = response.getCode();
      const requestId = request.getId();

      await fingerprintResponse(
        sdk as unknown as SDK<API>,
        getRegistry(),
        requestId,
        host,
        path,
        method,
        reqHeaders,
        respHeaders,
        respBody,
        statusCode
      );

      await broadcastInstances(sdk as unknown as SDK<API>);
    } catch (err) {
      sdk.console.error(`[SupaScan] intercept response error: ${String(err)}`);
    }
  });

  // Reload per-project data when the user switches Caido projects.
  sdk.events.onProjectChange(async (sdk) => {
    try {
      await getRegistry().refreshProject();
      await broadcastInstances(sdk as unknown as SDK<API>);
      await broadcastActivity(sdk as unknown as SDK<API>);
    } catch (err) {
      sdk.console.error(`[SupaScan] project change error: ${String(err)}`);
    }
  });

  sdk.console.log("[SupaScan] Ready.");
}
