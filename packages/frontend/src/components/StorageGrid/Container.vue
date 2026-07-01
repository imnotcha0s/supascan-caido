<template>
  <div>
    <!-- Enumeration panel -->
    <div class="rpc-bf">
      <div class="rpc-bf-head">
        <span><i class="fas fa-magnifying-glass" /> Enumerate storage objects</span>
        <button
          class="supascan-btn supascan-btn-primary"
          style="font-size:11px;padding:3px 10px;"
          :disabled="!hasCreds || busy"
          @click="enumerate"
        >
          <i :class="busy ? 'fas fa-spinner fa-spin' : 'fas fa-bolt'" />
          {{ busy ? "Listing…" : "List objects" }}
        </button>
      </div>
      <textarea
        v-model="wordlist"
        class="settings-input"
        rows="2"
        placeholder="Optional: extra bucket names, one per line (avatars, public, uploads, ...)"
        style="font-family:ui-monospace,monospace;resize:vertical;width:100%;"
      />
      <span style="font-size:11px;color:#64748b;">Recursively lists objects in observed buckets, your names, and a built-in list (if discovery is on). Buckets that return files are public/exposed.</span>
    </div>

    <div
      v-if="rows.length === 0"
      class="empty-state"
    >
      <i class="fas fa-folder-open" />
      <span>No storage buckets yet</span>
      <span style="font-size:11px;color:#64748b;">Browse the app's storage to discover buckets passively, or run "List objects" above.</span>
    </div>
    <table
      v-else
      class="table-grid"
    >
      <thead>
        <tr>
          <th style="width:24px;" />
          <th><i class="fas fa-folder" /> Bucket</th>
          <th>Objects</th>
          <th>Replay</th>
        </tr>
      </thead>
      <tbody>
        <template
          v-for="b in rows"
          :key="b.name"
        >
          <tr>
            <td>
              <button
                v-if="b.state && b.state.files.length > 0"
                class="expand-btn"
                @click="toggle(b.name)"
              >
                <i :class="expanded.has(b.name) ? 'fas fa-chevron-down' : 'fas fa-chevron-right'" />
              </button>
            </td>
            <td><span style="font-weight:600;">{{ b.name }}</span></td>
            <td>
              <span
                v-if="b.state && b.state.fileCount > 0"
                style="color:#f87171;font-weight:700;"
              >{{ b.state.fileCount.toLocaleString() }} file(s)</span>
              <span
                v-else-if="b.state"
                style="color:#64748b;"
              >empty / private</span>
              <span
                v-else
                style="color:#64748b;"
              >untested</span>
            </td>
            <td>
              <button
                class="supascan-btn"
                style="font-size:10px;padding:1px 6px;"
                :disabled="!instance"
                title="Open a list-objects request for this bucket in Replay"
                @click="replayList(b.name)"
              >
                <i class="fas fa-paper-plane" /> List
              </button>
            </td>
          </tr>
          <tr
            v-if="expanded.has(b.name) && b.state"
            class="detail-row"
          >
            <td colspan="4">
              <div class="detail-box">
                <div class="detail-head">
                  <span><i class="fas fa-file" /> Objects in "{{ b.name }}" (showing {{ b.state.files.length }})</span>
                </div>
                <table class="idor-table">
                  <tr
                    v-for="f in b.state.files"
                    :key="f.path"
                  >
                    <td class="idor-user">
                      {{ f.path }}
                    </td>
                    <td style="white-space:nowrap;">
                      {{ formatSize(f.size) }}
                    </td>
                    <td style="white-space:nowrap;color:#64748b;">
                      {{ f.mimetype ?? "" }}
                    </td>
                    <td style="width:130px;">
                      <div style="display:flex;gap:4px;">
                        <button
                          class="supascan-btn"
                          style="font-size:10px;padding:1px 6px;"
                          title="Copy the public URL of this object"
                          @click="copyUrl(b.name, f.path)"
                        >
                          <i class="fas fa-link" />
                        </button>
                        <button
                          class="supascan-btn"
                          style="font-size:10px;padding:1px 6px;"
                          title="Download this object"
                          @click="download(b.name, f.path)"
                        >
                          <i class="fas fa-download" />
                        </button>
                        <button
                          class="supascan-btn"
                          style="font-size:10px;padding:1px 6px;"
                          title="Open a GET for this object in Replay"
                          @click="replayGet(b.name, f.path)"
                        >
                          <i class="fas fa-paper-plane" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, type PropType } from "vue";
import type { SupabaseInstance, BucketState } from "backend";
import type { FrontendSDK } from "../../index";

type Row = { name: string; state: BucketState | undefined };

