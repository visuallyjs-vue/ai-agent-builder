<script setup lang="ts">
import { inject, computed } from 'vue';
import { lookupIcon } from "../model-operations";
import { VueWrapperProps } from "@visuallyjs/browser-ui-vue";
import LeafAction from "./LeafAction.vue";
import NodeOptions from "./NodeOptions.vue";

const props = defineProps<VueWrapperProps<any>>();

const { selectTrigger } = inject<any>('builderContext');

const isLeaf = computed(() => props.vertex.getAllSourceEdges().length === 0);
const isUnset = computed(() => !props.data.provider || !props.data.trigger);
</script>

<template>
  <div class="vjs-ai-node vjs-ai-trigger-node">
    <template v-if="!isUnset">
      <div class="vjs-ai-node-header">
        <img class="vjs-ai-node-icon" :src="lookupIcon(data)" :alt="data.provider || ''" />
        <div class="vjs-ai-node-name" :title="data.name">{{ data.name }}</div>
        <NodeOptions :vertex="vertex" :model="model" />
      </div>
      <div class="vjs-ai-node-body">
        <div class="vjs-ai-node-summary">{{ data.summary }}</div>
      </div>
    </template>
    <div v-if="isUnset" style="padding:15px; margin:0 auto; textAlign:center" @click="selectTrigger(vertex, model)">
      Select Trigger
    </div>
    <LeafAction v-if="isLeaf" />
    <img src="/icons/trigger-top.svg" class="vjs-ai-trigger-top" alt="" :style="{ backgroundColor: isUnset ? 'white' : '#f8f9fa' }" />
  </div>
</template>
