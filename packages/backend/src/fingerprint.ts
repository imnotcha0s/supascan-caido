import type { SDK } from "caido:plugin";
import type { API } from "./index";
import type { Registry } from "./registry";
import type { SupabaseInstance } from "./types";
import {
  isSupabaseEndpoint,
  extractProjectRef,
  normalizeProjectUrl,
  extractAnonKey,
  decodeJwt,
  extractJwtsFromBody,
  bodyContainsSupabaseIndicator,
  extractTableFromPath,
  extractBucketFromPath,
  findHeader,
  extractProjectRefsFromBody,
} from "./extract";
import { isInScope } from "./scope";
import {
  reportServiceRoleLeak,
  reportInstanceDetected,
} from "./findings";

/**
 * Process an intercepted request passively.
 * Returns fingerprint metadata if a Supabase endpoint was detected.
 */
export async function fingerprintRequest(
  sdk: SDK<API>,
  registry: Registry,
  requestId: string,
  host: string,
  path: string,
  _method: string,
  headers: Record<string, string>,
  _body: string
): Promise<void> {
  if (!isSupabaseEndpoint(host, path)) return;

  const projectRef = extractProjectRef(host);
  if (!projectRef) return;

  const projectUrl = normalizeProjectUrl(host);
  const anonKey = extractAnonKey(headers);
  let anonKeyRole: string | undefined;

  if (anonKey) {
    const payload = decodeJwt(anonKey);
    if (payload?.role) {
      anonKeyRole = String(payload.role);
      // CRITICAL: Never send a service_role key — detect and report only
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
          const inst = await registry.getInstance(projectRef);
          if (inst) {
            inst.serviceRoleLeak = {
              sourceRequestId: requestId,
              location: "request apikey/Authorization header",
            };
            await registry.upsertInstance(inst);
          }
        }
        // Do NOT proceed with this key for anything further
        return;
      }
    }
  }

  const inScope = await isInScope(sdk, host);

  // Ensure instance exists
  const existing = await registry.getInstance(projectRef);
  const inst: SupabaseInstance = existing ?? {
    projectRef,
    projectUrl,
    tables: {},
    rpcs: [],
    buckets: [],
    firstSeenRequestId: requestId,
    inScope,
  };

  if (!existing) {
    sdk.console.log(`[SupaScan] New Supabase instance discovered: ${projectUrl}`);
  }

  // Update anon key if we got one and it's not service_role
  if (anonKey && anonKeyRole !== "service_role") {
    inst.anonKey = anonKey;
    inst.anonKeyRole = anonKeyRole;
  }

  inst.inScope = inScope;

  // Track observed table from path
  const tableName = extractTableFromPath(path);
  if (tableName && tableName !== "rpc") {
    if (!inst.tables[tableName]) {
      inst.tables[tableName] = {
        name: tableName,
        observed: true,
        anonRead: "untested",
        anonWrite: "untested",
        evidenceRequestIds: [requestId],
      };
    } else {
      inst.tables[tableName]!.observed = true;
      if (!inst.tables[tableName]!.evidenceRequestIds.includes(requestId)) {
        inst.tables[tableName]!.evidenceRequestIds.push(requestId);
      }
    }
    await registry.upsertTable(projectRef, inst.tables[tableName]!);
  }

  // Track storage buckets observed passively in traffic.
  const bucketName = extractBucketFromPath(path);
  if (bucketName && !inst.buckets.includes(bucketName)) {
    inst.buckets = [...inst.buckets, bucketName];
  }

  // Track RPC functions observed passively in traffic.
  const rpcMatch = /^\/rest\/v1\/rpc\/([^/?]+)/.exec(path);
  if (rpcMatch?.[1] && !inst.rpcs.includes(rpcMatch[1])) {
    inst.rpcs = [...inst.rpcs, rpcMatch[1]];
  }

  // Raise an "instance detected" finding once. Retried until a saved request is
  // available (the request may not be queryable during the request intercept).
  if (!inst.detectionFindingRaised) {
    const raised = await reportInstanceDetected(sdk, projectUrl, projectRef, requestId);
    if (raised) inst.detectionFindingRaised = true;
  }

  await registry.upsertInstance(inst);
}

