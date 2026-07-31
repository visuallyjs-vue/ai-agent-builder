<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { iconBase } from "../model-operations";
import Providers from "../providers";
import { Action } from "../definitions";
import { DatasetIndex } from "@visuallyjs/browser-ui";

const props = defineProps<{
  context: any;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'select', item: any, context: any): void;
}>();

const providers = ref<any[]>([]);
const searchTerm = ref('');
const isTrigger = computed(() => props.context?.action === 'set-trigger');
const dataUrl = computed(() => isTrigger.value ? '/triggers.json' : '/actions.json');
const itemsKey = computed(() => isTrigger.value ? 'triggers' : 'actions');

const index = new DatasetIndex({
  fields: ['name', 'desc', 'provider']
});

const loadData = async () => {
  try {
    const response = await fetch(dataUrl.value);
    const data = await response.json();
    
    // Ensure each provider has an icon if not present in the json
    const enrichedData = data.map((p: any) => {
      if (!p.icon) {
        const providerInfo = Providers.find(pr => pr.id === p.provider);
        return { ...p, icon: providerInfo?.icon };
      }
      p.actions?.forEach((a: any) => a.provider = p.provider);
      p.triggers?.forEach((t: any) => t.provider = p.provider);
      return p;
    });
    providers.value = enrichedData;

    index.clear();
    enrichedData.forEach((p: any) => {
      index.addAll(...p[itemsKey.value]);
    });
  } catch (error) {
    console.error('Error loading data:', error);
  }
};

onMounted(loadData);
watch(dataUrl, loadData);

const matchingIds = computed(() => {
  if (!searchTerm.value) return null;
  const hits = index.search(searchTerm.value);
  return new Set(hits.map(h => h.document.id));
});

const handleItemClick = (item: any, provider: any) => {
  emit('select', { ...item, provider: provider.provider, providerIcon: provider.icon }, props.context);
};

const title = computed(() => props.context?.title || (isTrigger.value ? 'Select a Trigger' : 'Select an Action'));

const excludedActionIds = computed(() => new Set((props.context?.excludedActions || []).map((a: Action) => a.id)));

const filteredProviders = computed(() => {
    return providers.value.map(provider => {
        const items = provider[itemsKey.value] || [];
        const filteredItems = items.filter((item: any) => !matchingIds.value || matchingIds.value.has(item.id));
        return { ...provider, filteredItems };
    }).filter(p => p.filteredItems.length > 0);
});
</script>

<template>
  <div class="action-browser">
    <div class="action-browser-header">
      <div class="action-browser-header-title">
        <h3>{{ title }}</h3>
        <input type="text" placeholder="search" v-model="searchTerm" class="action-browser-search" />
      </div>
      <button class="close-button" @click="emit('close')">
        <img src="/icons/close.svg" width="24" height="24" alt="Close" />
      </button>
    </div>
    <div class="action-browser-content">
      <div v-for="provider in filteredProviders" :key="provider.provider" class="provider-section">
        <div class="provider-header">
          <div class="provider-header-icon-container">
            <img :src="`${iconBase}/${provider.icon}`" :alt="provider.provider" class="provider-header-icon" @error="(e:any) => e.target.style.display='none'" />
          </div>
          <h2 class="provider-name">{{ provider.provider }}</h2>
        </div>
        <div class="actions-grid">
          <div v-for="item in provider.filteredItems" :key="item.id"
               class="action-card"
               :class="{ 'action-card-disabled': excludedActionIds.has(item.id) }"
               :style="excludedActionIds.has(item.id) ? { opacity: 0.5, pointerEvents: 'none', filter: 'grayscale(100%)' } : {}"
               @click="!excludedActionIds.has(item.id) && handleItemClick(item, provider)">
            <div class="action-card-left">
              <img :src="`${iconBase}/${provider.icon}`" :alt="provider.provider" class="action-card-icon" @error="(e:any) => e.target.style.display='none'" />
            </div>
            <div class="action-card-content">
              <div class="action-card-name">{{ item.name }}</div>
              <div class="action-card-desc">{{ item.desc }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
