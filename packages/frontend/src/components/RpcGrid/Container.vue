<template>
  <div>
    <!-- Brute-force panel -->
    <div class="rpc-bf">
      <div class="rpc-bf-head">
        <span><i class="fas fa-hammer" /> Brute-force RPC functions</span>
        <button
          class="supascan-btn supascan-btn-primary"
          style="font-size:11px;padding:3px 10px;"
          :disabled="!hasCreds || busy"
          @click="bruteforce"
        >
          <i :class="busy ? 'fas fa-spinner fa-spin' : 'fas fa-bolt'" />
          {{ busy ? "Running…" : "Bruteforce" }}
        </button>
      </div>
      <textarea
        v-model="wordlist"
        class="settings-input"
        rows="3"
        placeholder="Optional: extra function names, one per line (get_user, is_admin, http_get, ...)"
        style="font-family:ui-monospace,monospace;resize:vertical;width:100%;"
      />
      <span style="font-size:11px;color:#64748b;">Tests your names plus a built-in list of ~55 common/dangerous functions, as the active session. PostgREST hints confirm which functions exist.</span>
    </div>

    <div
      v-if="rows.length === 0"
      class="empty-state"
    >
      <i class="fas fa-code" />
      <span>No RPC functions yet</span>
      <span style="font-size:11px;color:#64748b;">Run an RPC check, brute-force above, or browse the target app.</span>
    </div>
    <table
      v-else
      class="table-grid"
    >
      <thead>
        <tr>
          <th><i class="fas fa-code" /> Function</th>
          <th>Status</th>
          <th>Unauth reachable</th>
          <th>Replay</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="fn in rows"
          :key="fn.name"
        >
          <td><span style="font-weight:600;">{{ fn.name }}</span></td>
          <td>
            <span
              v-if="fn.status !== undefined"
              :style="{ color: statusColor(fn.status) }"
              style="font-weight:600;"
            >{{ fn.status }}</span>
            <span
              v-else
              style="color:#64748b;"
            >—</span>
          </td>
          <td>
            <span
              v-if="fn.exposed"
              class="status-pill status-rows"
            >yes</span>
            <span
              v-else-if="fn.status !== undefined"
              class="status-pill status-denied"
            >no</span>
            <span
              v-else
              class="status-pill status-untested"
            >untested</span>
          </td>
          <td>
            <button
              class="supascan-btn"
              style="font-size:10px;padding:1px 6px;"
              :disabled="!instance"
              title="Open a call to this RPC function in Replay"
              @click="replayCall(fn.name)"
            >
              <i class="fas fa-paper-plane" /> Call
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, type PropType } from "vue";
import type { SupabaseInstance, RpcState } from "backend";
import type { FrontendSDK } from "../../index";

export default defineComponent({
  name: "RpcGridContainer",
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
    const busy = ref(false);
    const wordlist = ref("");

    const hasCreds = computed(
      () => !!props.instance && (!!props.instance.anonKey || (props.instance.sessions?.length ?? 0) > 0)
    );

    async function bruteforce() {
      const inst = props.instance;
      const sdk = props.sdk;
      if (!inst || !sdk) return;
      busy.value = true;
      try {
        await sdk.backend.runRpcBruteforce(inst.projectRef, wordlist.value);
      } finally {
        busy.value = false;
      }
    }

    const rows = computed<RpcState[]>(() => {
      const inst = props.instance;
      if (!inst) return [];
      const states = inst.rpcStates ?? {};
      const names = [...new Set([...inst.rpcs, ...Object.keys(states)])];
      return names.map((name) => states[name] ?? { name, exposed: false });
    });

    function statusColor(code: number): string {
      if (code >= 200 && code < 300) return "#4ade80";
      if (code >= 400) return "#f87171";
      return "#facc15";
    }

    function bearerFor(inst: SupabaseInstance): string {
      const active = (inst.sessions ?? []).find((s) => s.id === inst.activeSessionId);
      return active?.token ?? inst.anonKey ?? "";
    }

    async function replayCall(fn: string) {
      const inst = props.instance;
      const sdk = props.sdk;
      if (!inst || !sdk) return;

      const host = `${inst.projectRef}.supabase.co`;
      const anon = inst.anonKey ?? "";
      const bearer = bearerFor(inst);
      const body = "{}";
      const len = new TextEncoder().encode(body).length;

      const raw = [
        `POST /rest/v1/rpc/${fn} HTTP/1.1`,
        `Host: ${host}`,
        `apikey: ${anon}`,
        `Authorization: Bearer ${bearer}`,
        `Content-Type: application/json`,
        `Content-Length: ${len}`,
      ].join("\r\n") + "\r\n\r\n" + body;

      const session = await sdk.replay.createSession({
        type: "Raw",
        raw,
        connectionInfo: { host, port: 443, isTLS: true },
      });
      sdk.replay.openTab(session.id);
      sdk.window.showToast(`Opened rpc/${fn} in Replay`, { variant: "success" });
    }

    return { rows, statusColor, replayCall, busy, wordlist, bruteforce, hasCreds };
  },
});
</script>