/**
 * Process an intercepted response passively.
 * Looks for JWTs and Supabase indicators in the body.
 */
export async function fingerprintResponse(
  sdk: SDK<API>,
  registry: Registry,
  requestId: string,
  host: string,
  path: string,
  _method: string,
  _requestHeaders: Record<string, string>,
  responseHeaders: Record<string, string>,
  responseBody: string,
  _statusCode: number
): Promise<void> {
  // Check response body for any Supabase indicator regardless of host
  const hasIndicator = bodyContainsSupabaseIndicator(responseBody);

  if (!isSupabaseEndpoint(host, path) && !hasIndicator) return;

  // Scan for JWTs in the response body
  const jwts = extractJwtsFromBody(responseBody);
  for (const { token, payload } of jwts) {
    if (payload.role === "service_role") {
      sdk.console.error(
        `[SupaScan] CRITICAL: service_role JWT detected in response body from ${host}`
      );

      // Try to find the project ref from host or from other indicators
      const projectRef = extractProjectRef(host);

      // If we found a projectRef, update the instance
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
              location: "response body (JWT)",
            };
            await registry.upsertInstance(inst);
          } else {
            const inScope = await isInScope(sdk, host);
            const newInst: SupabaseInstance = {
              projectRef,
              projectUrl,
              tables: {},
              rpcs: [],
              buckets: [],
              firstSeenRequestId: requestId,
              inScope,
              serviceRoleLeak: {
                sourceRequestId: requestId,
                location: "response body (JWT)",
              },
            };
            await registry.upsertInstance(newInst);
          }
        }
      } else {
        // No project ref from host — still report
        await reportServiceRoleLeak(
          sdk,
          `https://${host}`,
          `response body (JWT) — token starts: ${token.slice(0, 20)}...`,
          requestId
        );
      }
    }
  }

  // Scan any response body (JS bundles, HTML, JSON) for Supabase project refs
  if (hasIndicator || responseBody.includes(".supabase.co")) {
    const refs = extractProjectRefsFromBody(responseBody);
    for (const projectRef of refs) {
      const projectUrl = `https://${projectRef}.supabase.co`;
      const existing = await registry.getInstance(projectRef);
      if (!existing) {
        const inScope = await isInScope(sdk, `${projectRef}.supabase.co`);
        const newInst: SupabaseInstance = {
          projectRef,
          projectUrl,
          tables: {},
          rpcs: [],
          buckets: [],
          firstSeenRequestId: requestId,
          inScope,
        };
        const raised = await reportInstanceDetected(sdk, projectUrl, projectRef, requestId);
        if (raised) newInst.detectionFindingRaised = true;
        await registry.upsertInstance(newInst);
        sdk.console.log(
          `[SupaScan] Supabase project URL found in response body from ${host}: ${projectUrl}`
        );
      } else {
        // Update anonKey from body JWTs if not already known
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

    // Also extract anon keys from any JWT embedded in body (env var style)
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

  // Check Content-Range header for row count clues (passive)
  const contentRange = findHeader(responseHeaders, "content-range");
  if (contentRange && isSupabaseEndpoint(host, path)) {
    const tableName = extractTableFromPath(path);
    const projectRef = extractProjectRef(host);
    if (tableName && projectRef) {
      // Format: 0-N/total or */total
      const rangeMatch = /\/(\d+)$/.exec(contentRange);
      if (rangeMatch?.[1]) {
        const total = parseInt(rangeMatch[1], 10);
        const inst = await registry.getInstance(projectRef);
        if (inst?.tables[tableName]) {
          inst.tables[tableName]!.rowCount = total;
          await registry.upsertTable(projectRef, inst.tables[tableName]!);
        }
      }
    }
  }

  void host;
  void path;
  void responseHeaders;
}

/**
 * Convert raw request headers from the Caido SDK to a simple Record.
 * SDK returns Record<string, Array<string>> — we take the first value per key.
 */
export function headersToRecord(
  headers: Record<string, Array<string>>
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    const val = Array.isArray(v) ? v[0] : v;
    if (val !== undefined) {
      result[k.toLowerCase()] = val;
    }
  }
  return result;
}
