import type { JwtPayload, SupabaseInstance, SessionUser } from "./types";

/**
 * The active session user for an instance, or undefined when running as anon.
 */
export function activeSession(instance: SupabaseInstance): SessionUser | undefined {
  if (instance.activeSessionId === undefined) return undefined;
  return (instance.sessions ?? []).find((s) => s.id === instance.activeSessionId);
}

/**
 * Add a session user to an instance and make it the active session.
 * If a user with the same email already exists, its token is refreshed instead.
 */
export function addUserToInstance(
  instance: SupabaseInstance,
  email: string,
  token: string,
  source: SessionUser["source"]
): SessionUser {
  const sessions = instance.sessions ?? [];
  const existing = sessions.find((s) => s.email === email);
  if (existing) {
    existing.token = token;
    existing.source = source;
    instance.sessions = sessions;
    instance.activeSessionId = existing.id;
    return existing;
  }
  const user: SessionUser = {
    id: randomString(10),
    email,
    token,
    source,
    createdAt: new Date().toISOString(),
  };
  instance.sessions = [...sessions, user];
  instance.activeSessionId = user.id;
  return user;
}

/**
 * Credentials used for probe requests against an instance.
 * `apikey` is the project's anon key when available; otherwise it falls back to
 * a session token so the plugin still works with only an authenticated session
 * (the Supabase gateway accepts any project JWT as the apikey). `bearer` is the
 * active session's token when one is selected, else the anon key / a session.
 */
export type ProbeCreds = { apikey: string; bearer: string };

/**
 * The apikey to use for an instance: the anon key if present, otherwise the
 * active session's token, otherwise any available session token.
 */
export function apiKeyFor(instance: SupabaseInstance): string {
  const sessions = instance.sessions ?? [];
  return instance.anonKey ?? activeSession(instance)?.token ?? sessions[0]?.token ?? "";
}

/** Whether the instance has usable credentials (anon key or any session). */
export function hasUsableCreds(instance: SupabaseInstance): boolean {
  return apiKeyFor(instance).length > 0;
}

export function credsFor(instance: SupabaseInstance): ProbeCreds {
  const sessions = instance.sessions ?? [];
  const apikey = apiKeyFor(instance);
  const bearer = activeSession(instance)?.token ?? instance.anonKey ?? sessions[0]?.token ?? apikey;
  return { apikey, bearer };
}

const SUPABASE_HOST_RE = /^[a-z0-9]{20}\.supabase\.co$/i;
const SUPABASE_PATH_PREFIXES = [
  "/rest/v1/",
  "/auth/v1/",
  "/storage/v1/",
  "/realtime/v1/",
  "/functions/v1/",
];
const JWT_RE = /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g;
const PROJECT_REF_RE = /^([a-z0-9]{20})\.supabase\.co$/i;

/**
 * Decode a JWT payload without verifying the signature.
 * Returns undefined if the token is malformed.
 */
export function decodeJwt(token: string): JwtPayload | undefined {
  const parts = token.split(".");
  if (parts.length !== 3) return undefined;
  try {
    const payload = parts[1]!.replace(/-/g, "+").replace(/_/g, "/");
    // Pad to multiple of 4
    const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    const decoded = atob(padded);
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return undefined;
  }
}

/**
 * Extract the project ref from a Supabase host.
 */
export function extractProjectRef(host: string): string | undefined {
  const match = PROJECT_REF_RE.exec(host);
  return match?.[1]?.toLowerCase();
}

/**
 * Normalize the project URL (strip trailing slash, scheme-normalize).
 */
export function normalizeProjectUrl(host: string): string {
  return `https://${host.toLowerCase()}`;
}

/**
 * Determine if a URL host or path looks like a Supabase endpoint.
 */
export function isSupabaseEndpoint(host: string, path: string): boolean {
  if (SUPABASE_HOST_RE.test(host)) return true;
  for (const prefix of SUPABASE_PATH_PREFIXES) {
    if (path.startsWith(prefix)) return true;
  }
  return false;
}

/**
 * Extract the first anon-looking JWT from request headers.
 * We check the `apikey` header and the Authorization Bearer token.
 */
export function extractAnonKey(
  headers: Record<string, string>
): string | undefined {
  const apikey = findHeader(headers, "apikey");
  if (apikey) return apikey;

  const auth = findHeader(headers, "authorization");
  if (auth) {
    const m = /^Bearer\s+(.+)$/i.exec(auth);
    if (m?.[1]) return m[1];
  }
  return undefined;
}

/**
 * Find all JWTs in a text body and return them with their decoded payloads.
 */
