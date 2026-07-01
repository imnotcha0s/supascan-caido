import type { SDK } from "caido:plugin";
import type { Database } from "sqlite";
import type { API } from "./index";
import type { SupabaseInstance, TableState, ActivityEntry } from "./types";

/**
 * Persistent registry of discovered Supabase instances and the activity log.
 *
 * Backed by the plugin's SQLite database (`sdk.meta.db()`). That database is
 * plugin-global, so every row is keyed by the current Caido project id and the
 * cache is reloaded on project change — giving per-project persistence that
 * survives reloads. An in-memory cache fronts the DB so reads (which happen on
 * every intercepted request) stay synchronous-fast; writes are written through.
 *
 * If the database can't be opened, the registry degrades to in-memory only so
 * the plugin keeps working.
 */
export class Registry {
  private sdk: SDK<API>;
  private db: Database | undefined;
  private projectId = "default";
  private instances = new Map<string, SupabaseInstance>();
  private activity: ActivityEntry[] = [];

  constructor(sdk: SDK<API>) {
    this.sdk = sdk;
  }

  async init(): Promise<void> {
    try {
      this.db = await this.sdk.meta.db();
      await this.db.exec(
        `CREATE TABLE IF NOT EXISTS instances (
          project_id TEXT NOT NULL,
          project_ref TEXT NOT NULL,
          data TEXT NOT NULL,
          PRIMARY KEY (project_id, project_ref)
        )`
      );
      await this.db.exec(
        `CREATE TABLE IF NOT EXISTS activity (
          project_id TEXT NOT NULL,
          id TEXT NOT NULL,
          ts TEXT NOT NULL,
          data TEXT NOT NULL,
          PRIMARY KEY (project_id, id)
        )`
      );
    } catch (err) {
      this.sdk.console.error(
        `[SupaScan] DB init failed — using in-memory store only: ${String(err)}`
      );
      this.db = undefined;
    }

    await this.refreshProject();
  }

  /** Re-read the current project id and reload its data into the cache. */
  async refreshProject(): Promise<void> {
    try {
      const project = await this.sdk.projects.getCurrent();
      this.projectId = project?.getId() ?? "default";
    } catch {
      this.projectId = "default";
    }
    await this.loadFromDb();
  }

  private async loadFromDb(): Promise<void> {
    this.instances.clear();
    this.activity = [];
    if (!this.db) return;
    try {
      const instStmt = await this.db.prepare(
        `SELECT project_ref, data FROM instances WHERE project_id = ?`
      );
      const rows = await instStmt.all<{ project_ref: string; data: string }>(this.projectId);
      for (const row of rows) {
        try {
          this.instances.set(row.project_ref, JSON.parse(row.data) as SupabaseInstance);
        } catch {
          // skip corrupt row
        }
      }

      const actStmt = await this.db.prepare(
        `SELECT data FROM activity WHERE project_id = ? ORDER BY ts DESC LIMIT 500`
      );
      const actRows = await actStmt.all<{ data: string }>(this.projectId);
      for (const row of actRows) {
        try {
          this.activity.push(JSON.parse(row.data) as ActivityEntry);
        } catch {
          // skip corrupt row
        }
      }
    } catch (err) {
      this.sdk.console.error(`[SupaScan] DB load failed: ${String(err)}`);
    }
  }

  async upsertInstance(instance: SupabaseInstance): Promise<void> {
    this.instances.set(instance.projectRef, instance);
    await this.persistInstance(instance);
  }

  async upsertTable(projectRef: string, table: TableState): Promise<void> {
    const inst = this.instances.get(projectRef);
    if (!inst) return;
    inst.tables[table.name] = table;
    await this.persistInstance(inst);
  }

  async getInstances(): Promise<SupabaseInstance[]> {
    return Array.from(this.instances.values());
  }

  async getInstance(projectRef: string): Promise<SupabaseInstance | undefined> {
    return this.instances.get(projectRef);
  }

  async addActivityEntry(entry: ActivityEntry): Promise<void> {
    this.activity.unshift(entry);
    if (this.activity.length > 500) {
      this.activity = this.activity.slice(0, 500);
    }
    if (!this.db) return;
    try {
      const stmt = await this.db.prepare(
        `INSERT OR REPLACE INTO activity (project_id, id, ts, data) VALUES (?, ?, ?, ?)`
      );
      await stmt.run(this.projectId, entry.id, entry.timestamp, JSON.stringify(entry));
      const prune = await this.db.prepare(
        `DELETE FROM activity WHERE project_id = ? AND id NOT IN (
           SELECT id FROM activity WHERE project_id = ? ORDER BY ts DESC LIMIT 500
         )`
      );
      await prune.run(this.projectId, this.projectId);
    } catch (err) {
      this.sdk.console.error(`[SupaScan] DB activity write failed: ${String(err)}`);
    }
  }

  async getActivityLog(): Promise<ActivityEntry[]> {
    return this.activity.slice(0, 200);
  }

  async clearActivityLog(): Promise<void> {
    this.activity = [];
    if (!this.db) return;
    try {
      const stmt = await this.db.prepare(`DELETE FROM activity WHERE project_id = ?`);
      await stmt.run(this.projectId);
    } catch (err) {
      this.sdk.console.error(`[SupaScan] DB activity clear failed: ${String(err)}`);
    }
  }

  private async persistInstance(instance: SupabaseInstance): Promise<void> {
    if (!this.db) return;
    try {
      const stmt = await this.db.prepare(
        `INSERT INTO instances (project_id, project_ref, data) VALUES (?, ?, ?)
         ON CONFLICT(project_id, project_ref) DO UPDATE SET data = excluded.data`
      );
      await stmt.run(this.projectId, instance.projectRef, JSON.stringify(instance));
    } catch (err) {
      this.sdk.console.error(`[SupaScan] DB instance write failed: ${String(err)}`);
    }
  }
}
