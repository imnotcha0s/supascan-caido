<template>
  <div class="supascan-sidebar">
    <div class="supascan-section-title">
      <i class="fas fa-database" /> Instances
      <span style="float:right;font-style:italic;">{{ instances.length }}</span>
    </div>
    <div
      v-if="instances.length === 0"
      class="empty-state"
      style="padding:24px 12px;"
    >
      <i class="fas fa-search" />
      <span>Browse a Supabase-backed app<br>or add an instance manually</span>
    </div>
    <div
      v-for="instance in instances"
      :key="instance.projectRef"
      class="instance-item"
      :class="{ selected: selectedRef === instance.projectRef }"
      @click="$emit('select', instance.projectRef)"
    >
      <div class="instance-ref">
        {{ instance.projectRef }}
      </div>
      <div class="instance-meta">
        <span
          v-if="instance.serviceRoleLeak"
          class="leak-badge"
        >
          <i class="fas fa-exclamation-triangle" /> KEY LEAK
        </span>
        <span
          v-if="instance.anonKey"
          style="color: #4ade80;"
        >
          <i class="fas fa-key" />
        </span>
        <span>{{ tableCount(instance) }}T {{ instance.rpcs.length }}R {{ instance.buckets.length }}B</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import type { SupabaseInstance } from "backend";

export default defineComponent({
  name: "InstanceListContainer",
  props: {
    instances: {
      type: Array as PropType<SupabaseInstance[]>,
      default: () => [],
    },
    selectedRef: {
      type: String as PropType<string | null>,
      default: null,
    },
  },
  emits: ["select"],
  setup() {
    function tableCount(instance: SupabaseInstance): number {
      return Object.keys(instance.tables).length;
    }
    return { tableCount };
  },
});
</script>
