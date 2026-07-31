<script setup lang="ts">
import { inject, computed } from 'vue';
import DeleteNode from "./DeleteNode.vue";
import { lookupIcon } from "../model-operations";
import { BrowserUIModel, Node, ObjectData } from "@visuallyjs/browser-ui";
import { Action, VertexOperation } from "../definitions";

const props = defineProps<{
    vertex: Node;
    data: ObjectData;
    model: BrowserUIModel;
}>();

const popupContext = inject<any>('popupContext');
const { addSkill } = inject<any>('builderContext');
const skills = computed(() => props.data.skills || []);

const removeSkill = (skillId: string, skillName: string) => {
    popupContext.confirm({
        title: "Remove Skill?",
        message: `Are you sure you want to remove the skill "${skillName}"?`,
        onConfirm: () => {
            props.model.updateNode(props.vertex, {
                skills: skills.value.filter((s: Action) => s.id !== skillId)
            });
        }
    });
};

</script>

<template>
  <div class="vjs-ai-node">
    <div class="vjs-ai-node-header">
      <div class="vjs-ai-node-name" :title="data.name">{{ data.name || "Agent" }}</div>
      <button data-vjs-no-events="true" class="vjs-ai-button vjs-ai-agent-add-skill-button" style="padding: 4px 8px; font-size: 12px" @click="addSkill(vertex, model)">
        + Skill
      </button>
      <DeleteNode :vertex="vertex" :model="model" />
    </div>
    <div class="vjs-ai-node-body">
      <div class="agent-skills-list">
        <div v-for="skill in skills" :key="skill.id" class="agent-skill-item">
          <img :src="lookupIcon(skill)" :alt="skill.provider" class="agent-skill-icon" />
          <span class="agent-skill-name">{{ skill.name }}</span>
          <button data-vjs-no-events="true" class="agent-skill-delete" @click="removeSkill(skill.id, skill.name)" />
        </div>
      </div>
    </div>
    <div v-for="condition in data.conditions" :key="condition.id" :data-vjs-port="condition.id" :data-vjs-source="true" />
  </div>
</template>
