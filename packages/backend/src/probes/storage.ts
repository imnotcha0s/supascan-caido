import type { SDK } from "caido:plugin";
import { RequestSpec } from "caido:utils";
import type { API } from "../index";
import type { Registry } from "../registry";
import type { RateLimiter } from "../ratelimit";
import type { StorageObject } from "../types";
import { reportPublicBucket } from "../findings";
import { credsFor, activeSession, hasUsableCreds, parseWordlist, type ProbeCreds } from "../extract";

/**
 * Common Supabase Storage bucket names tried in addition to observed ones.
 */
export const COMMON_BUCKETS = [
  "avatars", "public", "files", "uploads", "images", "media", "assets",
  "documents", "photos", "attachments", "videos", "audio", "thumbnails",
  "profile-pictures", "profile_pictures", "user-uploads", "user_uploads",
  "private", "backups", "exports", "temp", "logos", "banners", "products",
];

const MAX_FILES = 300; // cap objects collected per bucket
const MAX_REQUESTS = 60; // cap list requests per bucket
const MAX_DEPTH = 5; // cap folder recursion depth
const PAGE = 100; // objects per list request

/**
 * Storage object enumeration.
 *
 * `POST /storage/v1/object/list/{bucket}` returns 200 for any bucket name, but a
 * real *public* bucket returns actual object entries while empty/private/missing
 * ones return `[]`. So we recursively list each candidate bucket (descending
 * into folders) and report the ones that expose files.
 */
export async function runStorageEnum(
  sdk: SDK<API>,
  registry: Registry,
  limiter: RateLimiter,
  projectRef: string,
  bucketWordlist: string,
  onProgress: (msg: string) => void
): Promise<void> {
  const instance = await registry.getInstance(projectRef);
  if (!instance) {
    onProgress("Instance not found.");
    return;
  }
  if (!hasUsableCreds(instance)) {
    onProgress("No credentials (anon key or session) — cannot enumerate storage.");
    return;
  }

  const creds = credsFor(instance);
  const active = activeSession(instance);
  if (active) onProgress(`Running as authenticated session: ${active.email}`);

  const custom = parseWordlist(bucketWordlist);
  const bruteforce = limiter.getSettings().discoveryEnabled ? COMMON_BUCKETS : [];
  const candidates = [...new Set([...instance.buckets, ...custom, ...bruteforce])];
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
    if (listing === undefined) continue;

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

  onProgress(`Storage enumeration complete — ${bucketsWithFiles} bucket(s) exposing files.`);
}

type BucketListing = {
  files: StorageObject[];
  requestId: string;
};

/**
 * Recursively list a bucket's objects, descending into folders via prefixes.
 */
async function listBucketRecursive(
  sdk: SDK<API>,
  limiter: RateLimiter,
  projectUrl: string,
  creds: ProbeCreds,
  bucket: string
): Promise<BucketListing | undefined> {
  const files: StorageObject[] = [];
  const queue: string[] = [""];
  const seen = new Set<string>([""]);
  let requests = 0;
  let firstRequestId = "";
  let firstOk = false;

  while (queue.length > 0 && files.length < MAX_FILES && requests < MAX_REQUESTS) {
    if (limiter.isKilled()) break;
    const prefix = queue.shift();
    if (prefix === undefined) break;

    const page = await listObjects(sdk, limiter, projectUrl, creds, bucket, prefix);
    requests++;
    if (page === undefined) {
      if (prefix === "") return undefined; // couldn't even reach the bucket
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

  if (!firstOk) return undefined;
  return { files, requestId: firstRequestId };
}

type ListEntry = {
  name: string;
  isFolder: boolean;
  size?: number;
  mimetype?: string;
};

type ListPage = {
  entries: ListEntry[];
  requestId: string;
};

async function listObjects(
  sdk: SDK<API>,
  limiter: RateLimiter,
  projectUrl: string,
  creds: ProbeCreds,
  bucket: string,
  prefix: string
): Promise<ListPage | undefined> {
  const allowed = await limiter.acquire();
  if (!allowed) return undefined;
  try {
    const spec = new RequestSpec(`${projectUrl}/storage/v1/object/list/${bucket}`);
    spec.setMethod("POST");
    spec.setHeader("apikey", creds.apikey);
    spec.setHeader("Authorization", `Bearer ${creds.bearer}`);
    spec.setHeader("Content-Type", "application/json");
    spec.setBody(
      JSON.stringify({
        prefix,
        limit: PAGE,
        offset: 0,
        sortBy: { column: "name", order: "asc" },
      })
    );

    const result = await sdk.requests.send(spec);
    const statusCode = result.response?.getCode() ?? 0;
    const requestId = result.request?.getId() ?? "";
    if (statusCode !== 200) return undefined;

    const body = result.response?.getBody()?.toText() ?? "";
    let parsed: unknown;
    try {
      parsed = JSON.parse(body);
    } catch {
      return { entries: [], requestId };
    }
    if (!Array.isArray(parsed)) return { entries: [], requestId };

    const entries: ListEntry[] = [];
    for (const raw of parsed) {
      if (raw === null || typeof raw !== "object") continue;
      const obj = raw as {
        name?: unknown;
        id?: unknown;
        metadata?: { size?: unknown; mimetype?: unknown } | null;
      };
      if (typeof obj.name !== "string") continue;
      // Folders have id === null and metadata === null; files have an id + metadata.
      const isFolder = obj.id === null || obj.id === undefined;
      const size = typeof obj.metadata?.size === "number" ? obj.metadata.size : undefined;
      const mimetype =
        typeof obj.metadata?.mimetype === "string" ? obj.metadata.mimetype : undefined;
      entries.push({ name: obj.name, isFolder, size, mimetype });
    }
    return { entries, requestId };
  } catch (err) {
    sdk.console.error(`[SupaScan] Storage list error for ${bucket}/${prefix}: ${String(err)}`);
    return undefined;
  } finally {
    limiter.release();
  }
}

async function recordBucket(
  registry: Registry,
  projectRef: string,
  name: string,
  files: StorageObject[]
): Promise<void> {
  const inst = await registry.getInstance(projectRef);
  if (!inst) return;
  if (!inst.buckets.includes(name)) inst.buckets = [...inst.buckets, name];
  inst.bucketStates = { ...(inst.bucketStates ?? {}) };
  inst.bucketStates[name] = { name, fileCount: files.length, files: files.slice(0, 100) };
  await registry.upsertInstance(inst);
}
