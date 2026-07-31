.<script setup lang="ts">
import { ref, onMounted, inject } from 'vue';
import { isNode, VisuallyJsModel, Vertex, Node, isPort, getDownstreamVertices } from "@visuallyjs/browser-ui";
import { InspectorComponent, VisuallyJsService, VisuallyJsServiceKey } from "@visuallyjs/browser-ui-vue";
import { Action, ActionList, ActionConfigurationProperty, DecisionCondition } from "../definitions";
import { addCondition, deleteCondition } from "../model-operations";

const currentObj = ref<Node|null>(null)
const service:VisuallyJsService = inject(VisuallyJsServiceKey)!
const providers = ref<ActionList[]>([]);
const popupContext = inject<any>('popupContext');

onMounted(async () => {
  try {
    const response = await fetch('/actions.json');
    providers.value = await response.json();
  } catch (error) {
    console.error('Error loading actions:', error);
  }
});

function getAction(obj: Node): Action | null {
  if (!obj || !isNode(obj) || !obj.data) return null;
  const { type, provider: providerId } = obj.data;
  if (!type || !providerId) return null;
  const provider = providers.value.find(p => p.provider.toLowerCase() === providerId.toLowerCase());
  if (!provider) return null;
  return provider.actions.find(a => a.id === type) || null;
}

function doDeleteCondition(decision: any, conditionId: string, model: VisuallyJsModel) {
  const port = decision.getPort(conditionId);
  const ds = getDownstreamVertices(port, false);
  if (ds.length > 0) {
    popupContext.confirm({
      title: "Delete Condition?",
      message: "This condition has downstream vertices which will also be deleted. Are you sure?",
      onConfirm: () => deleteCondition(decision, conditionId, model)
    });
  } else {
    deleteCondition(decision, conditionId, model);
  }
}
</script>

<template>
  <InspectorComponent v-model="currentObj">
    <template v-if="currentObj ==null">

    </template>
    <template v-if="currentObj != null">
      <div class="modal-overlay" @click="service.model.value.clearSelection()">
        <div class="modal-content inspector-modal" @click.stop>
          <div class="vjs-ai-inspector">
            
            <div class="vjs-inspector-header">
              <div class="vjs-inspector-title">
                <template v-if="isPort(currentObj)">
                  <h3>Prompt</h3>
                </template>
                <template v-else-if="currentObj.type === 'decision'">
                  <h3>Decision</h3>
                </template>
                <template v-else-if="currentObj.type === 'agent'">
                  <h3>Agent</h3>
                </template>
                <template v-else>
                  <template v-if="getAction(currentObj)">
                    <h3>{{ getAction(currentObj).name }}</h3>
                    <p>{{ getAction(currentObj).desc }}</p>
                  </template>
                  <h3 v-else>Action not found!</h3>
                </template>
              </div>
              <button class="close-button" @click="service.model.value.clearSelection()">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div class="vjs-inspector-properties">
              <template v-if="isPort(currentObj)">
                <div class="vjs-inspector-field">
                  <label>Name</label>
                  <input type="text" vjs-att="label" placeholder="Label" vjs-focus />
                </div>
              </template>
              
              <template v-else>
                <div class="vjs-inspector-field">
                  <label>Name</label>
                  <input type="text" vjs-att="name" placeholder="Name" />
                </div>
                
                <template v-if="currentObj.type === 'agent'">
                  <div class="vjs-inspector-field">
                    <label>Prompt</label>
                    <textarea vjs-att="prompt" placeholder="Prompt" rows="5" />
                  </div>
                </template>
                <template v-else>
                  <div class="vjs-inspector-field">
                    <label>Summary</label>
                    <textarea vjs-att="summary" placeholder="Summary" rows="3" />
                  </div>
                </template>

                <div class="vjs-inspector-divider" style="margin: 15px 0; border-top: 1px solid #eee"></div>

                <template v-if="currentObj.type === 'decision' || currentObj.type === 'agent'">
                  <div class="vjs-inspector-field-row" style="justify-content: space-between; align-items: center; display: flex">
                    <h4>Conditions</h4>
                    <button class="vjs-ai-button" @click="addCondition(currentObj, service.model.value)" title="Add Condition">
                      Add Condition
                    </button>
                  </div>
                  <div v-for="condition in (currentObj.data.conditions || [])" :key="condition.id" class="vjs-inspector-field vjs-inspector-field-row">
                    <input type="text" placeholder="Label" vjs-att="label" :vjs-port="condition.id" />
                    <button class="vjs-ai-delete-button" data-vjs-no-events="true" @click="doDeleteCondition(currentObj, condition.id, service.model.value)">
                      <img src="/icons/trash.svg" alt="Delete" style="width: 100%; height: 100%" />
                    </button>
                  </div>
                </template>

                <template v-else>
                  <template v-if="getAction(currentObj) && getAction(currentObj).properties">
                    <div v-for="prop in getAction(currentObj).properties" :key="prop.id" class="vjs-inspector-field">
                      <label>{{ prop.name }}</label>
                      <textarea v-if="prop.datatype === 'string'" :vjs-att="prop.id" :placeholder="prop.desc" rows="3"></textarea>
                      <input v-else-if="prop.datatype === 'number'" type="number" :vjs-att="prop.id" :placeholder="prop.desc" />
                      <select v-else-if="prop.datatype === 'boolean'" :vjs-att="prop.id">
                        <option value=""></option>
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                      <textarea v-else-if="prop.datatype === 'array'" :vjs-att="prop.id" :placeholder="`${prop.desc} (comma separated)`" rows="2"></textarea>
                      <input v-else type="text" :vjs-att="prop.id" :placeholder="prop.desc" />
                      <div class="vjs-field-desc">{{ prop.desc }}</div>
                    </div>
                  </template>
                </template>
              </template>
            </div>

            <div class="vjs-inspector-footer">
              <button class="vjs-ai-button" @click="service.model.value.clearSelection()">Done</button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </InspectorComponent>
</template>