export default defineComponent({
  name: "StorageGridContainer",
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
    const expanded = ref(new Set<string>());

    const hasCreds = computed(
      () => !!props.instance && (!!props.instance.anonKey || (props.instance.sessions?.length ?? 0) > 0)
    );

    const rows = computed<Row[]>(() => {
      const inst = props.instance;
      if (!inst) return [];
      const states = inst.bucketStates ?? {};
      const names = [...new Set([...inst.buckets, ...Object.keys(states)])];
      return names.map((name) => ({ name, state: states[name] }));
    });

    function toggle(name: string) {
      const next = new Set(expanded.value);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      expanded.value = next;
    }

    function formatSize(size: number | undefined): string {
      if (size === undefined) return "—";
      if (size < 1024) return `${size} B`;
      if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }

    async function enumerate() {
      const inst = props.instance;
      const sdk = props.sdk;
      if (!inst || !sdk) return;
      busy.value = true;
      try {
        await sdk.backend.runStorageEnum(inst.projectRef, wordlist.value);
      } finally {
        busy.value = false;
      }
    }

    function bearerFor(inst: SupabaseInstance): string {
      const active = (inst.sessions ?? []).find((s) => s.id === inst.activeSessionId);
      return active?.token ?? inst.anonKey ?? "";
    }

    function buildRaw(method: string, path: string, host: string, anon: string, bearer: string, body?: string): string {
      const lines = [
        `${method} ${path} HTTP/1.1`,
        `Host: ${host}`,
        `apikey: ${anon}`,
        `Authorization: Bearer ${bearer}`,
      ];
      if (body !== undefined) {
        const len = new TextEncoder().encode(body).length;
        lines.push(`Content-Type: application/json`);
        lines.push(`Content-Length: ${len}`);
      }
      return lines.join("\r\n") + "\r\n\r\n" + (body ?? "");
    }

    async function openReplay(raw: string, host: string, label: string) {
      const sdk = props.sdk;
      if (!sdk) return;
      const session = await sdk.replay.createSession({
        type: "Raw",
        raw,
        connectionInfo: { host, port: 443, isTLS: true },
      });
      sdk.replay.openTab(session.id);
      sdk.window.showToast(`Opened ${label} in Replay`, { variant: "success" });
    }

    async function replayList(bucket: string) {
      const inst = props.instance;
      if (!inst || !props.sdk) return;
      const host = `${inst.projectRef}.supabase.co`;
      const body = JSON.stringify({ prefix: "", limit: 100 }, null, 2);
      const raw = buildRaw("POST", `/storage/v1/object/list/${bucket}`, host, inst.anonKey ?? "", bearerFor(inst), body);
      await openReplay(raw, host, `list ${bucket}`);
    }

    async function replayGet(bucket: string, path: string) {
      const inst = props.instance;
      if (!inst || !props.sdk) return;
      const host = `${inst.projectRef}.supabase.co`;
      const raw = buildRaw("GET", `/storage/v1/object/${bucket}/${path}`, host, inst.anonKey ?? "", bearerFor(inst));
      await openReplay(raw, host, `${bucket}/${path}`);
    }

    // Encode each path segment but keep the folder separators.
    function encodePath(path: string): string {
      return path.split("/").map(encodeURIComponent).join("/");
    }

    function apiKeyFor(inst: SupabaseInstance): string {
      const sessions = inst.sessions ?? [];
      const active = sessions.find((s) => s.id === inst.activeSessionId);
      return inst.anonKey ?? active?.token ?? sessions[0]?.token ?? "";
    }

    function publicUrl(bucket: string, path: string): string {
      const inst = props.instance;
      if (!inst) return "";
      return `${inst.projectUrl}/storage/v1/object/public/${bucket}/${encodePath(path)}`;
    }

    async function copyUrl(bucket: string, path: string) {
      const sdk = props.sdk;
      if (!sdk) return;
      try {
        await navigator.clipboard.writeText(publicUrl(bucket, path));
        sdk.window.showToast("Public URL copied", { variant: "success" });
      } catch {
        sdk.window.showToast("Copy failed", { variant: "error" });
      }
    }

    async function download(bucket: string, path: string) {
      const inst = props.instance;
      const sdk = props.sdk;
      if (!inst || !sdk) return;
      // Authenticated object endpoint works for both public and readable-private
      // objects; sends the same creds the enumeration used.
      const url = `${inst.projectUrl}/storage/v1/object/${bucket}/${encodePath(path)}`;
      const bearer = bearerFor(inst);
      try {
        const resp = await fetch(url, {
          headers: { apikey: apiKeyFor(inst), Authorization: `Bearer ${bearer}` },
        });
        if (!resp.ok) {
          sdk.window.showToast(`Download failed (${resp.status})`, { variant: "error" });
          return;
        }
        const blob = await resp.blob();
        const objUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = objUrl;
        a.download = path.split("/").pop() ?? "download";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(objUrl);
        sdk.window.showToast("Download started", { variant: "success" });
      } catch (err) {
        sdk.window.showToast(`Download error: ${String(err)}`, { variant: "error" });
      }
    }

    return {
      busy,
      wordlist,
      expanded,
      rows,
      toggle,
      formatSize,
      enumerate,
      replayList,
      replayGet,
      copyUrl,
      download,
      hasCreds,
    };
  },
});
</script>
