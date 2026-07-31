import { Edge, EVENT_TAP, VisuallyJsModel, Node } from "@visuallyjs/browser-ui"
import { VueWrapperProps, VueSurfaceViewOptions } from "@visuallyjs/browser-ui-vue"
import { isCondition } from "./model-operations"
import { h } from 'vue'

import WorkflowNode from "./components/WorkflowNode.vue"
import TriggerNode from "./components/TriggerNode.vue"
import DecisionNode from "./components/DecisionNode.vue"
import AgentNode from "./components/AgentNode.vue"
import PlaceholderNode from "./components/PlaceholderNode.vue"

const EdgeOverlay = {
    props: ['obj', 'model'],
    setup(props: VueWrapperProps<Edge>) {
        return () => {
            const label = props.obj.source.data.label
            const isDecision = isCondition(props.obj.source)
            if (isDecision && label) {
                return h('div', { class: 'condition-label' }, [
                    h('span', { onClick: () => props.model.setSelection(props.obj.source) }, label)
                ])
            }
            return null
        }
    }
}

export default function getViewOptions(): VueSurfaceViewOptions {
    return {
        nodes: {
            trigger: {
                component: TriggerNode
            },
            decision: {
                component: DecisionNode,
                parent: "default"
            },
            agent: {
                component: AgentNode,
                parent: "default"
            },
            placeholder: {
                component: PlaceholderNode
            },
            default: {
                component: WorkflowNode,
                events: {
                    [EVENT_TAP]: (p: any) => {
                        p.model.setSelection(p.obj)
                    }
                }
            }
        },
        edges: {
            default: {
                overlays: [{
                    component: EdgeOverlay,
                    options: {
                        location: 0.5
                    }
                }]
            },
            placeholder: {
                cssClass: "vjs-ai-placeholder-edge"
            }
        }
    }
}
