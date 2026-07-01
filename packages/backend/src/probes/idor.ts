import type { SDK } from "caido:plugin";
import { RequestSpec } from "caido:utils";
import type { API } from "../index";
import type { Registry } from "../registry";
import type { RateLimiter } from "../ratelimit";
import type { TableState, IdorResult } from "../types";
import { reportIdor } from "../findings";
import { apiKeyFor } from "../extract";

/**
 * Cross-user IDOR / broken-RLS differential check (AuthMatrix-style).
 *
 * For each known table, reads as every session user (plus anon) using a 1-row,
 * count-only request, then compares: if two *different* authenticated users see
 * the same non-zero rows, RLS isn't scoping per user — a potential IDOR.
 *
 * Requires at least 2 sessions on the instance.
 */
export async function runIdorCheck(
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

  const apikey = apiKeyFor(instance);
  if (apikey.length === 0) {
    onProgress("No credentials (anon key or session) — cannot run IDOR check.");
    return;
  }

  const sessions = instance.sessions ?? [];
  if (sessions.length < 2) {
    onProgress("IDOR check needs at least 2 sessions on this instance.");
    return;
  }

  const tableNames = Object.keys(instance.tables);
  if (tableNames.length === 0) {
    onProgress("No known tables yet — run Read Checks first to discover tables.");
    return;
  }

  // Identities to diff: each session user, plus anon as a baseline (if available).
  const identities = [
    ...sessions.map((s) => ({ label: s.email, bearer: s.token, isUser: true })),
  ];
  if (instance.anonKey !== undefined) {
    identities.push({ label: "anon", bearer: instance.anonKey, isUser: false });
  }

  const { projectUrl } = instance;

  for (const tableName of tableNames) {
    if (limiter.isKilled()) {
      onProgress("Stopped by kill switch.");
      return;
    }

    onProgress(`IDOR diff: ${tableName}`);

    const perUser: IdorResult["perUser"] = [];
    let evidenceRequestId = "";

    for (const id of identities) {
      if (limiter.isKilled()) return;
      const r = await fetchCountAndSample(sdk, limiter, projectUrl, apikey, id.bearer, tableName);
      if (r === undefined) continue;
      perUser.push({ label: id.label, rowCount: r.count, sampleId: r.sampleId });
      if (r.requestId.length > 0) evidenceRequestId = r.requestId;
    }

    if (perUser.length === 0) continue;

    // Shared when two *user* identities see identical non-zero rows.
    const userRows = perUser.filter(
      (p) => identities.find((i) => i.label === p.label)?.isUser && p.rowCount > 0
    );
    let shared = false;
    for (let a = 0; a < userRows.length && !shared; a++) {
      for (let b = a + 1; b < userRows.length; b++) {
        const ua = userRows[a]!;
        const ub = userRows[b]!;
        const sameCount = ua.rowCount === ub.rowCount;
        const sameSample = ua.sampleId === ub.sampleId;
        if (sameCount && sameSample) {
          shared = true;
          break;
        }
      }
    }

    const idor: IdorResult = { perUser, shared };
    const table: TableState = instance.tables[tableName] ?? {
      name: tableName,
      observed: false,
      anonRead: "untested",
      anonWrite: "untested",
      evidenceRequestIds: [],
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

type CountSample = {
  count: number;
  sampleId?: string;
  requestId: string;
};

async function fetchCountAndSample(
  sdk: SDK<API>,
  limiter: RateLimiter,
  projectUrl: string,
  apikey: string,
  bearer: string,
  tableName: string
): Promise<CountSample | undefined> {
  const allowed = await limiter.acquire();
  if (!allowed) return undefined;
  try {
    // limit=1 + count=exact: one request yields both the total and a sample row.
    const url = `${projectUrl}/rest/v1/${tableName}?select=*&limit=1`;
    const spec = new RequestSpec(url);
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
    if (contentRange !== undefined) {
      const m = /\/(\d+)$/.exec(contentRange);
      if (m?.[1]) count = parseInt(m[1], 10);
    }

    let sampleId: string | undefined;
    try {
      const parsed = JSON.parse(body) as unknown;
      if (Array.isArray(parsed) && parsed.length > 0) {
        const first = parsed[0] as Record<string, unknown>;
        if (first.id !== undefined) sampleId = String(first.id);
        else sampleId = JSON.stringify(first).slice(0, 80);
      }
    } catch {
      // ignore
    }

    return { count, sampleId, requestId };
  } catch (err) {
    sdk.console.error(`[SupaScan] IDOR probe error for ${tableName}: ${String(err)}`);
    return undefined;
  } finally {
    limiter.release();
  }
}
