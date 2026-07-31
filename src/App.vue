<script setup lang="ts">
import { ref, provide, onMounted, nextTick } from 'vue';
import { SurfaceComponent, SurfaceProvider, SurfacePopup, MiniviewComponent, GridBackgroundComponent } from "@visuallyjs/browser-ui-vue";
import { VisuallyJsModel, Vertex, BrowserUIModel, Surface, Node } from "@visuallyjs/browser-ui";
import getViewOptions from "./view-options";
import renderOptions from "./render-options";
import modelOptions from "./model-options";
import ActionBrowser from "./components/ActionBrowser.vue";
import ButtonBar from "./components/ButtonBar.vue";
import { addAgentSkill, addChildAction, replacePlaceholderWithAction, setTrigger } from "./model-operations";
import AIInspector from "./components/Inspector.vue";
import NextStepPicker from "./components/NextStepPicker.vue";
import ConfirmModal from "./components/ConfirmModal.vue";

const props = defineProps<{
  url?: string;
}>();

const actionBrowserContext = ref<any>(null);
const showBrowser = ref(false);
const activePopupNodeId = ref<string | null>(null);

const confirmOptions = ref({
  isOpen: false,
  title: '',
  message: '',
  onConfirm: () => {}
});

const confirm = (options: { title: string; message: string; onConfirm: () => void }) => {
  confirmOptions.value = {
    isOpen: true,
    title: options.title,
    message: options.message,
    onConfirm: () => {
      options.onConfirm();
      confirmOptions.value.isOpen = false;
    }
  };
};

const externalOnSelect = ref<((item: any) => void) | null>(null);

const openActionBrowser = (context: any, onSelect: (item: any) => void) => {
  actionBrowserContext.value = context;
  externalOnSelect.value = onSelect;
  showBrowser.value = true;
};

provide('popupContext', {
  activePopupNodeId,
  setActivePopupNodeId: (id: string | null) => { activePopupNodeId.value = id; },
  confirm,
  openActionBrowser
});

provide('builderContext', {
  addAction,
  selectTrigger,
  addSkill
});

const surfaceRef = ref<any>(null);

function addAction(obj: Vertex, model: VisuallyJsModel) {
  actionBrowserContext.value = {
    action: "add-action",
    obj,
    model
  };
  showBrowser.value = true;
}

function selectTrigger(obj: Node, model: VisuallyJsModel): void {
  actionBrowserContext.value = {
    action: "set-trigger",
    obj,
    model
  };
  showBrowser.value = true;
}

function addSkill(obj: Node, model: VisuallyJsModel): void {
  actionBrowserContext.value = {
    action: "add-skill",
    obj,
    model,
    title: "Select Skill",
    excludedActions: obj.data.skills || []
  };
  showBrowser.value = true;
}

function handleBrowserSelect(item: any, context: any) {
  showBrowser.value = false;
  if (externalOnSelect.value) {
    externalOnSelect.value(item);
    externalOnSelect.value = null;
    return;
  }
  switch (context.action) {
    case "add-action": {
      if (context.obj.type === "placeholder") {
        replacePlaceholderWithAction(item, context);
      } else {
        addChildAction(item, context);
      }
      break;
    }
    case "set-trigger": {
      setTrigger(context.obj, context.model, item);
      break;
    }
    case "add-skill": {
      addAgentSkill(context.obj, context.model, item);
      break;
    }
  }
}

</script>

<template>
  <div class="vjs-ai-agent-root" style="width: 100vw; height: 100vh; display: flex; flex-direction: column; position: relative">
    <SurfaceProvider>
      <SurfaceComponent :url="url" :view-options="getViewOptions()" :render-options="renderOptions" :model-options="modelOptions" ref="surfaceRef">
        <ButtonBar />
        <SurfacePopup selector=".vjs-next-step-picker" v-slot="{vertex, model, ui, hide}">
            <NextStepPicker :vertex="vertex" :model="model" :ui="ui" :hide="hide" />
        </SurfacePopup>
        <MiniviewComponent />
        <GridBackgroundComponent/>
      </SurfaceComponent>

      <div v-if="showBrowser" class="modal-overlay" @click="showBrowser = false">
        <div class="modal-content" @click.stop>
          <ActionBrowser :context="actionBrowserContext" @close="showBrowser = false" @select="handleBrowserSelect" />
        </div>
      </div>

      <AIInspector />
      
      <ConfirmModal 
        :is-open="confirmOptions.isOpen" 
        :title="confirmOptions.title" 
        :message="confirmOptions.message" 
        @confirm="confirmOptions.onConfirm" 
        @cancel="confirmOptions.isOpen = false" 
      />
    </SurfaceProvider>
  </div>
</template>
