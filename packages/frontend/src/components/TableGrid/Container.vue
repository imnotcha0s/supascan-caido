<template>
  <div>
    <div
      v-if="tables.length > 0"
      class="tablegrid-toolbar"
    >
      <span>{{ tables.length }} table(s)</span>
      <button
        class="supascan-btn supascan-btn-danger"
        style="font-size:11px;padding:2px 8px;"
        :disabled="!instance"
        title="Remove all tables for this instance"
        @click="clearTables"
      >
        <i class="fas fa-trash" /> Clear tables
      </button>
    </div>
    <div
      v-if="tables.length === 0"
      class="empty-state"
    >
      <i class="fas fa-table" />
      <span>No tables observed yet</span>
      <span style="font-size:11px;color:#64748b;">Tables are detected passively as you browse the target app</span>
    </div>
    <table
      v-else
      class="table-grid"
    >
      <thead>
        <tr>
          <th style="width:24px;" />
          <th><i class="fas fa-table" /> Table</th>
          <th>Read</th>
          <th>Rows</th>
          <th>Write</th>
          <th>Columns</th>
          <th>Replay</th>
        </tr>
      </thead>
      <tbody>
        <template
          v-for="table in tables"
          :key="table.name"
        >
          <tr>
            <td>
              <button
                class="expand-btn"
                :title="expanded.has(table.name) ? 'Collapse' : 'Expand'"
                @click="toggle(table.name)"
              >
                <i :class="expanded.has(table.name) ? 'fas fa-chevron-down' : 'fas fa-chevron-right'" />
              </button>
            </td>
            <td>
              <span style="font-weight:600;">{{ table.name }}</span>
              <span
                v-if="table.observed"
                style="margin-left:4px;font-size:10px;color:#3ecf8e;"
                title="Observed in traffic"
              ><i class="fas fa-circle" /></span>
            </td>
            <td>
              <span
                v-if="table.anonRead"
                class="status-pill"
                :class="`status-${table.anonRead}`"
              >{{ table.anonRead }}</span>
              <span
                v-else
                class="status-pill status-untested"
              >—</span>
            </td>
            <td>
              <span
                v-if="table.rowCount !== undefined"
                style="color:#f87171;font-weight:700;"
              >
                {{ table.rowCount.toLocaleString() }}
              </span>
              <span
                v-else
                style="color:#64748b;"
              >—</span>
            </td>
            <td>
              <span
                v-if="table.anonWrite"
                class="status-pill"
                :class="`status-${table.anonWrite}`"
              >{{ table.anonWrite }}</span>
              <span
                v-else
                class="status-pill status-untested"
              >—</span>
            </td>
            <td>
              <div
                v-if="table.columns && table.columns.length > 0"
                class="chip-list"
              >
                <span
                  v-for="col in table.columns.slice(0, 4)"
                  :key="col"
                  class="chip"
                >{{ col }}</span>
                <span
                  v-if="table.columns.length > 4"
                  class="chip"
                >+{{ table.columns.length - 4 }}</span>
              </div>
              <span
                v-else
                style="color:#64748b;"
              >—</span>
            </td>
            <td>
              <div class="replay-actions">
                <button
                  class="supascan-btn"
                  style="font-size:10px;padding:1px 6px;"
                  :disabled="!instance"
                  title="Open a GET request to this table in Replay"
                  @click="sendToReplay(table, 'GET')"
                >
                  GET
                </button>
                <button
                  class="supascan-btn"
                  style="font-size:10px;padding:1px 6px;"
                  :disabled="!instance"
                  title="Open a POST (insert) request to this table in Replay"
                  @click="sendToReplay(table, 'POST')"
                >
                  POST
                </button>
                <button
                  class="supascan-btn"
                  style="font-size:10px;padding:1px 6px;"
                  :disabled="!instance"
                  title="Open a PATCH (update) request to this table in Replay"
                  @click="sendToReplay(table, 'PATCH')"
                >
                  PATCH
                </button>
              </div>
            </td>
          </tr>
          <tr
            v-if="expanded.has(table.name)"
            class="detail-row"
          >
            <td colspan="7">
              <div class="detail-box">
                <div class="detail-head">
                  <span><i class="fas fa-file-code" /> Sample row (from read, limit=1)</span>
                  <button
                    v-if="table.sampleRow"
                    class="supascan-btn"
                    style="font-size:10px;padding:1px 6px;"
                    @click="copy(table.sampleRow)"
                  >
                    <i class="fas fa-copy" /> Copy
                  </button>
                </div>
                <pre
                  v-if="table.sampleRow"
                  class="detail-pre"
                >{{ table.sampleRow }}</pre>
                <div
                  v-else
                  style="font-size:11px;color:#64748b;padding:6px 0;"
                >
                  No content captured. Run a read check — if the table is readable, the first row appears here.
                </div>

                <div
                  v-if="table.idor"
                  class="idor-block"
                >
                  <div class="detail-head">
                    <span><i class="fas fa-users-rectangle" /> Cross-user read diff (IDOR/RLS)</span>
                    <span
                      v-if="table.idor.shared"
                      class="status-pill status-rows"
                    >shared — broken RLS</span>
                    <span
                      v-else
                      class="status-pill status-denied"
                    >scoped per user</span>
                  </div>
                  <table class="idor-table">
                    <tr
                      v-for="u in table.idor.perUser"
                      :key="u.label"
                    >
                      <td class="idor-user">
                        {{ u.label }}
                      </td>
                      <td>{{ u.rowCount.toLocaleString() }} rows</td>
                      <td class="idor-sample">
                        {{ u.sampleId !== undefined ? `first id: ${u.sampleId}` : "—" }}
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, type PropType } from "vue";
import type { TableState, SupabaseInstance } from "backend";
import type { FrontendSDK } from "../../index";

