<template>
    <div
        class="carousel"
        :class="{'is-overlay': overlay}"
        @mouseenter="checkPause"
        @mouseleave="startTimer"
    >
        <progress
            v-if="progress"
            class="progress"
            :class="progressType"
            :value="activeChild"
            :max="childItems.length - 1"
        >
            {{ childItems.length - 1 }}
        </progress>
        <div
            class="carousel-items"
            @mousedown="dragStart"
            @mouseup="dragEnd"
            @touchstart.stop="dragStart"
            @touchend.stop="dragEnd"
        >
            <slot />
            <div
                v-if="arrow"
                class="carousel-arrow"
                :class="{'is-hovered': arrowHover}"
            >
                <b-icon
                    v-show="hasPrev"
                    class="has-icons-left"
                    @click="prev"
                    :pack="iconPack"
                    :icon="iconPrev"
                    :size="iconSize"
                    both
                />
                <b-icon
                    v-show="hasNext"
                    class="has-icons-right"
                    @click="next"
                    :pack="iconPack"
                    :icon="iconNext"
                    :size="iconSize"
                    both
                />
            </div>
        </div>
        <div
            v-if="autoplay && pauseHover && pauseInfo && isPause"
            class="carousel-pause"
        >
            <span
                class="tag"
                :class="pauseInfoType"
            >
                {{ pauseText }}
            </span>
        </div>
        <template v-if="withCarouselList && !indicator">
            <slot
                :active="activeChild"
                :switch="changeActive"
                name="list"
            />
        </template>
        <div
            v-if="indicator"
            class="carousel-indicator"
            :class="indicatorClasses"
        >
            <a
                v-for="(item, index) in sortedItems"
                class="indicator-item"
                :class="{'is-active': item.isActive}"
                @mouseover="modeChange('hover', index)"
                @click="modeChange('click', index)"
                :key="item.uniqueValue"
            >
                <slot
                    :i="index"
                    name="indicators"
                >
                    <span class="indicator-style" :class="indicatorStyle" />
                </slot>
            </a>
        </div>
        <template v-if="overlay">
            <slot name="overlay" />
        </template>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'

import config from '../../utils/config'

import BIcon from '../icon/Icon.vue'
import ProviderParentMixin, { Sorted } from '../../utils/ProviderParentMixin'
import { mod, bound } from '../../utils/helpers'

import type { ICarouselItem } from './types'

export const INDICATOR_MODES = ['hover', 'click'] as const
export type IndicatorMode = typeof INDICATOR_MODES[number]

