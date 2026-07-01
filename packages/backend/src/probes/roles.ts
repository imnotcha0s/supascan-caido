import type { SDK } from "caido:plugin";
import { RequestSpec } from "caido:utils";
import type { API } from "../index";
import type { Registry } from "../registry";
import type { RateLimiter } from "../ratelimit";
import type { SchemaState, SchemaSensitivity } from "../types";
import { reportExposedSchema } from "../findings";
import { credsFor, activeSession, hasUsableCreds, type ProbeCreds } from "../extract";

/**
 * Privileged PostgREST schemas tied to elevated DB roles. By default only
 * `public` is exposed; any of these returning 200 to anon/authenticated is a
 * privilege escalation.
 */
const PRIVILEGED_SCHEMAS: Array<{ name: string; sensitivity: SchemaSensitivity }> = [
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
  { name: "pg_catalog", sensitivity: "medium" },
];

/**
 * Role / schema privilege-escalation bruteforce.
 *
 * Probes each privileged schema with the active credential (anon or a selected
 * session) using `Accept-Profile: <schema>`. PostgREST returns 406 when a schema
 * isn't exposed, so a 200 means the current role can reach it — privesc.
 *
 * Switch the active session in the Sessions tab to test a different role.
 */
export async function runRoleCheck(
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
  if (!hasUsableCreds(instance)) {
    onProgress("No credentials (anon key or session) — cannot run role check.");
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
    if (probe === undefined) continue;

    const exposed = probe.statusCode === 200;
    const state: SchemaState = {
      name: schema.name,
      exposed,
      sensitivity: schema.sensitivity,
      status: probe.statusCode,
      testedAs,
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

type SchemaProbe = {
  statusCode: number;
  requestId: string;
};

async function probeSchema(
  sdk: SDK<API>,
  limiter: RateLimiter,
  projectUrl: string,
  creds: ProbeCreds,
  schema: string
): Promise<SchemaProbe | undefined> {
  const allowed = await limiter.acquire();
  if (!allowed) return undefined;
  try {
    const spec = new RequestSpec(`${projectUrl}/rest/v1/`);
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
    return undefined;
  } finally {
    limiter.release();
  }
}

async function recordSchema(
  registry: Registry,
  projectRef: string,
  state: SchemaState
): Promise<void> {
  const inst = await registry.getInstance(projectRef);
  if (!inst) return;
  inst.schemaStates = { ...(inst.schemaStates ?? {}) };
  inst.schemaStates[state.name] = state;
  await registry.upsertInstance(inst);
}