export default defineComponent({
  name: "TableGridContainer",
  props: {
    tables: {
      type: Array as PropType<TableState[]>,
      default: () => [],
    },
    instance: {
      type: Object as PropType<SupabaseInstance | null>,
      default: null,
    },
    sdk: {
      type: Object as PropType<FrontendSDK>,
      default: undefined,
    },
  },
  setup(props) {
    const expanded = ref(new Set<string>());

    function toggle(name: string) {
      const next = new Set(expanded.value);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      expanded.value = next;
    }

    async function copy(text: string) {
      try {
        await navigator.clipboard.writeText(text);
        props.sdk?.window.showToast("Copied to clipboard", { variant: "success" });
      } catch {
        props.sdk?.window.showToast("Copy failed", { variant: "error" });
      }
    }

    async function clearTables() {
      const inst = props.instance;
      const sdk = props.sdk;
      if (!inst || !sdk) return;
      await sdk.backend.clearTables(inst.projectRef);
      sdk.window.showToast("Tables cleared", { variant: "success" });
    }

    function bearerFor(inst: SupabaseInstance): string {
      const active = (inst.sessions ?? []).find((s) => s.id === inst.activeSessionId);
      return active?.token ?? inst.anonKey ?? "";
    }

    // Build a JSON body payload from the sampled row (preferred) or a column
    // skeleton, so POST/PATCH requests ship with a real payload to edit.
    function buildPayload(table: TableState): { body: string; idValue?: string } {
      if (table.sampleRow !== undefined) {
        try {
          const obj = JSON.parse(table.sampleRow) as Record<string, unknown>;
          const idValue = obj.id !== undefined ? String(obj.id) : undefined;
          return { body: JSON.stringify(obj, null, 2), idValue };
        } catch {
          // fall through to skeleton
        }
      }
      if (table.columns && table.columns.length > 0) {
        const skeleton: Record<string, string> = {};
        for (const col of table.columns) skeleton[col] = "";
        return { body: JSON.stringify(skeleton, null, 2) };
      }
      return { body: "{\n  \n}" };
    }

    async function sendToReplay(table: TableState, method: "GET" | "POST" | "PATCH") {
      const inst = props.instance;
      const sdk = props.sdk;
      if (!inst || !sdk) return;

      const host = `${inst.projectRef}.supabase.co`;
      const anon = inst.anonKey ?? "";
      const bearer = bearerFor(inst);
      const name = table.name;

      let path = `/rest/v1/${name}`;
      let body = "";
      if (method === "POST") {
        body = buildPayload(table).body;
      } else if (method === "PATCH") {
        const payload = buildPayload(table);
        const filter = payload.idValue !== undefined ? `id=eq.${payload.idValue}` : "id=eq.REPLACE_ME";
        path = `/rest/v1/${name}?${filter}`;
        body = payload.body;
      } else {
        path = `/rest/v1/${name}?select=*&limit=10`;
      }

      const lines = [
        `${method} ${path} HTTP/1.1`,
        `Host: ${host}`,
        `apikey: ${anon}`,
        `Authorization: Bearer ${bearer}`,
        `Accept: application/json`,
      ];
      if (method !== "GET") {
        const len = new TextEncoder().encode(body).length;
        lines.push(`Content-Type: application/json`);
        lines.push(`Prefer: return=representation`);
        lines.push(`Content-Length: ${len}`);
      }
      const raw = lines.join("\r\n") + "\r\n\r\n" + (method === "GET" ? "" : body);

      const session = await sdk.replay.createSession({
        type: "Raw",
        raw,
        connectionInfo: { host, port: 443, isTLS: true },
      });
      sdk.replay.openTab(session.id);
      sdk.window.showToast(`Opened ${method} ${name} in Replay`, { variant: "success" });
    }

    return { expanded, toggle, copy, clearTables, sendToReplay };
  },
});
</script>
