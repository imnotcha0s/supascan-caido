import type { SDK } from "caido:plugin";
import type { API } from "./index";

type Severity = "info" | "low" | "medium" | "high" | "critical";

export type FindingInput = {
  title: string;
  description: string;
  severity: Severity;
  requestId?: string;
};

/**
 * Create a Caido Finding and return its id.
 *
 * The Findings SDK requires an actual saved `Request` object (not an id) and has
 * no severity field, so we resolve the request by id and encode severity in the
 * title. A dedupe key keeps repeated probes from spamming duplicate findings.
 */
export async function createFinding(
  sdk: SDK<API>,
  input: FindingInput
): Promise<string | undefined> {
  try {
    if (input.requestId === undefined || input.requestId === "") {
      sdk.console.warn(
        `[SupaScan] Skipping finding "${input.title}" — no evidence request available.`
      );
      return undefined;
    }

    const rr = await sdk.requests.get(input.requestId);
    if (!rr) {
      sdk.console.warn(
        `[SupaScan] Skipping finding "${input.title}" — request ${input.requestId} not found.`
      );
      return undefined;
    }

    const finding = await sdk.findings.create({
      title: `[${input.severity.toUpperCase()}] ${input.title}`,
      description: input.description,
      reporter: "SupaScan",
      dedupeKey: `supascan:${input.title}`,
      request: rr.request,
    });
    return finding.getId();
  } catch (err) {
    sdk.console.error(`[SupaScan] Failed to create finding: ${String(err)}`);
    return undefined;
  }
}

/**
 * Raise an informational finding the first time a Supabase instance is detected.
 * Returns true if the finding was created (so callers can avoid retrying).
 */
export async function reportInstanceDetected(
  sdk: SDK<API>,
  projectUrl: string,
  projectRef: string,
  requestId: string
): Promise<boolean> {
  const id = await createFinding(sdk, {
    title: `[SupaScan] Supabase instance detected: ${projectRef}`,
    description: [
      `A Supabase backend was detected in proxied traffic.`,
      ``,
      `**Project URL:** ${projectUrl}`,
      `**Project ref:** ${projectRef}`,
      ``,
      `Run SupaScan's read / auth / storage / RPC checks against this instance to`,
      `test for missing RLS, open signup, public buckets, and unauthenticated RPCs.`,
    ].join("\n"),
    severity: "info",
    requestId,
  });
  return id !== undefined;
}

export async function reportServiceRoleLeak(
  sdk: SDK<API>,
  projectUrl: string,
  location: string,
  requestId: string
): Promise<void> {
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
      `under Settings → API → Service role secret.`,
    ].join("\n"),
    severity: "critical",
    requestId,
  });
}

export async function reportExposedSchema(
  sdk: SDK<API>,
  projectUrl: string,
  schema: string,
  testedAs: string,
  severity: "critical" | "high" | "medium",
  requestId: string
): Promise<void> {
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
      `privilege escalation — an attacker can read or call privileged objects directly.`,
      ``,
      `**Reproduce:**`,
      "```",
      `GET ${projectUrl}/rest/v1/`,
      `apikey: <anon key>`,
      `Accept-Profile: ${schema}`,
      "```",
      ``,
      `**Remediation:** Remove the schema from PostgREST's exposed schemas`,
      `(Dashboard → Settings → API → "Exposed schemas"), and revoke USAGE/SELECT`,
      `grants on it from \`anon\` and \`authenticated\`.`,
    ].join("\n"),
    severity,
    requestId,
  });
}

export async function reportIdor(
  sdk: SDK<API>,
  projectUrl: string,
  tableName: string,
  detail: string,
  requestId: string
): Promise<void> {
  await createFinding(sdk, {
    title: `[SupaScan] Broken RLS / IDOR — "${tableName}" returns the same rows to different users`,
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
      `return identical rows — confirm this table holds per-user data.`,
      ``,
      `**Remediation:** Add a SELECT policy scoping rows to the owner, e.g.`,
      "```sql",
      `CREATE POLICY "read own" ON public.${tableName}`,
      `  FOR SELECT USING ((select auth.uid()) = user_id);`,
      "```",
    ].join("\n"),
    severity: "high",
    requestId,
  });
}

export async function reportMissingRls(
  sdk: SDK<API>,
  projectUrl: string,
  tableName: string,
  rowCount: number,
  requestId: string
): Promise<void> {
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
      `**Remediation:** Enable RLS on this table and add a restrictive SELECT policy.`,
    ].join("\n"),
    severity: "high",
    requestId,
  });
}

export async function reportAnonWrite(
  sdk: SDK<API>,
  projectUrl: string,
  tableName: string,
  testedAs: string,
  requestId: string
): Promise<void> {
  await createFinding(sdk, {
    title: `[SupaScan] RLS misconfiguration: writable via ${testedAs} on "${tableName}"`,
    description: [
      `The table \`${tableName}\` accepted an UPDATE targeting a real row as the`,
      `**${testedAs}** role — Row Level Security is not preventing writes.`,
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
      "```",
    ].join("\n"),
    severity: "high",
    requestId,
  });
}

export async function reportOpenSignup(
  sdk: SDK<API>,
  projectUrl: string,
  requestId: string
): Promise<void> {
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
      `signups to specific email domains in Authentication → Settings.`,
    ].join("\n"),
    severity: "medium",
    requestId,
  });
}

export async function reportPublicBucket(
  sdk: SDK<API>,
  projectUrl: string,
  bucketName: string,
  fileCount: number,
  sampleFiles: string[],
  requestId: string
): Promise<void> {
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
      `restrict listing/reading to authorized users.`,
    ].join("\n"),
    severity: "medium",
    requestId,
  });
}

export async function reportExposedRpc(
  sdk: SDK<API>,
  projectUrl: string,
  fnName: string,
  requestId: string
): Promise<void> {
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
      `and add appropriate \`GRANT\` restrictions or RLS policies.`,
    ].join("\n"),
    severity: "low",
    requestId,
  });
}
