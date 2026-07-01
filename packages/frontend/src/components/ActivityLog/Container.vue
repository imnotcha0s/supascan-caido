<template>
  <div class="activity-log-wrapper">
    <div
      class="supascan-section-title"
      style="display:flex;justify-content:space-between;align-items:center;"
    >
      <span><i class="fas fa-list-ul" /> Activity Log</span>
      <button
        class="supascan-btn supascan-btn-danger"
        style="font-size:11px;"
        @click="$emit('clear')"
      >
        <i class="fas fa-trash" /> Clear
      </button>
    </div>
    <div
      v-if="entries.length === 0"
      class="empty-state"
    >
      <i class="fas fa-inbox" />
      <span>No activity yet</span>
    </div>
    <div
      v-else
      class="activity-log"
    >
      <div
        v-for="entry in entries"
        :key="entry.id"
        class="activity-entry"
      >
        <span class="activity-ts">{{ formatTime(entry.timestamp) }}</span>
        <span class="activity-method">{{ entry.method }}</span>
        <span class="activity-url">{{ truncateUrl(entry.url) }}</span>
        <span
          v-if="entry.statusCode"
          class="activity-status"
          :style="{ color: statusColor(entry.statusCode) }"
        >
          {{ entry.statusCode }}
        </span>
        <span
          v-if="entry.note"
          class="activity-note"
        >— {{ entry.note }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import type { ActivityEntry } from "backend";

export default defineComponent({
  name: "ActivityLogContainer",
  props: {
    entries: {
      type: Array as PropType<ActivityEntry[]>,
      default: () => [],
    },
  },
  emits: ["clear"],
  setup() {
    function formatTime(iso: string): string {
      try {
        const d = new Date(iso);
        return d.toLocaleTimeString("en-US", { hour12: false });
      } catch {
        return iso.slice(11, 19);
      }
    }

    function truncateUrl(url: string): string {
      if (url.length <= 80) return url;
      return url.slice(0, 40) + "…" + url.slice(-30);
    }

    function statusColor(code: number): string {
      if (code >= 200 && code < 300) return "#4ade80";
      if (code >= 300 && code < 400) return "#facc15";
      if (code >= 400) return "#f87171";
      return "#94a3b8";
    }

    return { formatTime, truncateUrl, statusColor };
  },
});
</script>
