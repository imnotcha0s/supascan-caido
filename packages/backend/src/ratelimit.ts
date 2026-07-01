import type { PluginSettings } from "./types";

const DEFAULT_SETTINGS: PluginSettings = {
  maxRequestsPerSecond: 5,
  maxConcurrency: 3,
  redactEvidence: false,
  testEmail: "supascan.probe@example.com",
  tableWordlist: "",
  useCustomWordlist: false,
  discoveryEnabled: true,
};

/**
 * Simple in-memory rate limiter with a kill switch.
 * Uses a token bucket approach.
 */
export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private killed = false;
  private settings: PluginSettings;
  private activeRequests = 0;

  constructor(settings?: Partial<PluginSettings>) {
    this.settings = { ...DEFAULT_SETTINGS, ...settings };
    this.tokens = this.settings.maxRequestsPerSecond;
    this.lastRefill = Date.now();
  }

  updateSettings(settings: Partial<PluginSettings>): void {
    this.settings = { ...this.settings, ...settings };
    this.tokens = Math.min(this.tokens, this.settings.maxRequestsPerSecond);
  }

  getSettings(): PluginSettings {
    return { ...this.settings };
  }

  kill(): void {
    this.killed = true;
  }

  reset(): void {
    this.killed = false;
    this.tokens = this.settings.maxRequestsPerSecond;
    this.lastRefill = Date.now();
    this.activeRequests = 0;
  }

  isKilled(): boolean {
    return this.killed;
  }

  /**
   * Attempt to acquire a slot. Returns true if allowed, false if killed or rate limited.
   */
  async acquire(): Promise<boolean> {
    if (this.killed) return false;

    // Concurrency gate
    if (this.activeRequests >= this.settings.maxConcurrency) {
      await this.waitForSlot();
      if (this.killed) return false;
    }

    // Token bucket refill
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(
      this.settings.maxRequestsPerSecond,
      this.tokens + elapsed * this.settings.maxRequestsPerSecond
    );
    this.lastRefill = now;

    if (this.tokens < 1) {
      const waitMs = ((1 - this.tokens) / this.settings.maxRequestsPerSecond) * 1000;
      await sleep(waitMs);
      if (this.killed) return false;
      this.tokens = 0;
    } else {
      this.tokens -= 1;
    }

    this.activeRequests++;
    return true;
  }

  release(): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
  }

  private async waitForSlot(): Promise<void> {
    const maxWait = 10_000;
    const start = Date.now();
    while (this.activeRequests >= this.settings.maxConcurrency) {
      if (this.killed || Date.now() - start > maxWait) return;
      await sleep(100);
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export { DEFAULT_SETTINGS };
