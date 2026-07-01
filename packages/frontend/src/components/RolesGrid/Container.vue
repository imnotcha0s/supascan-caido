<template>
  <div>
    <div
      v-if="rows.length === 0"
      class="empty-state"
    >
      <i class="fas fa-user-shield" />
      <span>No role/schema results yet</span>
      <span style="font-size:11px;color:#64748b;">Run the Roles check to brute-force privileged PostgREST schemas as the active session.</span>
    </div>
    <div v-else>
      <div style="font-size:11px;color:#64748b;margin-bottom:8px;">
        Tested as role: <strong style="color:#3ecf8e;">{{ rows[0].testedAs }}</strong>
        — switch the active session in the Sessions tab and re-run to compare roles.
      </div>
      <table class="table-grid">
        <thead>
          <tr>
            <th><i class="fas fa-layer-group" /> Schema</th>
            <th>Sensitivity</th>
            <th>Reachable</th>
            <th>Status</th>
            <th>Replay</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="s in rows"
            :key="s.name"
          >
            <td><span style="font-weight:600;">{{ s.name }}</span></td>
            <td>
              <span
                class="status-pill"
                :class="sensitivityClass(s.sensitivity)"
              >{{ s.sensitivity }}</span>
            </td>
            <td>
              <span
                v-if="s.exposed"
                class="status-pill status-rows"
              >yes — privesc</span>
              <span
                v-else
                class="status-pill status-denied"
              >no</span>
            </td>
            <td>
              <span style="color:#64748b;">{{ s.status ?? "—" }}</span>
            </td>
            <td>
              <button
                class="supascan-btn"
                style="font-size:10px;padding:1px 6px;"
                :disabled="!instance"
                title="Open a request to this schema in Replay (Accept-Profile)"
                @click="replaySchema(s.name)"
              >
                <i class="fas fa-paper-plane" /> Profile
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, type PropType } from "vue";
import type { SupabaseInstance, SchemaState } from "backend";
import type { FrontendSDK } from "../../index";

export default defineComponent({
  name: "RolesGridContainer",
  props: {
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
    const rows = computed<SchemaState[]>(() => {
      const states = props.instance?.schemaStates ?? {};
      // Exposed first, then by sensitivity.
      const order = { critical: 0, high: 1, medium: 2 };
      return Object.values(states).sort((a, b) => {
        if (a.exposed !== b.exposed) return a.exposed ? -1 : 1;
        return order[a.sensitivity] - order[b.sensitivity];
      });
    });

    function sensitivityClass(s: SchemaState["sensitivity"]): string {
      if (s === "critical") return "status-rows";
      if (s === "high") return "status-accepted";
      return "status-untested";
    }

    function bearerFor(inst: SupabaseInstance): string {
      const active = (inst.sessions ?? []).find((x) => x.id === inst.activeSessionId);
      return active?.token ?? inst.anonKey ?? "";
    }

    async function replaySchema(schema: string) {
      const inst = props.instance;
      const sdk = props.sdk;
      if (!inst || !sdk) return;

      const host = `${inst.projectRef}.supabase.co`;
      const anon = inst.anonKey ?? "";
      const bearer = bearerFor(inst);

      const raw = [
        `GET /rest/v1/ HTTP/1.1`,
        `Host: ${host}`,
        `apikey: ${anon}`,
        `Authorization: Bearer ${bearer}`,
        `Accept-Profile: ${schema}`,
        `Accept: application/json`,
      ].join("\r\n") + "\r\n\r\n";

      const session = await sdk.replay.createSession({
        type: "Raw",
        raw,
        connectionInfo: { host, port: 443, isTLS: true },
      });
      sdk.replay.openTab(session.id);
      sdk.window.showToast(`Opened schema ${schema} in Replay`, { variant: "success" });
    }

    return { rows, sensitivityClass, replaySchema };
  },
});
</script>
