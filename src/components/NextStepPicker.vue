<script setup lang="ts">
import { inject } from 'vue';
import { BrowserUIModel, Vertex, Surface } from "@visuallyjs/browser-ui";
import { addChild, replacePlaceholder } from "../model-operations";

const props = defineProps<{
    vertex: Vertex | null,
    model: BrowserUIModel | null | undefined,
    ui: Surface | null,
    hide: () => void
}>();

const { addAction } = inject<any>('builderContext');

function addConditionNode(e: MouseEvent, type: string, name: string, payload: () => any) {
    e.stopPropagation();
    props.hide();
    const pl = Object.assign(payload() || {}, { name });
    if (props.vertex && props.model) {
        if (props.vertex.type === "placeholder") {
            replacePlaceholder(props.vertex, type, pl, props.model);
        } else {
            addChild(props.vertex, type, pl, props.model);
        }
    }
}

function doAddAction(e: MouseEvent) {
    e.stopPropagation();
    props.hide();
    if (props.vertex && props.model) {
        addAction(props.vertex, props.model);
    }
}
</script>

<template>
  <div v-if="vertex" class="vjs-next-step">
    <div @click="doAddAction">
      <img src="/icons/action.svg" width="16" height="16" alt="Action" style="margin-right: 10px" />
      Perform an action
    </div>
    <div @click="(e: MouseEvent) => addConditionNode(e, 'decision', 'Decision', () => ({}))">
      <img src="/icons/condition.svg" width="16" height="16" alt="Condition" style="margin-right: 10px" />
      Decision
    </div>
    <div @click="(e: MouseEvent) => addConditionNode(e, 'agent', 'Agent', () => ({ skills: [] }))">
      <img src="/icons/ai.svg" width="16" height="16" alt="AI" style="margin-right: 10px" />
      Enter AI agent
    </div>
  </div>
</template>
