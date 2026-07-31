<script setup lang="ts">
import DeleteNode from "./DeleteNode.vue";
import { lookupIcon } from "../model-operations";
import { VueWrapperProps } from "@visuallyjs/browser-ui-vue";

defineProps<VueWrapperProps<any>>();
</script>

<template>
  <div class="decision-node vjs-ai-node">
    <div class="vjs-ai-node-header">
      <img class="vjs-ai-node-icon" :src="lookupIcon(data)" :alt="data.provider || ''" />
      <div class="vjs-ai-node-name" :title="data.name">{{ data.name }}</div>
      <DeleteNode :vertex="vertex" :model="model" />
    </div>
    <div v-for="condition in data.conditions" :key="condition.id" :data-vjs-port="condition.id" :data-vjs-source="true" />
  </div>
</template>
