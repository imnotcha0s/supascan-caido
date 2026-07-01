import type { SDK } from "caido:plugin";
import { RequestSpec } from "caido:utils";
import type { API } from "../index";
import type { Registry } from "../registry";
import type { RateLimiter } from "../ratelimit";
import type { TableState } from "../types";
import { reportAnonWrite } from "../findings";
import {
  credsFor,
  activeSession,
  hasUsableCreds,
  extractHintTable,
  parseWordlist,
  type ProbeCreds,
} from "../extract";
import { COMMON_TABLES } from "./read";

/**
 * Rollback-only write probes.
 *
 * To be both meaningful and safe, each probe:
 *  1. Fetches ONE real row (limit=1) to target — writes are only tested against
 *     rows that actually exist and are visible to the current identity.
 *  2. Sends a PATCH filtered to that row's primary key, setting one benign
 *     column to its *current value* (an idempotent no-op change), with
 *     `Prefer: tx=rollback,return=representation`.
 *  3. Reads the result: a 200 that returns the targeted row means the write was
 *     permitted (missing/permissive UPDATE policy); a 200 with `[]` means RLS
 *     filtered the update (rejected); 401/403 means no privilege.
 *
 * Because the column is set to its existing value, nothing is semantically
 * modified even if the server does not honour `tx=rollback`.
 */
export async function runWriteProbes(
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

  const { projectUrl, tables } = instance;
  if (!hasUsableCreds(instance)) {
    onProgress("No credentials (anon key or session) — cannot run write probes.");
    return;
  }
  const creds = credsFor(instance);
  const active = activeSession(instance);
  const testedAs = active?.email ?? "anon";
  if (active) onProgress(`Running as authenticated session: ${active.email}`);

  const settings = limiter.getSettings();
  const candidates = settings.discoveryEnabled
    ? settings.useCustomWordlist
      ? parseWordlist(settings.tableWordlist)
      : COMMON_TABLES
    : [];
  const observed = Object.keys(tables);
  const queue = [...new Set([...observed, ...candidates])];
  const seen = new Set(queue);

  if (queue.length === 0) {
    onProgress("No observed tables and discovery is disabled — nothing to check.");
    return;
  }

  while (queue.length > 0) {
    const tableName = queue.shift();
    if (tableName === undefined) break;
    if (limiter.isKilled()) {
      onProgress("Stopped by kill switch.");
      return;
    }

    const wasObserved = tables[tableName] !== undefined;
    onProgress(`Write probe on table: ${tableName}`);

    // Step 1: fetch a real row to target.
    const sample = await fetchSampleRow(sdk, limiter, projectUrl, creds, tableName);
    if (sample === undefined) continue;

    if (sample.statusCode === 404) {
      const hint = extractHintTable(sample.body);
      if (hint !== undefined && !seen.has(hint)) {
        seen.add(hint);
        queue.push(hint);
        onProgress(`Hint: '${tableName}' suggests real table '${hint}' — queued`);
      }
      if (!wasObserved) continue;
    }

    if (sample.row === undefined) {
      onProgress(`${tableName}: no readable row to target — skipping write test`);
      continue;
    }

    // Step 2: build an idempotent update against that row.
    const plan = buildWritePlan(sample.row);
    if (plan === undefined) {
      onProgress(`${tableName}: no benign column to test writes against — skipping`);
      continue;
    }

    if (limiter.isKilled()) {
      onProgress("Stopped by kill switch.");
      return;
    }

    const result = await sendWrite(sdk, limiter, projectUrl, creds, tableName, plan);
    if (result === undefined) continue;

    const table: TableState =
      tables[tableName] ?? {
        name: tableName,
        observed: false,
        anonRead: "untested",
        anonWrite: "untested",
        evidenceRequestIds: [],
      };
    const updatedTable = { ...table };

    const writable =
      result.statusCode === 200 &&
      Array.isArray(result.parsed) &&
      result.parsed.length > 0;
    const denied =
      result.statusCode === 401 ||
      result.statusCode === 403 ||
      (result.statusCode === 200 &&
        Array.isArray(result.parsed) &&
        result.parsed.length === 0);

    if (writable) {
      updatedTable.anonWrite = "accepted";
      if (result.requestId) {
        updatedTable.evidenceRequestIds = [
          ...new Set([...updatedTable.evidenceRequestIds, result.requestId]),
        ];
      }
      await reportAnonWrite(sdk, projectUrl, tableName, testedAs, result.requestId);
      onProgress(`FINDING: ${tableName} is writable as ${testedAs} (row update permitted, rolled back)`);
      await registry.upsertTable(projectRef, updatedTable);
    } else if (denied) {
      updatedTable.anonWrite = "rejected";
      onProgress(`${tableName}: write rejected (${result.statusCode}${result.statusCode === 200 ? " — RLS filtered" : ""})`);
      await registry.upsertTable(projectRef, updatedTable);
    } else {
      onProgress(`${tableName}: inconclusive write result (${result.statusCode})`);
    }
  }

  onProgress("Write probes complete.");
}

