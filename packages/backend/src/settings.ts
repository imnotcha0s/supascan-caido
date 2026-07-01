import type { SDK } from "caido:plugin";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import type { API } from "./index";
import type { PluginSettings } from "./types";
import { DEFAULT_SETTINGS } from "./ratelimit";

/**
 * Settings persistence to a JSON file in the plugin data directory.
 * Every call is guarded so a filesystem failure never breaks the plugin —
 * it just falls back to defaults / in-memory state.
 */
function settingsPath(sdk: SDK<API>): string {
  return `${sdk.meta.path()}/settings.json`;
}

export function loadSettings(sdk: SDK<API>): PluginSettings {
  try {
    const raw = readFileSync(settingsPath(sdk), "utf-8") as string;
    const parsed = JSON.parse(raw) as Partial<PluginSettings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettingsToDisk(sdk: SDK<API>, settings: PluginSettings): void {
  try {
    mkdirSync(sdk.meta.path(), { recursive: true });
    writeFileSync(settingsPath(sdk), JSON.stringify(settings, null, 2));
  } catch (err) {
    sdk.console.warn(`[SupaScan] Could not persist settings: ${String(err)}`);
  }
}
