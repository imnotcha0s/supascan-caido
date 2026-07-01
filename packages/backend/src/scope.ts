import type { SDK } from "caido:plugin";
import type { API } from "./index";

/**
 * Check whether a given host is covered by the user's Caido scope.
 * This is a HARD REQUIREMENT — every active probe must call this first.
 */
export async function isInScope(sdk: SDK<API>, host: string): Promise<boolean> {
  try {
    const scopes = await sdk.scope.getAll();
    for (const scope of scopes) {
      for (const pattern of scope.allowlist) {
        if (hostMatchesPattern(host, pattern)) return true;
      }
    }
    return false;
  } catch {
    // If scope check fails, default to out-of-scope (safe default)
    return false;
  }
}

/**
 * Match a host against a scope pattern.
 * Patterns can be:
 *   - exact host: "abc.supabase.co"
 *   - wildcard host: "*.supabase.co"
 *   - full URL pattern: "https://abc.supabase.co/*"
 *   - bare domain: "supabase.co"
 */
function hostMatchesPattern(host: string, pattern: string): boolean {
  const lHost = host.toLowerCase();
  const lPattern = pattern.toLowerCase();

  // Strip scheme and path from pattern to get just the host part
  let patternHost = lPattern;
  try {
    // If it looks like a URL, parse it
    if (lPattern.includes("://")) {
      const url = new URL(lPattern.replace(/\*/g, "WILDCARD"));
      patternHost = url.hostname.replace(/wildcard/g, "*");
    }
  } catch {
    // Not a valid URL, treat as raw host pattern
  }

  // Remove trailing slash or path
  patternHost = patternHost.split("/")[0] ?? patternHost;

  if (patternHost.startsWith("*.")) {
    const suffix = patternHost.slice(2);
    return lHost === suffix || lHost.endsWith("." + suffix);
  }

  return lHost === patternHost || lHost.endsWith("." + patternHost);
}

/**
 * Extract the hostname from a project URL.
 */
export function hostFromUrl(projectUrl: string): string {
  try {
    return new URL(projectUrl).hostname;
  } catch {
    return projectUrl;
  }
}