type SampleResult = {
  statusCode: number;
  body: string;
  row?: Record<string, unknown>;
  requestId: string;
};

async function fetchSampleRow(
  sdk: SDK<API>,
  limiter: RateLimiter,
  projectUrl: string,
  creds: ProbeCreds,
  tableName: string
): Promise<SampleResult | undefined> {
  const allowed = await limiter.acquire();
  if (!allowed) return undefined;
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

    let row: Record<string, unknown> | undefined;
    try {
      const parsed = JSON.parse(body) as unknown;
      if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "object" && parsed[0] !== null) {
        row = parsed[0] as Record<string, unknown>;
      }
    } catch {
      // ignore
    }
    return { statusCode, body, row, requestId };
  } catch (err) {
    sdk.console.error(`[SupaScan] Write sample fetch error for ${tableName}: ${String(err)}`);
    return undefined;
  } finally {
    limiter.release();
  }
}

type WritePlan = {
  filterCol: string;
  filterVal: string;
  targetCol: string;
  targetVal: unknown;
};

const TIMESTAMP_COLS = new Set([
  "created_at",
  "updated_at",
  "inserted_at",
  "deleted_at",
  "modified_at",
]);

/**
 * Choose a primary-key column to filter on and a benign column to "update" to
 * its own value. Returns undefined if no safe column pair can be built.
 */
function buildWritePlan(row: Record<string, unknown>): WritePlan | undefined {
  const scalarKeys = Object.keys(row).filter((k) => isScalar(row[k]));
  if (scalarKeys.length === 0) return undefined;

  const filterCol = scalarKeys.includes("id") ? "id" : scalarKeys[0]!;
  const filterVal = String(row[filterCol]);

  const targetCol = scalarKeys.find(
    (k) =>
      k !== filterCol &&
      !/_id$/i.test(k) &&
      !TIMESTAMP_COLS.has(k.toLowerCase()) &&
      row[k] !== null
  );
  if (targetCol === undefined) return undefined;

  return { filterCol, filterVal, targetCol, targetVal: row[targetCol] };
}

function isScalar(v: unknown): boolean {
  return (
    typeof v === "string" ||
    typeof v === "number" ||
    typeof v === "boolean"
  );
}

type WriteResult = {
  statusCode: number;
  requestId: string;
  parsed: unknown;
};

async function sendWrite(
  sdk: SDK<API>,
  limiter: RateLimiter,
  projectUrl: string,
  creds: ProbeCreds,
  tableName: string,
  plan: WritePlan
): Promise<WriteResult | undefined> {
  const allowed = await limiter.acquire();
  if (!allowed) return undefined;
  try {
    const url = `${projectUrl}/rest/v1/${tableName}?${plan.filterCol}=eq.${encodeURIComponent(plan.filterVal)}`;
    const spec = new RequestSpec(url);
    spec.setMethod("PATCH");
    spec.setHeader("apikey", creds.apikey);
    spec.setHeader("Authorization", `Bearer ${creds.bearer}`);
    spec.setHeader("Content-Type", "application/json");
    // SAFETY: tx=rollback asks PostgREST to discard the transaction; the body
    // sets a column to its own value so nothing changes even if not honoured.
    spec.setHeader("Prefer", "tx=rollback,return=representation");
    spec.setBody(JSON.stringify({ [plan.targetCol]: plan.targetVal }));

    const result = await sdk.requests.send(spec);
    const statusCode = result.response?.getCode() ?? 0;
    const requestId = result.request?.getId() ?? "";
    const body = result.response?.getBody()?.toText() ?? "";
    let parsed: unknown;
    try {
      parsed = JSON.parse(body);
    } catch {
      parsed = undefined;
    }
    return { statusCode, requestId, parsed };
  } catch (err) {
    sdk.console.error(`[SupaScan] Write probe error for ${tableName}: ${String(err)}`);
    return undefined;
  } finally {
    limiter.release();
  }
}
