<script setup lang="ts">
import { inject, computed } from 'vue';
import { lookupIcon } from "../model-operations";
import NodeOptions from "./NodeOptions.vue";
import { VueWrapperProps } from "@visuallyjs/browser-ui-vue";
import LeafAction from "./LeafAction.vue";
import { Node } from "@visuallyjs/browser-ui"

const {data, vertex} = defineProps<VueWrapperProps<Node>>();

const isLeaf = computed(() => vertex.getAllSourceEdges().length === 0);
</script>

<template>
  <div class="vjs-ai-node">
    <div class="vjs-ai-node-header">
      <img class="vjs-ai-node-icon" :src="lookupIcon(data)" :alt="data.provider || ''" />
      <div class="vjs-ai-node-name" :title="data.name">{{ data.name }}</div>
      <NodeOptions :vertex="vertex" :model="model" />
    </div>
    <div class="vjs-ai-node-body">
      <div class="vjs-ai-node-summary">{{ data.summary }}</div>
    </div>
    <LeafAction v-if="isLeaf" />
  </div>
</template>
