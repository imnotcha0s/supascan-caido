import type { SDK } from "caido:plugin";
import { RequestSpec } from "caido:utils";
import type { API } from "../index";
import type { Registry } from "../registry";
import type { RateLimiter } from "../ratelimit";
import type { TableState } from "../types";
import { reportMissingRls } from "../findings";
import {
  credsFor,
  activeSession,
  hasUsableCreds,
  extractHintTable,
  parseWordlist,
  type ProbeCreds,
} from "../extract";

/**
 * Common Supabase/PostgREST table names probed in addition to the tables
 * observed in traffic. Lets the read check find readable tables even when
 * passive fingerprinting hasn't seen any table requests yet.
 */
export const COMMON_TABLES = [
  "users", "profiles", "accounts", "user_profiles", "customers",
  "posts", "comments", "messages", "chats", "conversations",
  "products", "orders", "order_items", "payments", "invoices",
  "subscriptions", "transactions", "carts", "wishlists", "coupons",
  "todos", "tasks", "notes", "projects", "teams",
  "organizations", "members", "roles", "permissions", "sessions",
  "notifications", "settings", "config", "logs", "events",
  "files", "documents", "images", "uploads", "media",
  "categories", "tags", "likes", "follows", "reviews",
  "ratings", "addresses", "contacts", "leads", "tickets",
  "employees", "companies", "articles", "blogs", "pages",
  "waitlist", "subscribers", "newsletter", "feedback", "emails",
  "api_keys", "secrets", "tokens", "credentials", "password_resets",
];

/**
 * Run read probes on all observed tables for a given instance.
 * Uses limit=1 for data and count-only for row totals.
 * NEVER paginates.
 */
export async function runReadChecks(
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
    onProgress("No credentials (anon key or session) — cannot run read checks.");
    return;
  }
  const creds = credsFor(instance);
  const active = activeSession(instance);
  if (active) {
    onProgress(`Running as authenticated session: ${active.email}`);
  }

  // Build the work queue: always probe observed tables; add brute-force
  // candidates only when discovery is enabled. The queue can grow as 404
  // PostgREST hints reveal the real table names.
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
    onProgress(`Checking table: ${tableName}`);

    // Check 1: fetch 1 row to see if we get data
    const rowResult = await fetchOneRow(sdk, limiter, projectUrl, creds, tableName);
    if (limiter.isKilled()) return;

    if (rowResult === undefined) {
      // Request failed (rate limited / network error)
      continue;
    }

    // A 404 may carry a PostgREST hint revealing the real table name — queue it.
    if (rowResult.statusCode === 404) {
      const hint = extractHintTable(rowResult.body);
      if (hint !== undefined && !seen.has(hint)) {
        seen.add(hint);
        queue.push(hint);
        onProgress(`Hint: '${tableName}' suggests real table '${hint}' — queued`);
      }
      // Skip persisting a non-existent guess (keep observed tables though).
      if (!wasObserved) continue;
    }

    const tableState: TableState = tables[tableName] ?? {
      name: tableName,
      observed: false,
      anonRead: "untested",
      anonWrite: "untested",
      evidenceRequestIds: [],
    };
    const updatedTable: TableState = { ...tableState };

    if (rowResult.statusCode === 200 && rowResult.body !== undefined) {
      let parsed: unknown;
      try {
        parsed = JSON.parse(rowResult.body);
      } catch {
        parsed = null;
      }

      if (Array.isArray(parsed) && parsed.length > 0) {
        updatedTable.anonRead = "rows";
        // Extract column names and keep the single sampled row as evidence.
        const firstRow = parsed[0];
        if (firstRow && typeof firstRow === "object") {
          updatedTable.columns = Object.keys(firstRow as Record<string, unknown>);
        }
        updatedTable.sampleRow = JSON.stringify(firstRow, null, 2);

        // Check 2: count-only (no data — just range)
        const countResult = await fetchCount(sdk, limiter, projectUrl, creds, tableName);
        if (countResult !== undefined) {
          updatedTable.rowCount = countResult.total;
          if (countResult.requestId) {
            updatedTable.evidenceRequestIds = [
              ...new Set([...updatedTable.evidenceRequestIds, countResult.requestId]),
            ];
          }
        }

        if (rowResult.requestId) {
          updatedTable.evidenceRequestIds = [
            ...new Set([...updatedTable.evidenceRequestIds, rowResult.requestId]),
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
    } else if (
      rowResult.statusCode === 401 ||
      rowResult.statusCode === 403 ||
      rowResult.statusCode === 404
    ) {
      updatedTable.anonRead = "denied";
      onProgress(`${tableName}: access denied (${rowResult.statusCode})`);
    } else {
      onProgress(`${tableName}: unexpected status ${String(rowResult.statusCode)}`);
    }

    await registry.upsertTable(projectRef, updatedTable);
  }

  onProgress("Read checks complete.");
}

type RowResult = {
  statusCode: number;
  body: string;
  requestId: string;
};

async function fetchOneRow(
  sdk: SDK<API>,
  limiter: RateLimiter,
  projectUrl: string,
  creds: ProbeCreds,
  tableName: string
): Promise<RowResult | undefined> {
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
    return { statusCode, body, requestId };
  } catch (err) {
    sdk.console.error(`[SupaScan] Read probe error for ${tableName}: ${String(err)}`);
    return undefined;
  } finally {
    limiter.release();
  }
}

type CountResult = {
  total: number;
  requestId: string;
};

async function fetchCount(
  sdk: SDK<API>,
  limiter: RateLimiter,
  projectUrl: string,
  creds: ProbeCreds,
  tableName: string
): Promise<CountResult | undefined> {
  const allowed = await limiter.acquire();
  if (!allowed) return undefined;
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

    // Parse Content-Range: 0-0/<total>
    const contentRange = result.response?.getHeader("content-range")?.[0];

    if (contentRange !== undefined) {
      const m = /\/(\d+)$/.exec(contentRange);
      if (m?.[1]) {
        return { total: parseInt(m[1], 10), requestId };
      }
    }
    return undefined;
  } catch (err) {
    sdk.console.error(`[SupaScan] Count probe error for ${tableName}: ${String(err)}`);
    return undefined;
  } finally {
    limiter.release();
  }
}
