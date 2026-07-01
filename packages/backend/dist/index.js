// packages/backend/src/registry.ts
var Registry = class {
  sdk;
  db;
  projectId = "default";
  instances = /* @__PURE__ */ new Map();
  activity = [];
  constructor(sdk) {
    this.sdk = sdk;
  }
  async init() {
    try {
      this.db = await this.sdk.meta.db();
      await this.db.exec(
        `CREATE TABLE IF NOT EXISTS instances (
          project_id TEXT NOT NULL,
          project_ref TEXT NOT NULL,
          data TEXT NOT NULL,
          PRIMARY KEY (project_id, project_ref)
        )`
      );
      await this.db.exec(
        `CREATE TABLE IF NOT EXISTS activity (
          project_id TEXT NOT NULL,
          id TEXT NOT NULL,
          ts TEXT NOT NULL,
          data TEXT NOT NULL,
          PRIMARY KEY (project_id, id)
        )`
      );
    } catch (err) {
      this.sdk.console.error(
        `[SupaScan] DB init failed \u2014 using in-memory store only: ${String(err)}`
      );
      this.db = void 0;
    }
    await this.refreshProject();
  }
  /** Re-read the current project id and reload its data into the cache. */
  async refreshProject() {
    try {
      const project = await this.sdk.projects.getCurrent();
      this.projectId = project?.getId() ?? "default";
    } catch {
      this.projectId = "default";
    }
    await this.loadFromDb();
  }
  async loadFromDb() {
    this.instances.clear();
    this.activity = [];
    if (!this.db) return;
    try {
      const instStmt = await this.db.prepare(
        `SELECT project_ref, data FROM instances WHERE project_id = ?`
      );
      const rows = await instStmt.all(this.projectId);
      for (const row of rows) {
        try {
          this.instances.set(row.project_ref, JSON.parse(row.data));
        } catch {
        }
      }
      const actStmt = await this.db.prepare(
        `SELECT data FROM activity WHERE project_id = ? ORDER BY ts DESC LIMIT 500`
      );
      const actRows = await actStmt.all(this.projectId);
      for (const row of actRows) {
        try {
          this.activity.push(JSON.parse(row.data));
        } catch {
        }
      }
    } catch (err) {
      this.sdk.console.error(`[SupaScan] DB load failed: ${String(err)}`);
    }
  }
  async upsertInstance(instance) {
    this.instances.set(instance.projectRef, instance);
    await this.persistInstance(instance);
  }
  async upsertTable(projectRef, table) {
    const inst = this.instances.get(projectRef);
    if (!inst) return;
    inst.tables[table.name] = table;
    await this.persistInstance(inst);
  }
  async getInstances() {
    return Array.from(this.instances.values());
  }
  async getInstance(projectRef) {
    return this.instances.get(projectRef);
  }
  async addActivityEntry(entry) {
    this.activity.unshift(entry);
    if (this.activity.length > 500) {
      this.activity = this.activity.slice(0, 500);
    }
    if (!this.db) return;
    try {
      const stmt = await this.db.prepare(
        `INSERT OR REPLACE INTO activity (project_id, id, ts, data) VALUES (?, ?, ?, ?)`
      );
      await stmt.run(this.projectId, entry.id, entry.timestamp, JSON.stringify(entry));
      const prune = await this.db.prepare(
        `DELETE FROM activity WHERE project_id = ? AND id NOT IN (
           SELECT id FROM activity WHERE project_id = ? ORDER BY ts DESC LIMIT 500
         )`
      );
      await prune.run(this.projectId, this.projectId);
    } catch (err) {
      this.sdk.console.error(`[SupaScan] DB activity write failed: ${String(err)}`);
    }
  }
  async getActivityLog() {
    return this.activity.slice(0, 200);
  }
  async clearActivityLog() {
    this.activity = [];
    if (!this.db) return;
    try {
      const stmt = await this.db.prepare(`DELETE FROM activity WHERE project_id = ?`);
      await stmt.run(this.projectId);
    } catch (err) {
      this.sdk.console.error(`[SupaScan] DB activity clear failed: ${String(err)}`);
    }
  }
  async persistInstance(instance) {
    if (!this.db) return;
    try {
      const stmt = await this.db.prepare(
        `INSERT INTO instances (project_id, project_ref, data) VALUES (?, ?, ?)
         ON CONFLICT(project_id, project_ref) DO UPDATE SET data = excluded.data`
      );
      await stmt.run(this.projectId, instance.projectRef, JSON.stringify(instance));
    } catch (err) {
      this.sdk.console.error(`[SupaScan] DB instance write failed: ${String(err)}`);
    }
  }
};