export default defineComponent({
    name: 'BCarousel',
    components: {
        BIcon
    },
    mixins: [ProviderParentMixin<typeof Sorted, ICarouselItem>('carousel', Sorted)],
    props: {
        modelValue: {
            type: Number,
            default: 0
        },
        animated: {
            type: String,
            default: 'slide'
        },
        interval: Number,
        hasDrag: {
            type: Boolean,
            default: true
        },
        autoplay: {
            type: Boolean,
            default: true
        },
        pauseHover: {
            type: Boolean,
            default: true
        },
        pauseInfo: {
            type: Boolean,
            default: true
        },
        pauseInfoType: {
            type: String,
            default: 'is-white'
        },
        pauseText: {
            type: String,
            default: 'Pause'
        },
        arrow: {
            type: Boolean,
            default: true
        },
        arrowHover: {
            type: Boolean,
            default: true
        },
        repeat: {
            type: Boolean,
            default: true
        },
        iconPack: String,
        iconSize: String,
        iconPrev: {
            type: String,
            default: () => {
                return config.defaultIconPrev
            }
        },
        iconNext: {
            type: String,
            default: () => {
                return config.defaultIconNext
            }
        },
        indicator: {
            type: Boolean,
            default: true
        },
        indicatorBackground: Boolean,
        indicatorCustom: Boolean,
        indicatorCustomSize: {
            type: String,
            default: 'is-small'
        },
        indicatorInside: {
            type: Boolean,
            default: true
        },
        indicatorMode: {
            type: String as PropType<IndicatorMode>,
            default: 'click'
        },
        indicatorPosition: {
            type: String,
            default: 'is-bottom'
        },
        indicatorStyle: {
            type: String,
            default: 'is-dots'
        },
        overlay: Boolean,
        progress: Boolean,
        progressType: {
            type: String,
            default: 'is-primary'
        },
        withCarouselList: Boolean
    },
    emits: {
        /* eslint-disable @typescript-eslint/no-unused-vars */
        change: (_index: number) => true,
        click: () => true,
        'update:modelValue': (_value: number) => true
        /* eslint-enable @typescript-eslint/no-unused-vars */
    },
    data() {
        return {
            transition: 'next',
            activeChild: this.modelValue || 0,
            isPause: false,
            dragX: false as number | false,
            timer: undefined as ReturnType<typeof setInterval> | undefined
        }
    },
    computed: {
        indicatorClasses() {
            return [
                {
                    'has-background': this.indicatorBackground,
                    'has-custom': this.indicatorCustom,
                    'is-inside': this.indicatorInside
                },
                this.indicatorCustom && this.indicatorCustomSize,
                this.indicatorInside && this.indicatorPosition
            ]
        },

        // checking arrows
        hasPrev() {
            return this.repeat || this.activeChild !== 0
        },
        hasNext() {
            return this.repeat || this.activeChild < this.childItems.length - 1
        },

        activeChildIndex() {
            const item = this.sortedItems[this.activeChild]
            return item != null ? item.index : undefined
        }
    },
    watch: {
        /*
         * When v-model is changed set the new active item.
         */
        modelValue(value) {
            this.changeActive(value)
        },
        /*
         * When carousel-items are updated, set active one.
         */
        sortedItems(items) {
            if (this.activeChild >= items.length && this.activeChild > 0) {
                this.changeActive(this.activeChild - 1)
            }
        },
        /*
         *  When autoplay is changed, start or pause timer accordingly
         */
        autoplay(status) {
            status ? this.startTimer() : this.pauseTimer()
        },
        /*
         *  Since the timer can get paused at the end, if repeat is changed we need to restart it
         */
        repeat(status) {
            if (status) { this.startTimer() }
        }
    },

    methods: {
        startTimer() {
            if (!this.autoplay || this.timer) return
            this.isPause = false
            this.timer = setInterval(() => {
                if (!this.repeat && this.activeChild >= this.childItems.length - 1) {
                    this.pauseTimer()
                } else {
                    this.next()
                }
            }, (this.interval || config.defaultCarouselInterval))
        },
        pauseTimer() {
            this.isPause = true
            if (this.timer) {
                clearInterval(this.timer)
                this.timer = undefined
            }
        },
        restartTimer() {
            this.pauseTimer()
            this.startTimer()
        },
        checkPause() {
            if (this.pauseHover && this.autoplay) {
                this.pauseTimer()
            }
        },
        /*
         * Change the active item and emit change event.
         * action only for animated slide, there true = next, false = prev
         */
        changeActive(newIndex: number, direction: number = 0) {
            if (this.activeChild === newIndex || isNaN(newIndex)) return

            direction = direction || (newIndex - this.activeChild)

            newIndex = this.repeat
                ? mod(newIndex, this.childItems.length)
                : bound(newIndex, 0, this.childItems.length - 1)

            this.transition = direction > 0 ? 'prev' : 'next'
            // Transition names are reversed from the actual direction for correct effect

            this.activeChild = newIndex
            if (newIndex !== this.modelValue) {
                this.$emit('update:modelValue', newIndex)
            }
            this.restartTimer()
            this.$emit('change', newIndex) // BC
        },
        // Indicator trigger when change active item.
        modeChange(trigger: IndicatorMode, value: number) {
            if (this.indicatorMode === trigger) {
                return this.changeActive(value)
            }
        },
        prev() {
            this.changeActive(this.activeChild - 1, -1)
        },
        next() {
            this.changeActive(this.activeChild + 1, 1)
        },
        // handle drag event
        dragStart(event: MouseEvent | TouchEvent) {
            if (!this.hasDrag ||
                !(event.target as HTMLElement).draggable) return
            const touches = (event as TouchEvent).touches
            this.dragX = touches
                ? (event as TouchEvent).changedTouches[0].pageX
                : (event as MouseEvent).pageX
            if (touches) {
                this.pauseTimer()
            } else {
                event.preventDefault()
            }
        },
        dragEnd(event: MouseEvent | TouchEvent) {
            if (this.dragX === false) return
            const touches = (event as TouchEvent).touches
            const detected = touches
                ? (event as TouchEvent).changedTouches[0].pageX
                : (event as MouseEvent).pageX
            const diffX = detected - this.dragX
            if (Math.abs(diffX) > 30) {
                if (diffX < 0) {
                    this.next()
                } else {
                    this.prev()
                }
            } else {
                (event.target as HTMLElement).click()
                this.sortedItems[this.activeChild].$emit('click')
                this.$emit('click')
            }
            if (touches) {
                this.startTimer()
            }
            this.dragX = false
        }
    },
    mounted() {
        this.startTimer()
    },
    beforeUnmount() {
        this.pauseTimer()
    }
})
</script>
