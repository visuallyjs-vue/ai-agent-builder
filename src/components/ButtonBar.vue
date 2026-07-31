<script setup lang="ts">
import { useSurface } from "@visuallyjs/browser-ui-vue";
import { ref } from "vue";

const surfaceRef = useSurface();
const fileInputRef = ref<HTMLInputElement | null>(null);

const zoomToFit = () => {
    surfaceRef.value?.zoomToFit();
};

const undo = () => {
    surfaceRef.value?.model.undo();
};

const redo = () => {
    surfaceRef.value?.model.redo();
};

const save = () => {
    if (!surfaceRef.value) return;
    const data = surfaceRef.value.model.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "workflow.json";
    a.click();
    URL.revokeObjectURL(url);
};

const load = () => {
    fileInputRef.value?.click();
};

const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file && surfaceRef.value) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            try {
                const data = JSON.parse(content);
                surfaceRef.value?.model.clear();
                surfaceRef.value?.model.load({ data });
            } catch (err) {
                console.error("Failed to parse file", err);
            }
        };
        reader.readAsText(file);
    }
    // reset input
    target.value = "";
};

const newWorkflow = () => {
    if (!surfaceRef.value) return;
    surfaceRef.value?.model.clear();
    surfaceRef.value?.model.addNode({
      type: "trigger",
      name: "New Trigger",
      summary: "Configure this trigger"
    });
    surfaceRef.value.zoomToFit();
};
</script>

<template>
  <div v-if="surfaceRef" class="vjs-button-bar">
    <button @click="zoomToFit" title="Zoom To Fit">
      <img src="/icons/zoom-to-fit.svg" width="16" height="16" alt="Zoom To Fit" />
      <span>Zoom To Fit</span>
    </button>
    <div class="vjs-button-bar-separator" />
    <button @click="undo" title="Undo">
      <img src="/icons/undo.svg" width="16" height="16" alt="Undo" />
      <span>Undo</span>
    </button>
    <button @click="redo" title="Redo">
      <img src="/icons/redo.svg" width="16" height="16" alt="Redo" />
      <span>Redo</span>
    </button>
    <div class="vjs-button-bar-separator" />
    <button @click="save" title="Save">
      <img src="/icons/save.svg" width="16" height="16" alt="Save" />
      <span>Save</span>
    </button>
    <button @click="load" title="Load">
      <img src="/icons/load.svg" width="16" height="16" alt="Load" />
      <span>Load</span>
    </button>
    <button @click="newWorkflow" title="New">
      <img src="/icons/plus.svg" width="16" height="16" alt="New" />
      <span>New</span>
    </button>
    <input type="file" ref="fileInputRef" style="display: none" @change="handleFileChange" accept=".json" />
  </div>
</template>
