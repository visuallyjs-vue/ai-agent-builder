<script setup lang="ts">
import { inject } from 'vue';
import { BrowserUIModel, Vertex, getDownstreamVertices } from "@visuallyjs/browser-ui";
import { deleteVertex } from "../model-operations";

const props = defineProps<{
  vertex: Vertex;
  ui:BrowserUI;
  model: BrowserUIModel;
  label?: string;
}>();

const popupContext = inject<any>('popupContext');

function handleDelete(e: MouseEvent) {
  e.stopPropagation();
  const ds = getDownstreamVertices(props.vertex, false);
  if (ds.length > 0) {
    popupContext.confirm({
      title: "Delete Node?",
      message: "This node has downstream vertices which will also be deleted. Are you sure?",
      onConfirm: () => deleteVertex(props.vertex, props.model, props.ui)
    });
  } else {
    deleteVertex(props.vertex, props.model, props.ui);
  }
}
</script>

<template>
  <button class="vjs-ai-delete-button" data-vjs-no-events="true" @click="handleDelete">
    <template v-if="label">
      <span>{{ label }}</span>
    </template>
    <template v-else>
      <img src="/icons/trash.svg" alt="Delete" style="width: 100%; height: 100%" />
    </template>
  </button>
</template>
