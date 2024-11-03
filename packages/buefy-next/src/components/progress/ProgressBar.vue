<template>
    <div
        class="progress-bar"
        :class="newType"
        role="progressbar"
        :aria-valuenow="value"
        :aria-valuemax="parentMax"
        aria-valuemin="0"
        :style="{width: barWidth}"
    >
        <p
            v-if="newShowValue"
            class="progress-value"
        >
            <slot>{{ newValue }}</slot>
        </p>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { ExtractComponentProps } from '../../utils/helpers'
import Progress, { PROGRESS_INJECTION_KEY } from './Progress.vue'

type ProgressInstance = InstanceType<typeof Progress>

const ProgressBar = defineComponent({
    name: 'BProgressBar',
    inject: {
        parent: {
            from: PROGRESS_INJECTION_KEY,
            default: undefined
        }
    },
    props: {
        type: {
            type: [String],
            default: undefined
        },
        value: {
            type: Number,
            default: undefined
        },
        showValue: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        parentMax() {
            return (this.parent as ProgressInstance).max
        },
        newType() {
            return [
                (this.parent as ProgressInstance).size,
                this.type || (this.parent as ProgressInstance).type
            ]
        },
        newShowValue() {
            return this.showValue || (this.parent as ProgressInstance).showValue
        },
        newValue() {
            return (this.parent as ProgressInstance).calculateValue(this.value)
        },
        barWidth() {
            return `${(this.value === undefined ? 0 : this.value) * 100 / (this.parent as ProgressInstance).max}%`
        }
    }
})

export type ProgressBarProps = ExtractComponentProps<typeof ProgressBar>

export default ProgressBar
</script>
