<script setup lang="ts">
import { inject } from 'vue';
import { Vertex, BrowserUIModel } from "@visuallyjs/browser-ui";
import DeleteNode from "./DeleteNode.vue";
import { setTrigger } from "../model-operations";

const {vertex, model} = defineProps<{
    vertex: Vertex;
    model: BrowserUIModel;
}>();

const popupContext = inject<any>('popupContext');
const isTrigger = vertex.type === 'trigger';

const handleSelectAction = (item: any) => {
    if (isTrigger) {
        setTrigger(vertex as any, model, item);
    } else {
      model.updateNode(vertex, {
        provider: item.provider,
        name: item.name,
        summary: item.desc,
        type:item.id
      });

    }
};

const handleOpenBrowser = () => {
    popupContext.openActionBrowser({
        action: isTrigger ? 'set-trigger' : 'change-action',
        excludedActions: [{ id: isTrigger ? vertex.data.trigger : vertex.type }]
    }, handleSelectAction);
};
</script>

<template>
    <div class="vjs-ai-node-options" tabindex="0" data-vjs-no-events="true">
        <button class="vjs-ai-node-options-button">
            <img src="/icons/more-horizontal.svg" width="16" height="16" alt="Options" />
        </button>
        <div class="vjs-ai-node-options-menu">
            <DeleteNode :vertex="vertex" :model="model" label="Delete Node" />
            <button class="vjs-ai-node-options-menu-item" @click="handleOpenBrowser">
                Change {{ isTrigger ? 'trigger' : 'action' }}
            </button>
        </div>
    </div>
</template>