// packages/backend/src/ratelimit.ts
var DEFAULT_SETTINGS = {
  maxRequestsPerSecond: 5,
  maxConcurrency: 3,
  redactEvidence: false,
  testEmail: "supascan.probe@example.com",
  tableWordlist: "",
  useCustomWordlist: false,
  discoveryEnabled: true
};
var RateLimiter = class {
  tokens;
  lastRefill;
  killed = false;
  settings;
  activeRequests = 0;
  constructor(settings) {
    this.settings = { ...DEFAULT_SETTINGS, ...settings };
    this.tokens = this.settings.maxRequestsPerSecond;
    this.lastRefill = Date.now();
  }
  updateSettings(settings) {
    this.settings = { ...this.settings, ...settings };
    this.tokens = Math.min(this.tokens, this.settings.maxRequestsPerSecond);
  }
  getSettings() {
    return { ...this.settings };
  }
  kill() {
    this.killed = true;
  }
  reset() {
    this.killed = false;
    this.tokens = this.settings.maxRequestsPerSecond;
    this.lastRefill = Date.now();
    this.activeRequests = 0;
  }
  isKilled() {
    return this.killed;
  }
  /**
   * Attempt to acquire a slot. Returns true if allowed, false if killed or rate limited.
   */
  async acquire() {
    if (this.killed) return false;
    if (this.activeRequests >= this.settings.maxConcurrency) {
      await this.waitForSlot();
      if (this.killed) return false;
    }
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1e3;
    this.tokens = Math.min(
      this.settings.maxRequestsPerSecond,
      this.tokens + elapsed * this.settings.maxRequestsPerSecond
    );
    this.lastRefill = now;
    if (this.tokens < 1) {
      const waitMs = (1 - this.tokens) / this.settings.maxRequestsPerSecond * 1e3;
      await sleep(waitMs);
      if (this.killed) return false;
      this.tokens = 0;
    } else {
      this.tokens -= 1;
    }
    this.activeRequests++;
    return true;
  }
  release() {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
  }
  async waitForSlot() {
    const maxWait = 1e4;
    const start = Date.now();
    while (this.activeRequests >= this.settings.maxConcurrency) {
      if (this.killed || Date.now() - start > maxWait) return;
      await sleep(100);
    }
  }
};
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// packages/backend/src/extract.ts
function activeSession(instance) {
  if (instance.activeSessionId === void 0) return void 0;
  return (instance.sessions ?? []).find((s) => s.id === instance.activeSessionId);
}
function addUserToInstance(instance, email, token, source) {
  const sessions = instance.sessions ?? [];
  const existing = sessions.find((s) => s.email === email);
  if (existing) {
    existing.token = token;
    existing.source = source;
    instance.sessions = sessions;
    instance.activeSessionId = existing.id;
    return existing;
  }
  const user = {
    id: randomString(10),
    email,
    token,
    source,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  instance.sessions = [...sessions, user];
  instance.activeSessionId = user.id;
  return user;
}
function apiKeyFor(instance) {
  const sessions = instance.sessions ?? [];
  return instance.anonKey ?? activeSession(instance)?.token ?? sessions[0]?.token ?? "";
}
function hasUsableCreds(instance) {
  return apiKeyFor(instance).length > 0;
}
function credsFor(instance) {
  const sessions = instance.sessions ?? [];
  const apikey = apiKeyFor(instance);
  const bearer = activeSession(instance)?.token ?? instance.anonKey ?? sessions[0]?.token ?? apikey;
  return { apikey, bearer };
}
var SUPABASE_HOST_RE = /^[a-z0-9]{20}\.supabase\.co$/i;
var SUPABASE_PATH_PREFIXES = [
  "/rest/v1/",
  "/auth/v1/",
  "/storage/v1/",
  "/realtime/v1/",
  "/functions/v1/"
];
var JWT_RE = /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g;
var PROJECT_REF_RE = /^([a-z0-9]{20})\.supabase\.co$/i;
function decodeJwt(token) {
  const parts = token.split(".");
  if (parts.length !== 3) return void 0;
  try {
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload + "=".repeat((4 - payload.length % 4) % 4);
    const decoded = atob(padded);
    return JSON.parse(decoded);
  } catch {
    return void 0;
  }
}
function extractProjectRef(host) {
  const match = PROJECT_REF_RE.exec(host);
  return match?.[1]?.toLowerCase();
}
function normalizeProjectUrl(host) {
  return `https://${host.toLowerCase()}`;
}
function isSupabaseEndpoint(host, path) {
  if (SUPABASE_HOST_RE.test(host)) return true;
  for (const prefix of SUPABASE_PATH_PREFIXES) {
    if (path.startsWith(prefix)) return true;
  }
  return false;
}
function extractAnonKey(headers) {
  const apikey = findHeader(headers, "apikey");
  if (apikey) return apikey;
  const auth = findHeader(headers, "authorization");
  if (auth) {
    const m = /^Bearer\s+(.+)$/i.exec(auth);
    if (m?.[1]) return m[1];
  }
  return void 0;
}
function extractJwtsFromBody(body) {
  const results = [];
  let m;
  const re = new RegExp(JWT_RE.source, "g");
  while ((m = re.exec(body)) !== null) {
    const token = m[0];
    const payload = decodeJwt(token);
    if (payload) {
      results.push({ token, payload });
    }
  }
  return results;
}
function bodyContainsSupabaseIndicator(body) {
  return body.includes("createClient(") || body.includes("supabase-js") || body.includes("SUPABASE_URL") || body.includes("NEXT_PUBLIC_SUPABASE") || body.includes("VITE_SUPABASE") || body.includes("supabase.co");
}
function findHeader(headers, name) {
  const lower = name.toLowerCase();
  for (const [k, v] of Object.entries(headers)) {
    if (k.toLowerCase() === lower) return v;
  }
  return void 0;
}
function extractBucketFromPath(path) {
  const m = /^\/storage\/v1\/(?:object|render\/image)\/(.+)/.exec(path);
  if (!m?.[1]) return void 0;
  let rest = m[1];
  const prefixes = [
    "info/public/",
    "upload/sign/",
    "public/",
    "sign/",
    "authenticated/",
    "list/",
    "info/",
    "upload/"
  ];
  let changed = true;
  while (changed) {
    changed = false;
    for (const p of prefixes) {
      if (rest.startsWith(p)) {
        rest = rest.slice(p.length);
        changed = true;
      }
    }
  }
  const bucket = rest.split(/[/?]/)[0];
  return bucket !== void 0 && bucket.length > 0 ? bucket : void 0;
}
function extractTableFromPath(path) {
  const m = /^\/rest\/v1\/([^?/]+)/.exec(path);
  if (!m?.[1]) return void 0;
  if (m[1] === "") return void 0;
  return m[1];
}
function parseWordlist(raw) {
  return [
    ...new Set(
      raw.split(/[\n,]/).map((t) => t.trim()).filter((t) => t.length > 0)
    )
  ];
}
function extractHintTable(body) {
  let hint;
  try {
    const parsed = JSON.parse(body);
    if (typeof parsed.hint === "string") hint = parsed.hint;
  } catch {
    hint = body;
  }
  if (hint === void 0) return void 0;
  const m = /the table '(?:[a-zA-Z0-9_]+\.)?([a-zA-Z0-9_]+)'/.exec(hint);
  return m?.[1];
}
function extractHintFunction(body) {
  let hint;
  try {
    const parsed = JSON.parse(body);
    if (typeof parsed.hint === "string") hint = parsed.hint;
  } catch {
    hint = body;
  }
  if (hint === void 0) return void 0;
  const m = /call the function (?:[a-zA-Z0-9_]+\.)?([a-zA-Z0-9_]+)/.exec(hint);
  return m?.[1];
}
function extractProjectRefsFromBody(body) {
  const found = /* @__PURE__ */ new Set();
  const re = /([a-z0-9]{20})\.supabase\.co/gi;
  let m;
  while ((m = re.exec(body)) !== null) {
    found.add(m[1].toLowerCase());
  }
  return Array.from(found);
}
function randomString(length) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// packages/backend/src/scope.ts
async function isInScope(sdk, host) {
  try {
    const scopes = await sdk.scope.getAll();
    for (const scope of scopes) {
      for (const pattern of scope.allowlist) {
        if (hostMatchesPattern(host, pattern)) return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}
function hostMatchesPattern(host, pattern) {
  const lHost = host.toLowerCase();
  const lPattern = pattern.toLowerCase();
  let patternHost = lPattern;
  try {
    if (lPattern.includes("://")) {
      const url = new URL(lPattern.replace(/\*/g, "WILDCARD"));
      patternHost = url.hostname.replace(/wildcard/g, "*");
    }
  } catch {
  }
  patternHost = patternHost.split("/")[0] ?? patternHost;
  if (patternHost.startsWith("*.")) {
    const suffix = patternHost.slice(2);
    return lHost === suffix || lHost.endsWith("." + suffix);
  }
  return lHost === patternHost || lHost.endsWith("." + patternHost);
}

// packages/backend/src/findings.ts
async function createFinding(sdk, input) {
  try {
    if (input.requestId === void 0 || input.requestId === "") {
      sdk.console.warn(
        `[SupaScan] Skipping finding "${input.title}" \u2014 no evidence request available.`
      );
      return void 0;
    }
    const rr = await sdk.requests.get(input.requestId);
    if (!rr) {
      sdk.console.warn(
        `[SupaScan] Skipping finding "${input.title}" \u2014 request ${input.requestId} not found.`
      );
      return void 0;
    }
    const finding = await sdk.findings.create({
      title: `[${input.severity.toUpperCase()}] ${input.title}`,
      description: input.description,
      reporter: "SupaScan",
      dedupeKey: `supascan:${input.title}`,
      request: rr.request
    });
    return finding.getId();
  } catch (err) {
    sdk.console.error(`[SupaScan] Failed to create finding: ${String(err)}`);
    return void 0;
  }
}
async function reportInstanceDetected(sdk, projectUrl, projectRef, requestId) {
  const id = await createFinding(sdk, {
    title: `[SupaScan] Supabase instance detected: ${projectRef}`,
    description: [
      `A Supabase backend was detected in proxied traffic.`,
      ``,
      `**Project URL:** ${projectUrl}`,
      `**Project ref:** ${projectRef}`,
      ``,
      `Run SupaScan's read / auth / storage / RPC checks against this instance to`,
      `test for missing RLS, open signup, public buckets, and unauthenticated RPCs.`
    ].join("\n"),
    severity: "info",
    requestId
  });
  return id !== void 0;
}
async function reportServiceRoleLeak(sdk, projectUrl, location, requestId) {
  await createFinding(sdk, {
    title: `[SupaScan] CRITICAL: Supabase service_role key leaked`,
    description: [
      `A Supabase \`service_role\` JWT was detected in proxied traffic.`,
      ``,
      `**Project:** ${projectUrl}`,
      `**Location:** ${location}`,
      ``,
      `The \`service_role\` key bypasses all Row Level Security policies and grants full`,
      `database access. This key must never be exposed to the client or logged.`,
      ``,
      `**Immediate action:** Rotate the service_role key in the Supabase dashboard`,
      `under Settings \u2192 API \u2192 Service role secret.`
    ].join("\n"),
    severity: "critical",
    requestId
  });
}
async function reportExposedSchema(sdk, projectUrl, schema, testedAs, severity, requestId) {
  await createFinding(sdk, {
    title: `[SupaScan] Privileged PostgREST schema reachable: "${schema}"`,
    description: [
      `The non-public schema \`${schema}\` is exposed through PostgREST and was`,
      `reachable as the **${testedAs}** role via the \`Accept-Profile: ${schema}\` header.`,
      ``,
      `**Project:** ${projectUrl}`,
      `**Schema:** ${schema}`,
      `**Reachable as:** ${testedAs}`,
      ``,
      `Schemas such as \`auth\`, \`vault\`, \`pgsodium\` and \`storage\` hold credentials,`,
      `secrets and internal data. Exposing them to the \`anon\`/\`authenticated\` role is a`,
      `privilege escalation \u2014 an attacker can read or call privileged objects directly.`,
      ``,
      `**Reproduce:**`,
      "```",
      `GET ${projectUrl}/rest/v1/`,
      `apikey: <anon key>`,
      `Accept-Profile: ${schema}`,
      "```",
      ``,
      `**Remediation:** Remove the schema from PostgREST's exposed schemas`,
      `(Dashboard \u2192 Settings \u2192 API \u2192 "Exposed schemas"), and revoke USAGE/SELECT`,
      `grants on it from \`anon\` and \`authenticated\`.`
    ].join("\n"),
    severity,
    requestId
  });
}
async function reportIdor(sdk, projectUrl, tableName, detail, requestId) {
  await createFinding(sdk, {
    title: `[SupaScan] Broken RLS / IDOR \u2014 "${tableName}" returns the same rows to different users`,
    description: [
      `Two different authenticated users received the **same** rows from`,
      `\`${tableName}\`, so Row Level Security is not scoping data per user.`,
      `An authenticated user can read other users' records (IDOR).`,
      ``,
      `**Project:** ${projectUrl}`,
      `**Table:** ${tableName}`,
      `**Differential:** ${detail}`,
      ``,
      `Note: shared/reference tables (e.g. public catalogs) can legitimately`,
      `return identical rows \u2014 confirm this table holds per-user data.`,
      ``,
      `**Remediation:** Add a SELECT policy scoping rows to the owner, e.g.`,
      "```sql",
      `CREATE POLICY "read own" ON public.${tableName}`,
      `  FOR SELECT USING ((select auth.uid()) = user_id);`,
      "```"
    ].join("\n"),
    severity: "high",
    requestId
  });
}
async function reportMissingRls(sdk, projectUrl, tableName, rowCount, requestId) {
  await createFinding(sdk, {
    title: `[SupaScan] RLS misconfiguration: anonymous read on "${tableName}"`,
    description: [
      `The table \`${tableName}\` returned ${rowCount} row(s) to an unauthenticated`,
      `request using only the public \`anon\` key.`,
      ``,
      `**Project:** ${projectUrl}`,
      `**Table:** ${tableName}`,
      `**Row count exposed:** ${rowCount}`,
      ``,
      `This typically indicates Row Level Security (RLS) is disabled or has an`,
      `overly permissive policy allowing public SELECT access.`,
      ``,
      `**Remediation:** Enable RLS on this table and add a restrictive SELECT policy.`
    ].join("\n"),
    severity: "high",
    requestId
  });
}
async function reportAnonWrite(sdk, projectUrl, tableName, testedAs, requestId) {
  await createFinding(sdk, {
    title: `[SupaScan] RLS misconfiguration: writable via ${testedAs} on "${tableName}"`,
    description: [
      `The table \`${tableName}\` accepted an UPDATE targeting a real row as the`,
      `**${testedAs}** role \u2014 Row Level Security is not preventing writes.`,
      ``,
      `**Project:** ${projectUrl}`,
      `**Table:** ${tableName}`,
      `**Writable as:** ${testedAs}`,
      ``,
      `Safety: the probe set a column to its **current value** and sent`,
      `\`Prefer: tx=rollback\`, so no data was semantically changed. The 200 response`,
      `returning the targeted row confirms the write was permitted by policy.`,
      ``,
      `**Remediation:** Enable RLS and add a restrictive UPDATE policy (USING +`,
      `WITH CHECK), e.g.`,
      "```sql",
      `ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;`,
      `CREATE POLICY "update own" ON public.${tableName}`,
      `  FOR UPDATE USING ((select auth.uid()) = user_id)`,
      `  WITH CHECK ((select auth.uid()) = user_id);`,
      "```"
    ].join("\n"),
    severity: "high",
    requestId
  });
}
async function reportOpenSignup(sdk, projectUrl, requestId) {
  await createFinding(sdk, {
    title: `[SupaScan] Open user registration (signup without restrictions)`,
    description: [
      `The Supabase Auth signup endpoint accepted a new user registration`,
      `without any invite code, CAPTCHA, or domain restriction.`,
      ``,
      `**Project:** ${projectUrl}`,
      ``,
      `This may be intentional for public applications but could allow`,
      `attackers to create large numbers of accounts or abuse free-tier limits.`,
      ``,
      `**Remediation:** Consider enabling "Confirm email" and/or restricting`,
      `signups to specific email domains in Authentication \u2192 Settings.`
    ].join("\n"),
    severity: "medium",
    requestId
  });
}
async function reportPublicBucket(sdk, projectUrl, bucketName, fileCount, sampleFiles, requestId) {
  const sample = sampleFiles.slice(0, 10).map((f) => `  - ${f}`).join("\n");
  await createFinding(sdk, {
    title: `[SupaScan] Public storage bucket "${bucketName}" lists ${fileCount} object(s)`,
    description: [
      `The storage bucket \`${bucketName}\` returned an object listing to an`,
      `unauthenticated request using only the \`anon\` key, exposing file paths.`,
      ``,
      `**Project:** ${projectUrl}`,
      `**Bucket:** ${bucketName}`,
      `**Objects listed:** ${fileCount}`,
      ``,
      `**Sample objects:**`,
      sample,
      ``,
      `Public files are downloadable at:`,
      `\`${projectUrl}/storage/v1/object/public/${bucketName}/<path>\``,
      ``,
      `**Remediation:** Make the bucket private and add storage RLS policies that`,
      `restrict listing/reading to authorized users.`
    ].join("\n"),
    severity: "medium",
    requestId
  });
}
async function reportExposedRpc(sdk, projectUrl, fnName, requestId) {
  await createFinding(sdk, {
    title: `[SupaScan] Unauthenticated RPC function accessible: "${fnName}"`,
    description: [
      `The RPC function \`${fnName}\` responded successfully to an unauthenticated`,
      `call using only the \`anon\` key.`,
      ``,
      `**Project:** ${projectUrl}`,
      `**Function:** ${fnName}`,
      ``,
      `**Remediation:** Ensure this function uses \`SECURITY DEFINER\` carefully`,
      `and add appropriate \`GRANT\` restrictions or RLS policies.`
    ].join("\n"),
    severity: "low",
    requestId
  });
}

// packages/backend/src/fingerprint.ts
async function fingerprintRequest(sdk, registry, requestId, host, path, _method, headers, _body) {
  if (!isSupabaseEndpoint(host, path)) return;
  const projectRef = extractProjectRef(host);
  if (!projectRef) return;
  const projectUrl = normalizeProjectUrl(host);
  const anonKey = extractAnonKey(headers);
  let anonKeyRole;
  if (anonKey) {
    const payload = decodeJwt(anonKey);
    if (payload?.role) {
      anonKeyRole = String(payload.role);
      if (anonKeyRole === "service_role") {
        sdk.console.warn(
          `[SupaScan] service_role key detected in REQUEST headers for ${projectUrl}`
        );
        const existingInst = await registry.getInstance(projectRef);
        if (!existingInst?.serviceRoleLeak) {
          await reportServiceRoleLeak(
            sdk,
            projectUrl,
            "request apikey/Authorization header",
            requestId
          );
          const inst2 = await registry.getInstance(projectRef);
          if (inst2) {
            inst2.serviceRoleLeak = {
              sourceRequestId: requestId,
              location: "request apikey/Authorization header"
            };
            await registry.upsertInstance(inst2);
          }
        }
        return;
      }
    }
  }
  const inScope = await isInScope(sdk, host);
  const existing = await registry.getInstance(projectRef);
  const inst = existing ?? {
    projectRef,
    projectUrl,
    tables: {},
    rpcs: [],
    buckets: [],
    firstSeenRequestId: requestId,
    inScope
  };
  if (!existing) {
    sdk.console.log(`[SupaScan] New Supabase instance discovered: ${projectUrl}`);
  }
  if (anonKey && anonKeyRole !== "service_role") {
    inst.anonKey = anonKey;
    inst.anonKeyRole = anonKeyRole;
  }
  inst.inScope = inScope;
  const tableName = extractTableFromPath(path);
  if (tableName && tableName !== "rpc") {
    if (!inst.tables[tableName]) {
      inst.tables[tableName] = {
        name: tableName,
        observed: true,
        anonRead: "untested",
        anonWrite: "untested",
        evidenceRequestIds: [requestId]
      };
    } else {
      inst.tables[tableName].observed = true;
      if (!inst.tables[tableName].evidenceRequestIds.includes(requestId)) {
        inst.tables[tableName].evidenceRequestIds.push(requestId);
      }
    }
    await registry.upsertTable(projectRef, inst.tables[tableName]);
  }
  const bucketName = extractBucketFromPath(path);
  if (bucketName && !inst.buckets.includes(bucketName)) {
    inst.buckets = [...inst.buckets, bucketName];
  }
  const rpcMatch = /^\/rest\/v1\/rpc\/([^/?]+)/.exec(path);
  if (rpcMatch?.[1] && !inst.rpcs.includes(rpcMatch[1])) {
    inst.rpcs = [...inst.rpcs, rpcMatch[1]];
  }
  if (!inst.detectionFindingRaised) {
    const raised = await reportInstanceDetected(sdk, projectUrl, projectRef, requestId);
    if (raised) inst.detectionFindingRaised = true;
  }
  await registry.upsertInstance(inst);
}
async function fingerprintResponse(sdk, registry, requestId, host, path, _method, _requestHeaders, responseHeaders, responseBody, _statusCode) {
  const hasIndicator = bodyContainsSupabaseIndicator(responseBody);
  if (!isSupabaseEndpoint(host, path) && !hasIndicator) return;
  const jwts = extractJwtsFromBody(responseBody);
  for (const { token, payload } of jwts) {
    if (payload.role === "service_role") {
      sdk.console.error(
        `[SupaScan] CRITICAL: service_role JWT detected in response body from ${host}`
      );
      const projectRef = extractProjectRef(host);
      if (projectRef) {
        const projectUrl = normalizeProjectUrl(host);
        const inst = await registry.getInstance(projectRef);
        if (!inst?.serviceRoleLeak) {
          await reportServiceRoleLeak(
            sdk,
            projectUrl,
            "response body (JWT)",
            requestId
          );
          if (inst) {
            inst.serviceRoleLeak = {
              sourceRequestId: requestId,
              location: "response body (JWT)"
            };
            await registry.upsertInstance(inst);
          } else {
            const inScope = await isInScope(sdk, host);
            const newInst = {
              projectRef,
              projectUrl,
              tables: {},
              rpcs: [],
              buckets: [],
              firstSeenRequestId: requestId,
              inScope,
              serviceRoleLeak: {
                sourceRequestId: requestId,
                location: "response body (JWT)"
              }
            };
            await registry.upsertInstance(newInst);
          }
        }
      } else {
        await reportServiceRoleLeak(
          sdk,
          `https://${host}`,
          `response body (JWT) \u2014 token starts: ${token.slice(0, 20)}...`,
          requestId
        );
      }
    }
  }
  if (hasIndicator || responseBody.includes(".supabase.co")) {
    const refs = extractProjectRefsFromBody(responseBody);
    for (const projectRef of refs) {
      const projectUrl = `https://${projectRef}.supabase.co`;
      const existing = await registry.getInstance(projectRef);
      if (!existing) {
        const inScope = await isInScope(sdk, `${projectRef}.supabase.co`);
        const newInst = {
          projectRef,
          projectUrl,
          tables: {},
          rpcs: [],
          buckets: [],
          firstSeenRequestId: requestId,
          inScope
        };
        const raised = await reportInstanceDetected(sdk, projectUrl, projectRef, requestId);
        if (raised) newInst.detectionFindingRaised = true;
        await registry.upsertInstance(newInst);
        sdk.console.log(
          `[SupaScan] Supabase project URL found in response body from ${host}: ${projectUrl}`
        );
      } else {
        if (!existing.anonKey) {
          const bodyJwts = extractJwtsFromBody(responseBody);
          for (const { token, payload } of bodyJwts) {
            if (payload.role === "anon") {
              existing.anonKey = token;
              existing.anonKeyRole = "anon";
              await registry.upsertInstance(existing);
              break;
            }
          }
        }
      }
    }
    if (refs.length > 0) {
      const bodyJwts = extractJwtsFromBody(responseBody);
      for (const { token, payload } of bodyJwts) {
        if (payload.role === "anon" && payload.ref) {
          const pRef = String(payload.ref).toLowerCase();
          const inst = await registry.getInstance(pRef);
          if (inst && !inst.anonKey) {
            inst.anonKey = token;
            inst.anonKeyRole = "anon";
            await registry.upsertInstance(inst);
          }
        }
      }
    }
  }
  const contentRange = findHeader(responseHeaders, "content-range");
  if (contentRange && isSupabaseEndpoint(host, path)) {
    const tableName = extractTableFromPath(path);
    const projectRef = extractProjectRef(host);
    if (tableName && projectRef) {
      const rangeMatch = /\/(\d+)$/.exec(contentRange);
      if (rangeMatch?.[1]) {
        const total = parseInt(rangeMatch[1], 10);
        const inst = await registry.getInstance(projectRef);
        if (inst?.tables[tableName]) {
          inst.tables[tableName].rowCount = total;
          await registry.upsertTable(projectRef, inst.tables[tableName]);
        }
      }
    }
  }
}
function headersToRecord(headers) {
  const result = {};
  for (const [k, v] of Object.entries(headers)) {
    const val = Array.isArray(v) ? v[0] : v;
    if (val !== void 0) {
      result[k.toLowerCase()] = val;
    }
  }
  return result;
}

// packages/backend/src/probes/read.ts
import { RequestSpec } from "caido:utils";
var COMMON_TABLES = [
  "users",
  "profiles",
  "accounts",
  "user_profiles",
  "customers",
  "posts",
  "comments",
  "messages",
  "chats",
  "conversations",
  "products",
  "orders",
  "order_items",
  "payments",
  "invoices",
  "subscriptions",
  "transactions",
  "carts",
  "wishlists",
  "coupons",
  "todos",
  "tasks",
  "notes",
  "projects",
  "teams",
  "organizations",
  "members",
  "roles",
  "permissions",
  "sessions",
  "notifications",
  "settings",
  "config",
  "logs",
  "events",
  "files",
  "documents",
  "images",
  "uploads",
  "media",
  "categories",
  "tags",
  "likes",
  "follows",
  "reviews",
  "ratings",
  "addresses",
  "contacts",
  "leads",
  "tickets",
  "employees",
  "companies",
  "articles",
  "blogs",
  "pages",
  "waitlist",
  "subscribers",
  "newsletter",
  "feedback",
  "emails",
  "api_keys",
  "secrets",
  "tokens",
  "credentials",
  "password_resets"
];
async function runReadChecks(sdk, registry, limiter, projectRef, onProgress) {
  const instance = await registry.getInstance(projectRef);
  if (!instance) {
    onProgress("Instance not found.");
    return;
  }
  const { projectUrl, tables } = instance;
  if (!hasUsableCreds(instance)) {
    onProgress("No credentials (anon key or session) \u2014 cannot run read checks.");
    return;
  }
  const creds = credsFor(instance);
  const active = activeSession(instance);
  if (active) {
    onProgress(`Running as authenticated session: ${active.email}`);
  }
  const settings = limiter.getSettings();
  const candidates = settings.discoveryEnabled ? settings.useCustomWordlist ? parseWordlist(settings.tableWordlist) : COMMON_TABLES : [];
  const observed = Object.keys(tables);
  const queue = [.../* @__PURE__ */ new Set([...observed, ...candidates])];
  const seen = new Set(queue);
  if (queue.length === 0) {
    onProgress("No observed tables and discovery is disabled \u2014 nothing to check.");
    return;
  }
  while (queue.length > 0) {
    const tableName = queue.shift();
    if (tableName === void 0) break;
    if (limiter.isKilled()) {
      onProgress("Stopped by kill switch.");
      return;
    }
    const wasObserved = tables[tableName] !== void 0;
    onProgress(`Checking table: ${tableName}`);
    const rowResult = await fetchOneRow(sdk, limiter, projectUrl, creds, tableName);
    if (limiter.isKilled()) return;
    if (rowResult === void 0) {
      continue;
    }
    if (rowResult.statusCode === 404) {
      const hint = extractHintTable(rowResult.body);
      if (hint !== void 0 && !seen.has(hint)) {
        seen.add(hint);
        queue.push(hint);
        onProgress(`Hint: '${tableName}' suggests real table '${hint}' \u2014 queued`);
      }
      if (!wasObserved) continue;
    }
    const tableState = tables[tableName] ?? {
      name: tableName,
      observed: false,
      anonRead: "untested",
      anonWrite: "untested",
      evidenceRequestIds: []
    };
    const updatedTable = { ...tableState };
    if (rowResult.statusCode === 200 && rowResult.body !== void 0) {
      let parsed;
      try {
        parsed = JSON.parse(rowResult.body);
      } catch {
        parsed = null;
      }
      if (Array.isArray(parsed) && parsed.length > 0) {
        updatedTable.anonRead = "rows";
        const firstRow = parsed[0];
        if (firstRow && typeof firstRow === "object") {
          updatedTable.columns = Object.keys(firstRow);
        }
        updatedTable.sampleRow = JSON.stringify(firstRow, null, 2);
        const countResult = await fetchCount(sdk, limiter, projectUrl, creds, tableName);
        if (countResult !== void 0) {
          updatedTable.rowCount = countResult.total;
          if (countResult.requestId) {
            updatedTable.evidenceRequestIds = [
              .../* @__PURE__ */ new Set([...updatedTable.evidenceRequestIds, countResult.requestId])
            ];
          }
        }
        if (rowResult.requestId) {
          updatedTable.evidenceRequestIds = [
            .../* @__PURE__ */ new Set([...updatedTable.evidenceRequestIds, rowResult.requestId])
          ];
        }
        await reportMissingRls(
          sdk,
          projectUrl,
          tableName,
          updatedTable.rowCount ?? parsed.length,
          rowResult.requestId ?? ""
        );
        onProgress(
          `FINDING: ${tableName} is readable (${updatedTable.rowCount ?? "?"} rows)`
        );
      } else if (Array.isArray(parsed) && parsed.length === 0) {
        updatedTable.anonRead = "empty";
        onProgress(`${tableName}: empty result (RLS may restrict, or table is empty)`);
      } else {
        updatedTable.anonRead = "denied";
        onProgress(`${tableName}: access denied`);
      }
    } else if (rowResult.statusCode === 401 || rowResult.statusCode === 403 || rowResult.statusCode === 404) {
      updatedTable.anonRead = "denied";
      onProgress(`${tableName}: access denied (${rowResult.statusCode})`);
    } else {
      onProgress(`${tableName}: unexpected status ${String(rowResult.statusCode)}`);
    }
    await registry.upsertTable(projectRef, updatedTable);
  }
  onProgress("Read checks complete.");
}
async function fetchOneRow(sdk, limiter, projectUrl, creds, tableName) {
  const allowed = await limiter.acquire();
  if (!allowed) return void 0;
  try {
    const url = `${projectUrl}/rest/v1/${tableName}?select=*&limit=1`;
    const spec = new RequestSpec(url);
    spec.setMethod("GET");
    spec.setHeader("apikey", creds.apikey);
    spec.setHeader("Authorization", `Bearer ${creds.bearer}`);
    spec.setHeader("Accept", "application/json");
    const result = await sdk.requests.send(spec);
    const statusCode = result.response?.getCode() ?? 0;
    const body = result.response?.getBody()?.toText() ?? "";
    const requestId = result.request?.getId() ?? "";
    return { statusCode, body, requestId };
  } catch (err) {
    sdk.console.error(`[SupaScan] Read probe error for ${tableName}: ${String(err)}`);
    return void 0;
  } finally {
    limiter.release();
  }
}
async function fetchCount(sdk, limiter, projectUrl, creds, tableName) {
  const allowed = await limiter.acquire();
  if (!allowed) return void 0;
  try {
    const url = `${projectUrl}/rest/v1/${tableName}?select=*`;
    const spec = new RequestSpec(url);
    spec.setMethod("GET");
    spec.setHeader("apikey", creds.apikey);
    spec.setHeader("Authorization", `Bearer ${creds.bearer}`);
    spec.setHeader("Accept", "application/json");
    spec.setHeader("Prefer", "count=exact");
    spec.setHeader("Range", "0-0");
    const result = await sdk.requests.send(spec);
    const requestId = result.request?.getId() ?? "";
    const contentRange = result.response?.getHeader("content-range")?.[0];
    if (contentRange !== void 0) {
      const m = /\/(\d+)$/.exec(contentRange);
      if (m?.[1]) {
        return { total: parseInt(m[1], 10), requestId };
      }
    }
    return void 0;
  } catch (err) {
    sdk.console.error(`[SupaScan] Count probe error for ${tableName}: ${String(err)}`);
    return void 0;
  } finally {
    limiter.release();
  }
}

// packages/backend/src/probes/write.ts
import { RequestSpec as RequestSpec2 } from "caido:utils";
async function runWriteProbes(sdk, registry, limiter, projectRef, onProgress) {
  const instance = await registry.getInstance(projectRef);
  if (!instance) {
    onProgress("Instance not found.");
    return;
  }
  const { projectUrl, tables } = instance;
  if (!hasUsableCreds(instance)) {
    onProgress("No credentials (anon key or session) \u2014 cannot run write probes.");
    return;
  }
  const creds = credsFor(instance);
  const active = activeSession(instance);
  const testedAs = active?.email ?? "anon";
  if (active) onProgress(`Running as authenticated session: ${active.email}`);
  const settings = limiter.getSettings();
  const candidates = settings.discoveryEnabled ? settings.useCustomWordlist ? parseWordlist(settings.tableWordlist) : COMMON_TABLES : [];
  const observed = Object.keys(tables);
  const queue = [.../* @__PURE__ */ new Set([...observed, ...candidates])];
  const seen = new Set(queue);
  if (queue.length === 0) {
    onProgress("No observed tables and discovery is disabled \u2014 nothing to check.");
    return;
  }
  while (queue.length > 0) {
    const tableName = queue.shift();
    if (tableName === void 0) break;
    if (limiter.isKilled()) {
      onProgress("Stopped by kill switch.");
      return;
    }
    const wasObserved = tables[tableName] !== void 0;
    onProgress(`Write probe on table: ${tableName}`);
    const sample = await fetchSampleRow(sdk, limiter, projectUrl, creds, tableName);
    if (sample === void 0) continue;
    if (sample.statusCode === 404) {
      const hint = extractHintTable(sample.body);
      if (hint !== void 0 && !seen.has(hint)) {
        seen.add(hint);
        queue.push(hint);
        onProgress(`Hint: '${tableName}' suggests real table '${hint}' \u2014 queued`);
      }
      if (!wasObserved) continue;
    }
    if (sample.row === void 0) {
      onProgress(`${tableName}: no readable row to target \u2014 skipping write test`);
      continue;
    }
    const plan = buildWritePlan(sample.row);
    if (plan === void 0) {
      onProgress(`${tableName}: no benign column to test writes against \u2014 skipping`);
      continue;
    }
    if (limiter.isKilled()) {
      onProgress("Stopped by kill switch.");
      return;
    }
    const result = await sendWrite(sdk, limiter, projectUrl, creds, tableName, plan);
    if (result === void 0) continue;
    const table = tables[tableName] ?? {
      name: tableName,
      observed: false,
      anonRead: "untested",
      anonWrite: "untested",
      evidenceRequestIds: []
    };
    const updatedTable = { ...table };
    const writable = result.statusCode === 200 && Array.isArray(result.parsed) && result.parsed.length > 0;
    const denied = result.statusCode === 401 || result.statusCode === 403 || result.statusCode === 200 && Array.isArray(result.parsed) && result.parsed.length === 0;
    if (writable) {
      updatedTable.anonWrite = "accepted";
      if (result.requestId) {
        updatedTable.evidenceRequestIds = [
          .../* @__PURE__ */ new Set([...updatedTable.evidenceRequestIds, result.requestId])
        ];
      }
      await reportAnonWrite(sdk, projectUrl, tableName, testedAs, result.requestId);
      onProgress(`FINDING: ${tableName} is writable as ${testedAs} (row update permitted, rolled back)`);
      await registry.upsertTable(projectRef, updatedTable);
    } else if (denied) {
      updatedTable.anonWrite = "rejected";
      onProgress(`${tableName}: write rejected (${result.statusCode}${result.statusCode === 200 ? " \u2014 RLS filtered" : ""})`);
      await registry.upsertTable(projectRef, updatedTable);
    } else {
      onProgress(`${tableName}: inconclusive write result (${result.statusCode})`);
    }
  }
  onProgress("Write probes complete.");
}
async function fetchSampleRow(sdk, limiter, projectUrl, creds, tableName) {
  const allowed = await limiter.acquire();
  if (!allowed) return void 0;
  try {
    const url = `${projectUrl}/rest/v1/${tableName}?select=*&limit=1`;
    const spec = new RequestSpec2(url);
    spec.setMethod("GET");
    spec.setHeader("apikey", creds.apikey);
    spec.setHeader("Authorization", `Bearer ${creds.bearer}`);
    spec.setHeader("Accept", "application/json");
    const result = await sdk.requests.send(spec);
    const statusCode = result.response?.getCode() ?? 0;
    const body = result.response?.getBody()?.toText() ?? "";
    const requestId = result.request?.getId() ?? "";
    let row;
    try {
      const parsed = JSON.parse(body);
      if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "object" && parsed[0] !== null) {
        row = parsed[0];
      }
    } catch {
    }
    return { statusCode, body, row, requestId };
  } catch (err) {
    sdk.console.error(`[SupaScan] Write sample fetch error for ${tableName}: ${String(err)}`);
    return void 0;
  } finally {
    limiter.release();
  }
}
var TIMESTAMP_COLS = /* @__PURE__ */ new Set([
  "created_at",
  "updated_at",
  "inserted_at",
  "deleted_at",
  "modified_at"
]);
function buildWritePlan(row) {
  const scalarKeys = Object.keys(row).filter((k) => isScalar(row[k]));
  if (scalarKeys.length === 0) return void 0;
  const filterCol = scalarKeys.includes("id") ? "id" : scalarKeys[0];
  const filterVal = String(row[filterCol]);
  const targetCol = scalarKeys.find(
    (k) => k !== filterCol && !/_id$/i.test(k) && !TIMESTAMP_COLS.has(k.toLowerCase()) && row[k] !== null
  );
  if (targetCol === void 0) return void 0;
  return { filterCol, filterVal, targetCol, targetVal: row[targetCol] };
}
function isScalar(v) {
  return typeof v === "string" || typeof v === "number" || typeof v === "boolean";
}
async function sendWrite(sdk, limiter, projectUrl, creds, tableName, plan) {
  const allowed = await limiter.acquire();
  if (!allowed) return void 0;
  try {
    const url = `${projectUrl}/rest/v1/${tableName}?${plan.filterCol}=eq.${encodeURIComponent(plan.filterVal)}`;
    const spec = new RequestSpec2(url);
    spec.setMethod("PATCH");
    spec.setHeader("apikey", creds.apikey);
    spec.setHeader("Authorization", `Bearer ${creds.bearer}`);
    spec.setHeader("Content-Type", "application/json");
    spec.setHeader("Prefer", "tx=rollback,return=representation");
    spec.setBody(JSON.stringify({ [plan.targetCol]: plan.targetVal }));
    const result = await sdk.requests.send(spec);
    const statusCode = result.response?.getCode() ?? 0;
    const requestId = result.request?.getId() ?? "";
    const body = result.response?.getBody()?.toText() ?? "";
    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch {
      parsed = void 0;
    }
    return { statusCode, requestId, parsed };
  } catch (err) {
    sdk.console.error(`[SupaScan] Write probe error for ${tableName}: ${String(err)}`);
    return void 0;
  } finally {
    limiter.release();
  }
}

// packages/backend/src/probes/auth.ts
import { RequestSpec as RequestSpec3 } from "caido:utils";
async function runAuthCheck(sdk, registry, limiter, projectRef, onProgress) {
  const instance = await registry.getInstance(projectRef);
  if (!instance) {
    onProgress("Instance not found.");
    return;
  }
  const { projectUrl } = instance;
  const apikey = apiKeyFor(instance);
  if (apikey.length === 0) {
    onProgress("No credentials (anon key or session) \u2014 cannot run auth check.");
    return;
  }
  const configuredEmail = limiter.getSettings().testEmail;
  const testEmail = configuredEmail.includes("{rand}") ? configuredEmail.replace("{rand}", randomString(8).toLowerCase()) : configuredEmail;
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
    const spec = new RequestSpec3(url);
    spec.setMethod("POST");
    spec.setHeader("apikey", apikey);
    spec.setHeader("Content-Type", "application/json");
    spec.setBody(
      JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    );
    const result = await sdk.requests.send(spec);
    const statusCode = result.response?.getCode() ?? 0;
    const body = result.response?.getBody()?.toText() ?? "";
    const requestId = result.request?.getId() ?? "";
    onProgress(`Signup response: ${statusCode}`);
    if (statusCode === 200 || statusCode === 201) {
      let parsed;
      try {
        parsed = JSON.parse(body);
      } catch {
        parsed = null;
      }
      const isSignupSuccess = parsed !== null && typeof parsed === "object" && ("access_token" in parsed || "id" in parsed);
      if (isSignupSuccess) {
        await reportOpenSignup(sdk, projectUrl, requestId);
        onProgress("FINDING: Open signup is enabled.");
      } else {
        onProgress("Signup returned 200 but no access_token \u2014 may require email confirmation.");
      }
    } else if (statusCode === 400) {
      let errMsg = "";
      try {
        const p = JSON.parse(body);
        errMsg = p.msg ?? p.message ?? "";
      } catch {
        errMsg = body.slice(0, 100);
      }
      onProgress(`Signup rejected (400): ${errMsg}`);
    } else if (statusCode === 422) {
      onProgress(`Signup rejected (422 \u2014 validation error or disabled)`);
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
function extractAccessToken(body) {
  try {
    const parsed = JSON.parse(body);
    if (typeof parsed.access_token === "string" && parsed.access_token.length > 0) {
      return parsed.access_token;
    }
  } catch {
  }
  return void 0;
}
async function runCustomSignup(sdk, registry, limiter, projectRef, email, password, dataJson) {
  const instance = await registry.getInstance(projectRef);
  if (!instance) return { ok: false, error: "Instance not found." };
  const { projectUrl } = instance;
  const apikey = apiKeyFor(instance);
  if (apikey.length === 0) return { ok: false, error: "No credentials (anon key or session) for this instance." };
  if (email.trim().length === 0) return { ok: false, error: "Email is required." };
  let extraData;
  if (dataJson.trim().length > 0) {
    try {
      extraData = JSON.parse(dataJson);
    } catch {
      return { ok: false, error: "Extra data is not valid JSON." };
    }
  }
  const allowed = await limiter.acquire();
  if (!allowed) return { ok: false, error: "Rate limited or stopped." };
  try {
    const url = `${projectUrl}/auth/v1/signup`;
    const spec = new RequestSpec3(url);
    spec.setMethod("POST");
    spec.setHeader("apikey", apikey);
    spec.setHeader("Content-Type", "application/json");
    const reqBody = { email: email.trim(), password };
    if (extraData !== void 0) reqBody.data = extraData;
    spec.setBody(JSON.stringify(reqBody));
    const result = await sdk.requests.send(spec);
    const statusCode = result.response?.getCode() ?? 0;
    const body = result.response?.getBody()?.toText() ?? "";
    const token = extractAccessToken(body);
    let sessionSet = false;
    if (token !== void 0) {
      addUserToInstance(instance, email.trim(), token, "signup");
      await registry.upsertInstance(instance);
      sessionSet = true;
    }
    return { ok: true, statusCode, body, hasToken: token !== void 0, sessionSet };
  } catch (err) {
    return { ok: false, error: String(err) };
  } finally {
    limiter.release();
  }
}
async function runSignIn(sdk, registry, limiter, projectRef, email, password) {
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
    const spec = new RequestSpec3(url);
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

// packages/backend/src/probes/rpc.ts
import { RequestSpec as RequestSpec4 } from "caido:utils";
async function runRpcCheck(sdk, registry, limiter, projectRef, onProgress) {
  const instance = await registry.getInstance(projectRef);
  if (!instance) {
    onProgress("Instance not found.");
    return;
  }
  const { projectUrl } = instance;
  if (!hasUsableCreds(instance)) {
    onProgress("No credentials (anon key or session) \u2014 cannot run RPC check.");
    return;
  }
  const creds = credsFor(instance);
  const active = activeSession(instance);
  if (active) {
    onProgress(`Running as authenticated session: ${active.email}`);
  }
  onProgress("Fetching OpenAPI spec to enumerate RPC functions...");
  const enumerated = await enumFunctions(sdk, limiter, projectUrl, creds);
  if (enumerated === void 0) {
    onProgress("Could not fetch OpenAPI spec \u2014 falling back to observed RPCs.");
  } else if (enumerated.length > 0) {
    onProgress(`OpenAPI exposed ${enumerated.length} function(s).`);
  }
  const functions = [.../* @__PURE__ */ new Set([...enumerated ?? [], ...instance.rpcs])];
  if (functions.length === 0) {
    onProgress("No RPC functions found (none in OpenAPI or observed in traffic).");
    return;
  }
  onProgress(`Testing ${functions.length} RPC function(s): ${functions.join(", ")}`);
  const inst = await registry.getInstance(projectRef);
  if (inst) {
    inst.rpcs = [.../* @__PURE__ */ new Set([...inst.rpcs, ...functions])];
    await registry.upsertInstance(inst);
  }
  for (const fnName of functions) {
    if (limiter.isKilled()) {
      onProgress("Stopped by kill switch.");
      return;
    }
    onProgress(`Testing RPC: ${fnName}`);
    const result = await callRpc(sdk, limiter, projectUrl, creds, fnName);
    if (result === void 0) continue;
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
async function recordRpc(registry, projectRef, name, status, exposed) {
  const inst = await registry.getInstance(projectRef);
  if (!inst) return;
  inst.rpcStates = { ...inst.rpcStates ?? {} };
  inst.rpcStates[name] = { name, status, exposed };
  await registry.upsertInstance(inst);
}
async function enumFunctions(sdk, limiter, projectUrl, creds) {
  const allowed = await limiter.acquire();
  if (!allowed) return void 0;
  try {
    const url = `${projectUrl}/rest/v1/`;
    const spec = new RequestSpec4(url);
    spec.setMethod("GET");
    spec.setHeader("apikey", creds.apikey);
    spec.setHeader("Authorization", `Bearer ${creds.bearer}`);
    spec.setHeader("Accept", "application/openapi+json");
    const result = await sdk.requests.send(spec);
    const statusCode = result.response?.getCode() ?? 0;
    if (statusCode !== 200) return [];
    const body = result.response?.getBody()?.toText() ?? "";
    let openApi;
    try {
      openApi = JSON.parse(body);
    } catch {
      return [];
    }
    const functions = [];
    if (openApi && typeof openApi === "object" && "paths" in openApi && openApi.paths && typeof openApi.paths === "object") {
      for (const path of Object.keys(openApi.paths)) {
        const m = /^\/rpc\/(.+)$/.exec(path);
        if (m?.[1]) {
          functions.push(m[1]);
        }
      }
    }
    return functions;
  } catch (err) {
    sdk.console.error(`[SupaScan] RPC enum error: ${String(err)}`);
    return void 0;
  } finally {
    limiter.release();
  }
}
async function callRpc(sdk, limiter, projectUrl, creds, fnName) {
  const allowed = await limiter.acquire();
  if (!allowed) return void 0;
  try {
    const url = `${projectUrl}/rest/v1/rpc/${fnName}`;
    const spec = new RequestSpec4(url);
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
    return void 0;
  } finally {
    limiter.release();
  }
}
var COMMON_RPCS = [
  "get_user",
  "get_users",
  "get_current_user",
  "current_user_id",
  "whoami",
  "is_admin",
  "is_authenticated",
  "is_super_admin",
  "has_role",
  "check_role",
  "create_user",
  "update_user",
  "delete_user",
  "list_users",
  "search_users",
  "get_profile",
  "update_profile",
  "handle_new_user",
  "reset_password",
  "set_role",
  "grant_admin",
  "make_admin",
  "promote_user",
  "set_config",
  "get_config",
  "get_secret",
  "get_secrets",
  "read_secret",
  "get_api_key",
  "vault_decrypt",
  "decrypt",
  "encrypt",
  "decrypt_secret",
  "http",
  "http_get",
  "http_post",
  "http_request",
  "fetch_url",
  "get_url",
  "pg_read_file",
  "pg_ls_dir",
  "exec",
  "exec_sql",
  "execute_sql",
  "run_sql",
  "query",
  "raw_query",
  "admin",
  "backup",
  "export_data",
  "import_data",
  "send_email",
  "send_sms",
  "get_balance",
  "transfer",
  "process_payment"
];
async function runRpcBruteforce(sdk, registry, limiter, projectRef, wordlist, onProgress) {
  const instance = await registry.getInstance(projectRef);
  if (!instance) {
    onProgress("Instance not found.");
    return;
  }
  if (!hasUsableCreds(instance)) {
    onProgress("No credentials (anon key or session) \u2014 cannot brute-force RPCs.");
    return;
  }
  const creds = credsFor(instance);
  const active = activeSession(instance);
  if (active) onProgress(`Running as authenticated session: ${active.email}`);
  const { projectUrl } = instance;
  const custom = parseWordlist(wordlist);
  const queue = [.../* @__PURE__ */ new Set([...custom, ...COMMON_RPCS, ...instance.rpcs])];
  const seen = new Set(queue);
  onProgress(`Brute-forcing ${queue.length} RPC name(s)...`);
  let found = 0;
  while (queue.length > 0) {
    const fnName = queue.shift();
    if (fnName === void 0) break;
    if (limiter.isKilled()) {
      onProgress("Stopped by kill switch.");
      return;
    }
    const result = await callRpc(sdk, limiter, projectUrl, creds, fnName);
    if (result === void 0) continue;
    const hint = extractHintFunction(result.body);
    if (hint !== void 0 && !seen.has(hint)) {
      seen.add(hint);
      queue.push(hint);
      onProgress(`Hint: '${fnName}' \u2192 real function '${hint}' (queued)`);
    }
    const exposed = result.statusCode === 200 || result.statusCode === 204;
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
  onProgress(`RPC brute-force complete \u2014 ${found} function(s) found.`);
}

// packages/backend/src/probes/storage.ts
import { RequestSpec as RequestSpec5 } from "caido:utils";
var COMMON_BUCKETS = [
  "avatars",
  "public",
  "files",
  "uploads",
  "images",
  "media",
  "assets",
  "documents",
  "photos",
  "attachments",
  "videos",
  "audio",
  "thumbnails",
  "profile-pictures",
  "profile_pictures",
  "user-uploads",
  "user_uploads",
  "private",
  "backups",
  "exports",
  "temp",
  "logos",
  "banners",
  "products"
];
var MAX_FILES = 300;
var MAX_REQUESTS = 60;
var MAX_DEPTH = 5;
var PAGE = 100;
async function runStorageEnum(sdk, registry, limiter, projectRef, bucketWordlist, onProgress) {
  const instance = await registry.getInstance(projectRef);
  if (!instance) {
    onProgress("Instance not found.");
    return;
  }
  if (!hasUsableCreds(instance)) {
    onProgress("No credentials (anon key or session) \u2014 cannot enumerate storage.");
    return;
  }
  const creds = credsFor(instance);
  const active = activeSession(instance);
  if (active) onProgress(`Running as authenticated session: ${active.email}`);
  const custom = parseWordlist(bucketWordlist);
  const bruteforce = limiter.getSettings().discoveryEnabled ? COMMON_BUCKETS : [];
  const candidates = [.../* @__PURE__ */ new Set([...instance.buckets, ...custom, ...bruteforce])];
  onProgress(`Enumerating objects across ${candidates.length} bucket(s)...`);
  const { projectUrl } = instance;
  let bucketsWithFiles = 0;
  for (const bucket of candidates) {
    if (limiter.isKilled()) {
      onProgress("Stopped by kill switch.");
      return;
    }
    onProgress(`Listing objects in bucket: ${bucket}`);
    const listing = await listBucketRecursive(sdk, limiter, projectUrl, creds, bucket);
    if (listing === void 0) continue;
    if (listing.files.length > 0) {
      bucketsWithFiles++;
      await recordBucket(registry, projectRef, bucket, listing.files);
      await reportPublicBucket(
        sdk,
        projectUrl,
        bucket,
        listing.files.length,
        listing.files.map((f) => f.path),
        listing.requestId
      );
      onProgress(`FINDING: bucket "${bucket}" exposes ${listing.files.length} object(s)`);
    } else {
      onProgress(`Bucket "${bucket}": no objects listed (empty, private, or non-existent)`);
    }
  }
  onProgress(`Storage enumeration complete \u2014 ${bucketsWithFiles} bucket(s) exposing files.`);
}
async function listBucketRecursive(sdk, limiter, projectUrl, creds, bucket) {
  const files = [];
  const queue = [""];
  const seen = /* @__PURE__ */ new Set([""]);
  let requests = 0;
  let firstRequestId = "";
  let firstOk = false;
  while (queue.length > 0 && files.length < MAX_FILES && requests < MAX_REQUESTS) {
    if (limiter.isKilled()) break;
    const prefix = queue.shift();
    if (prefix === void 0) break;
    const page = await listObjects(sdk, limiter, projectUrl, creds, bucket, prefix);
    requests++;
    if (page === void 0) {
      if (prefix === "") return void 0;
      continue;
    }
    if (prefix === "") {
      firstRequestId = page.requestId;
      firstOk = true;
    }
    const depth = prefix.length === 0 ? 0 : prefix.split("/").filter((p) => p.length > 0).length;
    for (const entry of page.entries) {
      if (entry.isFolder) {
        if (depth >= MAX_DEPTH) continue;
        const folderPrefix = `${prefix}${entry.name}/`;
        if (!seen.has(folderPrefix)) {
          seen.add(folderPrefix);
          queue.push(folderPrefix);
        }
      } else {
        files.push({ path: `${prefix}${entry.name}`, size: entry.size, mimetype: entry.mimetype });
        if (files.length >= MAX_FILES) break;
      }
    }
  }
  if (!firstOk) return void 0;
  return { files, requestId: firstRequestId };
}
async function listObjects(sdk, limiter, projectUrl, creds, bucket, prefix) {
  const allowed = await limiter.acquire();
  if (!allowed) return void 0;
  try {
    const spec = new RequestSpec5(`${projectUrl}/storage/v1/object/list/${bucket}`);
    spec.setMethod("POST");
    spec.setHeader("apikey", creds.apikey);
    spec.setHeader("Authorization", `Bearer ${creds.bearer}`);
    spec.setHeader("Content-Type", "application/json");
    spec.setBody(
      JSON.stringify({
        prefix,
        limit: PAGE,
        offset: 0,
        sortBy: { column: "name", order: "asc" }
      })
    );
    const result = await sdk.requests.send(spec);
    const statusCode = result.response?.getCode() ?? 0;
    const requestId = result.request?.getId() ?? "";
    if (statusCode !== 200) return void 0;
    const body = result.response?.getBody()?.toText() ?? "";
    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch {
      return { entries: [], requestId };
    }
    if (!Array.isArray(parsed)) return { entries: [], requestId };
    const entries = [];
    for (const raw of parsed) {
      if (raw === null || typeof raw !== "object") continue;
      const obj = raw;
      if (typeof obj.name !== "string") continue;
      const isFolder = obj.id === null || obj.id === void 0;
      const size = typeof obj.metadata?.size === "number" ? obj.metadata.size : void 0;
      const mimetype = typeof obj.metadata?.mimetype === "string" ? obj.metadata.mimetype : void 0;
      entries.push({ name: obj.name, isFolder, size, mimetype });
    }
    return { entries, requestId };
  } catch (err) {
    sdk.console.error(`[SupaScan] Storage list error for ${bucket}/${prefix}: ${String(err)}`);
    return void 0;
  } finally {
    limiter.release();
  }
}
async function recordBucket(registry, projectRef, name, files) {
  const inst = await registry.getInstance(projectRef);
  if (!inst) return;
  if (!inst.buckets.includes(name)) inst.buckets = [...inst.buckets, name];
  inst.bucketStates = { ...inst.bucketStates ?? {} };
  inst.bucketStates[name] = { name, fileCount: files.length, files: files.slice(0, 100) };
  await registry.upsertInstance(inst);
}

// packages/backend/src/probes/idor.ts
import { RequestSpec as RequestSpec6 } from "caido:utils";
async function runIdorCheck(sdk, registry, limiter, projectRef, onProgress) {
  const instance = await registry.getInstance(projectRef);
  if (!instance) {
    onProgress("Instance not found.");
    return;
  }
  const apikey = apiKeyFor(instance);
  if (apikey.length === 0) {
    onProgress("No credentials (anon key or session) \u2014 cannot run IDOR check.");
    return;
  }
  const sessions = instance.sessions ?? [];
  if (sessions.length < 2) {
    onProgress("IDOR check needs at least 2 sessions on this instance.");
    return;
  }
  const tableNames = Object.keys(instance.tables);
  if (tableNames.length === 0) {
    onProgress("No known tables yet \u2014 run Read Checks first to discover tables.");
    return;
  }
  const identities = [
    ...sessions.map((s) => ({ label: s.email, bearer: s.token, isUser: true }))
  ];
  if (instance.anonKey !== void 0) {
    identities.push({ label: "anon", bearer: instance.anonKey, isUser: false });
  }
  const { projectUrl } = instance;
  for (const tableName of tableNames) {
    if (limiter.isKilled()) {
      onProgress("Stopped by kill switch.");
      return;
    }
    onProgress(`IDOR diff: ${tableName}`);
    const perUser = [];
    let evidenceRequestId = "";
    for (const id of identities) {
      if (limiter.isKilled()) return;
      const r = await fetchCountAndSample(sdk, limiter, projectUrl, apikey, id.bearer, tableName);
      if (r === void 0) continue;
      perUser.push({ label: id.label, rowCount: r.count, sampleId: r.sampleId });
      if (r.requestId.length > 0) evidenceRequestId = r.requestId;
    }
    if (perUser.length === 0) continue;
    const userRows = perUser.filter(
      (p) => identities.find((i) => i.label === p.label)?.isUser && p.rowCount > 0
    );
    let shared = false;
    for (let a = 0; a < userRows.length && !shared; a++) {
      for (let b = a + 1; b < userRows.length; b++) {
        const ua = userRows[a];
        const ub = userRows[b];
        const sameCount = ua.rowCount === ub.rowCount;
        const sameSample = ua.sampleId === ub.sampleId;
        if (sameCount && sameSample) {
          shared = true;
          break;
        }
      }
    }
    const idor = { perUser, shared };
    const table = instance.tables[tableName] ?? {
      name: tableName,
      observed: false,
      anonRead: "untested",
      anonWrite: "untested",
      evidenceRequestIds: []
    };
    await registry.upsertTable(projectRef, { ...table, idor });
    const summary = perUser.map((p) => `${p.label}:${p.rowCount}`).join(", ");
    if (shared) {
      await reportIdor(sdk, projectUrl, tableName, summary, evidenceRequestId);
      onProgress(`FINDING: ${tableName} returns identical rows to multiple users (${summary})`);
    } else {
      onProgress(`${tableName}: per-user reads differ (${summary})`);
    }
  }
  onProgress("IDOR check complete.");
}
async function fetchCountAndSample(sdk, limiter, projectUrl, apikey, bearer, tableName) {
  const allowed = await limiter.acquire();
  if (!allowed) return void 0;
  try {
    const url = `${projectUrl}/rest/v1/${tableName}?select=*&limit=1`;
    const spec = new RequestSpec6(url);
    spec.setMethod("GET");
    spec.setHeader("apikey", apikey);
    spec.setHeader("Authorization", `Bearer ${bearer}`);
    spec.setHeader("Accept", "application/json");
    spec.setHeader("Prefer", "count=exact");
    const result = await sdk.requests.send(spec);
    const requestId = result.request?.getId() ?? "";
    const body = result.response?.getBody()?.toText() ?? "";
    let count = 0;
    const contentRange = result.response?.getHeader("content-range")?.[0];
    if (contentRange !== void 0) {
      const m = /\/(\d+)$/.exec(contentRange);
      if (m?.[1]) count = parseInt(m[1], 10);
    }
    let sampleId;
    try {
      const parsed = JSON.parse(body);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const first = parsed[0];
        if (first.id !== void 0) sampleId = String(first.id);
        else sampleId = JSON.stringify(first).slice(0, 80);
      }
    } catch {
    }
    return { count, sampleId, requestId };
  } catch (err) {
    sdk.console.error(`[SupaScan] IDOR probe error for ${tableName}: ${String(err)}`);
    return void 0;
  } finally {
    limiter.release();
  }
}

// packages/backend/src/probes/roles.ts
import { RequestSpec as RequestSpec7 } from "caido:utils";
var PRIVILEGED_SCHEMAS = [
  { name: "auth", sensitivity: "critical" },
  { name: "vault", sensitivity: "critical" },
  { name: "pgsodium", sensitivity: "critical" },
  { name: "pgsodium_masks", sensitivity: "critical" },
  { name: "secrets", sensitivity: "critical" },
  { name: "storage", sensitivity: "high" },
  { name: "supabase_functions", sensitivity: "high" },
  { name: "supabase_migrations", sensitivity: "high" },
  { name: "net", sensitivity: "high" },
  { name: "realtime", sensitivity: "high" },
  { name: "private", sensitivity: "high" },
  { name: "internal", sensitivity: "high" },
  { name: "admin", sensitivity: "high" },
  { name: "pgbouncer", sensitivity: "high" },
  { name: "graphql", sensitivity: "medium" },
  { name: "graphql_public", sensitivity: "medium" },
  { name: "extensions", sensitivity: "medium" },
  { name: "information_schema", sensitivity: "medium" },
  { name: "pg_catalog", sensitivity: "medium" }
];
async function runRoleCheck(sdk, registry, limiter, projectRef, onProgress) {
  const instance = await registry.getInstance(projectRef);
  if (!instance) {
    onProgress("Instance not found.");
    return;
  }
  if (!hasUsableCreds(instance)) {
    onProgress("No credentials (anon key or session) \u2014 cannot run role check.");
    return;
  }
  const creds = credsFor(instance);
  const testedAs = activeSession(instance)?.email ?? "anon";
  onProgress(`Bruteforcing privileged schemas as role: ${testedAs}`);
  const { projectUrl } = instance;
  for (const schema of PRIVILEGED_SCHEMAS) {
    if (limiter.isKilled()) {
      onProgress("Stopped by kill switch.");
      return;
    }
    onProgress(`Probing schema: ${schema.name}`);
    const probe = await probeSchema(sdk, limiter, projectUrl, creds, schema.name);
    if (probe === void 0) continue;
    const exposed = probe.statusCode === 200;
    const state = {
      name: schema.name,
      exposed,
      sensitivity: schema.sensitivity,
      status: probe.statusCode,
      testedAs
    };
    await recordSchema(registry, projectRef, state);
    if (exposed) {
      await reportExposedSchema(
        sdk,
        projectUrl,
        schema.name,
        testedAs,
        schema.sensitivity,
        probe.requestId
      );
      onProgress(`FINDING: schema '${schema.name}' reachable as ${testedAs} (${schema.sensitivity})`);
    } else {
      onProgress(`schema '${schema.name}': not exposed (${probe.statusCode})`);
    }
  }
  onProgress("Role check complete.");
}
async function probeSchema(sdk, limiter, projectUrl, creds, schema) {
  const allowed = await limiter.acquire();
  if (!allowed) return void 0;
  try {
    const spec = new RequestSpec7(`${projectUrl}/rest/v1/`);
    spec.setMethod("GET");
    spec.setHeader("apikey", creds.apikey);
    spec.setHeader("Authorization", `Bearer ${creds.bearer}`);
    spec.setHeader("Accept-Profile", schema);
    spec.setHeader("Accept", "application/json");
    const result = await sdk.requests.send(spec);
    const statusCode = result.response?.getCode() ?? 0;
    const requestId = result.request?.getId() ?? "";
    return { statusCode, requestId };
  } catch (err) {
    sdk.console.error(`[SupaScan] Role/schema probe error for ${schema}: ${String(err)}`);
    return void 0;
  } finally {
    limiter.release();
  }
}
async function recordSchema(registry, projectRef, state) {
  const inst = await registry.getInstance(projectRef);
  if (!inst) return;
  inst.schemaStates = { ...inst.schemaStates ?? {} };
  inst.schemaStates[state.name] = state;
  await registry.upsertInstance(inst);
}

// packages/backend/src/settings.ts
import { readFileSync, writeFileSync, mkdirSync } from "fs";
function settingsPath(sdk) {
  return `${sdk.meta.path()}/settings.json`;
}
function loadSettings(sdk) {
  try {
    const raw = readFileSync(settingsPath(sdk), "utf-8");
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}
function saveSettingsToDisk(sdk, settings) {
  try {
    mkdirSync(sdk.meta.path(), { recursive: true });
    writeFileSync(settingsPath(sdk), JSON.stringify(settings, null, 2));
  } catch (err) {
    sdk.console.warn(`[SupaScan] Could not persist settings: ${String(err)}`);
  }
}

// packages/backend/src/index.ts
var _registry;
var _limiter;
function getRegistry() {
  if (!_registry) throw new Error("Registry not initialized");
  return _registry;
}
function getLimiter() {
  if (!_limiter) throw new Error("RateLimiter not initialized");
  return _limiter;
}
async function broadcastInstances(sdk) {
  try {
    const instances = await getRegistry().getInstances();
    sdk.api.send("supascan:instances-updated", { instances });
  } catch (err) {
    sdk.console.error(`[SupaScan] broadcastInstances error: ${String(err)}`);
  }
}
async function broadcastActivity(sdk) {
  try {
    const entries = await getRegistry().getActivityLog();
    sdk.api.send("supascan:activity-updated", { entries });
  } catch (err) {
    sdk.console.error(`[SupaScan] broadcastActivity error: ${String(err)}`);
  }
}
async function logActivity(sdk, method, url, statusCode, note) {
  const entry = {
    id: randomString(16),
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    method,
    url,
    statusCode,
    note
  };
  await getRegistry().addActivityEntry(entry);
  await broadcastActivity(sdk);
}
async function getInstances(_sdk) {
  return getRegistry().getInstances();
}
async function getSettings(_sdk) {
  return getLimiter().getSettings();
}
async function saveSettings(sdk, settings) {
  getLimiter().updateSettings(settings);
  saveSettingsToDisk(sdk, settings);
}
async function getActivityLog(_sdk) {
  return getRegistry().getActivityLog();
}
async function clearActivityLog(sdk) {
  await getRegistry().clearActivityLog();
  await broadcastActivity(sdk);
}
async function clearTables(sdk, projectRef) {
  const inst = await getRegistry().getInstance(projectRef);
  if (!inst) return;
  inst.tables = {};
  await getRegistry().upsertInstance(inst);
  await broadcastInstances(sdk);
  await logActivity(sdk, "SYSTEM", `Cleared tables for ${projectRef}`);
}
async function runReadChecksRpc(sdk, projectRef) {
  const limiter = getLimiter();
  const registry = getRegistry();
  await runReadChecks(sdk, registry, limiter, projectRef, async (msg) => {
    sdk.api.send("supascan:check-progress", { projectRef, message: msg });
    await logActivity(sdk, "PROBE", `[read] ${msg}`);
    await broadcastInstances(sdk);
  });
  await broadcastInstances(sdk);
}
async function runWriteProbesRpc(sdk, projectRef) {
  const limiter = getLimiter();
  const registry = getRegistry();
  await runWriteProbes(sdk, registry, limiter, projectRef, async (msg) => {
    sdk.api.send("supascan:check-progress", { projectRef, message: msg });
    await logActivity(sdk, "PROBE", `[write] ${msg}`);
    await broadcastInstances(sdk);
  });
  await broadcastInstances(sdk);
}
async function runAuthCheckRpc(sdk, projectRef) {
  const limiter = getLimiter();
  const registry = getRegistry();
  await runAuthCheck(sdk, registry, limiter, projectRef, async (msg) => {
    sdk.api.send("supascan:check-progress", { projectRef, message: msg });
    await logActivity(sdk, "PROBE", `[auth] ${msg}`);
  });
}
async function customSignupRpc(sdk, projectRef, email, password, dataJson) {
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
    result.sessionSet ? "custom signup \u2014 session captured" : "custom signup"
  );
  if (result.sessionSet) await broadcastInstances(sdk);
  return result;
}
async function setActiveSession(sdk, projectRef, sessionId) {
  const inst = await getRegistry().getInstance(projectRef);
  if (!inst) return;
  inst.activeSessionId = sessionId.length > 0 ? sessionId : void 0;
  await getRegistry().upsertInstance(inst);
  await broadcastInstances(sdk);
  const label = inst.activeSessionId ? `as ${(inst.sessions ?? []).find((s) => s.id === inst.activeSessionId)?.email ?? sessionId}` : "as anon";
  await logActivity(sdk, "SYSTEM", `Active session for ${projectRef} set ${label}`);
}
async function signInUser(sdk, projectRef, email, password) {
  const result = await runSignIn(sdk, getRegistry(), getLimiter(), projectRef, email, password);
  await logActivity(
    sdk,
    "POST",
    `/auth/v1/token?grant_type=password (${email})`,
    result.statusCode,
    result.token ? "sign-in \u2014 session added" : "sign-in"
  );
  if (result.ok && result.token !== void 0) {
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
async function addSessionToken(sdk, projectRef, email, token) {
  const inst = await getRegistry().getInstance(projectRef);
  if (!inst) return { ok: false, error: "Instance not found." };
  if (email.trim().length === 0) return { ok: false, error: "Email/label is required." };
  if (decodeJwt(token.trim()) === void 0) {
    return { ok: false, error: "Token is not a valid JWT." };
  }
  addUserToInstance(inst, email.trim(), token.trim(), "manual");
  await getRegistry().upsertInstance(inst);
  await broadcastInstances(sdk);
  await logActivity(sdk, "SYSTEM", `Added manual session ${email} to ${projectRef}`);
  return { ok: true };
}
async function removeSession(sdk, projectRef, sessionId) {
  const inst = await getRegistry().getInstance(projectRef);
  if (!inst) return;
  inst.sessions = (inst.sessions ?? []).filter((s) => s.id !== sessionId);
  if (inst.activeSessionId === sessionId) inst.activeSessionId = void 0;
  await getRegistry().upsertInstance(inst);
  await broadcastInstances(sdk);
}
async function runRpcCheckRpc(sdk, projectRef) {
  const limiter = getLimiter();
  const registry = getRegistry();
  await runRpcCheck(sdk, registry, limiter, projectRef, async (msg) => {
    sdk.api.send("supascan:check-progress", { projectRef, message: msg });
    await logActivity(sdk, "PROBE", `[rpc] ${msg}`);
    await broadcastInstances(sdk);
  });
  await broadcastInstances(sdk);
}
async function runRpcBruteforceRpc(sdk, projectRef, wordlist) {
  const limiter = getLimiter();
  const registry = getRegistry();
  await runRpcBruteforce(sdk, registry, limiter, projectRef, wordlist, async (msg) => {
    sdk.api.send("supascan:check-progress", { projectRef, message: msg });
    await logActivity(sdk, "PROBE", `[rpc-bf] ${msg}`);
    await broadcastInstances(sdk);
  });
  await broadcastInstances(sdk);
}
async function runStorageEnumRpc(sdk, projectRef, bucketWordlist) {
  const limiter = getLimiter();
  const registry = getRegistry();
  await runStorageEnum(sdk, registry, limiter, projectRef, bucketWordlist, async (msg) => {
    sdk.api.send("supascan:check-progress", { projectRef, message: msg });
    await logActivity(sdk, "PROBE", `[storage] ${msg}`);
    await broadcastInstances(sdk);
  });
  await broadcastInstances(sdk);
}
async function runIdorCheckRpc(sdk, projectRef) {
  const limiter = getLimiter();
  const registry = getRegistry();
  await runIdorCheck(sdk, registry, limiter, projectRef, async (msg) => {
    sdk.api.send("supascan:check-progress", { projectRef, message: msg });
    await logActivity(sdk, "PROBE", `[idor] ${msg}`);
    await broadcastInstances(sdk);
  });
  await broadcastInstances(sdk);
}
async function runRoleCheckRpc(sdk, projectRef) {
  const limiter = getLimiter();
  const registry = getRegistry();
  await runRoleCheck(sdk, registry, limiter, projectRef, async (msg) => {
    sdk.api.send("supascan:check-progress", { projectRef, message: msg });
    await logActivity(sdk, "PROBE", `[roles] ${msg}`);
    await broadcastInstances(sdk);
  });
  await broadcastInstances(sdk);
}
async function stopAllChecks(sdk) {
  getLimiter().kill();
  await logActivity(sdk, "SYSTEM", "[SupaScan] All checks stopped by user");
  setTimeout(() => {
    getLimiter().reset();
  }, 2e3);
}
async function seedFromRequest(sdk, requestId) {
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
async function addManualInstance(sdk, projectUrl, anonKey) {
  let url = projectUrl.trim().replace(/\/$/, "");
  if (!url.startsWith("http")) url = `https://${url}`;
  const refMatch = /([a-z0-9]{20})\.supabase\.co/i.exec(url);
  if (!refMatch?.[1]) {
    return { ok: false, error: "URL must contain a valid Supabase project ref (<20-char-ref>.supabase.co)" };
  }
  const projectRef = refMatch[1].toLowerCase();
  const normalizedUrl = `https://${projectRef}.supabase.co`;
  let anonKeyRole;
  if (anonKey.trim().length > 0) {
    const payload = decodeJwt(anonKey.trim());
    if (!payload) {
      return { ok: false, error: "Anon key is not a valid JWT" };
    }
    if (payload.role === "service_role") {
      return { ok: false, error: "Will not store a service_role key \u2014 SupaScan never uses service_role keys" };
    }
    anonKeyRole = payload.role !== void 0 ? String(payload.role) : void 0;
  }
  const inScope = await isInScope(sdk, `${projectRef}.supabase.co`);
  const existing = await getRegistry().getInstance(projectRef);
  const inst = existing ?? {
    projectRef,
    projectUrl: normalizedUrl,
    tables: {},
    rpcs: [],
    buckets: [],
    firstSeenRequestId: "manual",
    inScope
  };
  if (anonKey.trim().length > 0) {
    inst.anonKey = anonKey.trim();
    inst.anonKeyRole = anonKeyRole;
  }
  inst.inScope = inScope;
  await getRegistry().upsertInstance(inst);
  await broadcastInstances(sdk);
  await logActivity(sdk, "MANUAL", normalizedUrl, void 0, "manually added instance");
  sdk.console.log(`[SupaScan] Manual instance added: ${normalizedUrl}`);
  return { ok: true };
}
async function init(sdk) {
  sdk.console.log("[SupaScan] Initializing...");
  _registry = new Registry(sdk);
  _limiter = new RateLimiter(loadSettings(sdk));
  await _registry.init();
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
  sdk.events.onInterceptRequest(async (sdk2, request) => {
    try {
      const host = request.getHost();
      const path = request.getPath();
      const method = request.getMethod();
      const rawHeaders = request.getHeaders();
      const headers = headersToRecord(rawHeaders);
      const body = request.getBody()?.toText() ?? "";
      const requestId = request.getId();
      await fingerprintRequest(
        sdk2,
        getRegistry(),
        requestId,
        host,
        path,
        method,
        headers,
        body
      );
      await broadcastInstances(sdk2);
    } catch (err) {
      sdk2.console.error(`[SupaScan] intercept request error: ${String(err)}`);
    }
  });
  sdk.events.onInterceptResponse(async (sdk2, request, response) => {
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
        sdk2,
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
      await broadcastInstances(sdk2);
    } catch (err) {
      sdk2.console.error(`[SupaScan] intercept response error: ${String(err)}`);
    }
  });
  sdk.events.onProjectChange(async (sdk2) => {
    try {
      await getRegistry().refreshProject();
      await broadcastInstances(sdk2);
      await broadcastActivity(sdk2);
    } catch (err) {
      sdk2.console.error(`[SupaScan] project change error: ${String(err)}`);
    }
  });
  sdk.console.log("[SupaScan] Ready.");
}
export {
  init
};