export function extractJwtsFromBody(
  body: string
): Array<{ token: string; payload: JwtPayload }> {
  const results: Array<{ token: string; payload: JwtPayload }> = [];
  let m: RegExpExecArray | null;
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

/**
 * Check whether text looks like it contains Supabase client code.
 */
export function bodyContainsSupabaseIndicator(body: string): boolean {
  return (
    body.includes("createClient(") ||
    body.includes("supabase-js") ||
    body.includes("SUPABASE_URL") ||
    body.includes("NEXT_PUBLIC_SUPABASE") ||
    body.includes("VITE_SUPABASE") ||
    body.includes("supabase.co")
  );
}

/**
 * Case-insensitive header lookup from a plain object map.
 */
export function findHeader(
  headers: Record<string, string>,
  name: string
): string | undefined {
  const lower = name.toLowerCase();
  for (const [k, v] of Object.entries(headers)) {
    if (k.toLowerCase() === lower) return v;
  }
  return undefined;
}

/**
 * Extract a storage bucket name from a Supabase storage path, e.g.
 *   /storage/v1/object/public/avatars/x.png       -> avatars
 *   /storage/v1/object/sign/files/y               -> files
 *   /storage/v1/object/list/uploads               -> uploads
 *   /storage/v1/object/media/z.mp4                 -> media
 *   /storage/v1/render/image/public/photos/a.jpg  -> photos
 * Buckets are only ever identified passively from observed traffic.
 */
export function extractBucketFromPath(path: string): string | undefined {
  const m = /^\/storage\/v1\/(?:object|render\/image)\/(.+)/.exec(path);
  if (!m?.[1]) return undefined;
  let rest = m[1];
  const prefixes = [
    "info/public/",
    "upload/sign/",
    "public/",
    "sign/",
    "authenticated/",
    "list/",
    "info/",
    "upload/",
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
  return bucket !== undefined && bucket.length > 0 ? bucket : undefined;
}

/**
 * Extract table name from a PostgREST path like /rest/v1/tablename
 */
export function extractTableFromPath(path: string): string | undefined {
  const m = /^\/rest\/v1\/([^?/]+)/.exec(path);
  if (!m?.[1]) return undefined;
  // Skip the OpenAPI root
  if (m[1] === "") return undefined;
  return m[1];
}

/**
 * Parse a user-supplied wordlist (newline and/or comma separated) into a clean,
 * de-duplicated list of table names.
 */
export function parseWordlist(raw: string): string[] {
  return [
    ...new Set(
      raw
        .split(/[\n,]/)
        .map((t) => t.trim())
        .filter((t) => t.length > 0)
    ),
  ];
}

/**
 * Extract a real table name from a PostgREST 404 "hint".
 * e.g. "Perhaps you meant the table 'public.messages'" -> "messages".
 * Confirms the table exists even though the guessed name was wrong.
 */
export function extractHintTable(body: string): string | undefined {
  let hint: string | undefined;
  try {
    const parsed = JSON.parse(body) as { hint?: unknown };
    if (typeof parsed.hint === "string") hint = parsed.hint;
  } catch {
    hint = body;
  }
  if (hint === undefined) return undefined;
  const m = /the table '(?:[a-zA-Z0-9_]+\.)?([a-zA-Z0-9_]+)'/.exec(hint);
  return m?.[1];
}

/**
 * Extract a real RPC function name from a PostgREST error body.
 * e.g. hint "Perhaps you meant to call the function public.get_user" -> "get_user".
 * A hint (even one pointing at the same name with different args) confirms the
 * function exists.
 */
export function extractHintFunction(body: string): string | undefined {
  let hint: string | undefined;
  try {
    const parsed = JSON.parse(body) as { hint?: unknown };
    if (typeof parsed.hint === "string") hint = parsed.hint;
  } catch {
    hint = body;
  }
  if (hint === undefined) return undefined;
  const m = /call the function (?:[a-zA-Z0-9_]+\.)?([a-zA-Z0-9_]+)/.exec(hint);
  return m?.[1];
}

/**
 * Extract all Supabase project refs found anywhere in a text body.
 * Handles URL strings, env vars, JS object values, template literals, etc.
 */
export function extractProjectRefsFromBody(body: string): string[] {
  const found = new Set<string>();
  // Match any occurrence of <ref>.supabase.co regardless of surrounding chars
  const re = /([a-z0-9]{20})\.supabase\.co/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    found.add(m[1]!.toLowerCase());
  }
  return Array.from(found);
}

/**
 * Generate a random string of given length using alphanumeric chars.
 */
export function randomString(length: number): string {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}
