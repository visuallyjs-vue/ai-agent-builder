<script setup lang="ts">
defineProps<{
    isOpen: boolean;
    title: string;
    message: string;
}>();

const emit = defineEmits<{
    (e: 'confirm'): void;
    (e: 'cancel'): void;
}>();
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click="emit('cancel')">
    <div class="modal-content confirm-modal" @click.stop style="max-width: 400px">
      <div class="action-browser-header">
        <h3>{{ title }}</h3>
        <button class="close-button" @click="emit('cancel')">
          <img src="/icons/close.svg" width="20" height="20" alt="Close" />
        </button>
      </div>
      <div class="action-browser-content" style="padding: 24px">
        <p style="margin: 0; font-size: 15px; color: #4b5563; line-height: 1.5">
          {{ message }}
        </p>
      </div>
      <div class="vjs-inspector-footer" style="gap: 12px">
        <button class="vjs-ai-button vjs-ai-cancel-button" @click="emit('cancel')">
          Cancel
        </button>
        <button class="vjs-ai-button vjs-ai-danger-button" @click="emit('confirm')">
          Delete
        </button>
      </div>
    </div>
  </div>
</template>
