<template>
    <transition
        :name="animation"
        @after-enter="afterEnter"
        @before-leave="beforeLeave"
        @after-leave="afterLeave"
    >
        <div
            v-if="!destroyed"
            v-show="isActive"
            class="modal is-active"
            :class="[{'is-full-screen': fullScreen}, customClass]"
            v-trap-focus="trapFocus"
            tabindex="-1"
            :role="ariaRole"
            :aria-label="ariaLabel"
            :aria-modal="ariaModal || undefined"
        >
            <div class="modal-background" @click="cancel('outside')" />
            <div
                class="animation-content"
                :class="[{ 'modal-content': !hasModalCard }, customContentClass]"
                :style="customStyle"
            >
                <component
                    v-if="component"
                    v-bind="props"
                    v-on="events"
                    :is="component"
                    :can-cancel="canCancel"
                    @close="close"
                />
                <template v-else-if="content">
                    <!-- eslint-disable-next-line vue/no-v-html -->
                    <div v-html="content" />
                </template>
                <slot
                    v-else
                    :can-cancel="canCancel"
                    :close="close"
                />
                <button
                    type="button"
                    v-if="showX"
                    v-show="!animating"
                    class="modal-close is-large"
                    :aria-label="closeButtonAriaLabel"
                    @click="cancel('x')"
                />
            </div>
        </div>
    </transition>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType, VNode } from 'vue'

import trapFocus from '../../directives/trapFocus'
import { removeElement } from '../../utils/helpers'
import type { ExtractComponentProps } from '../../utils/helpers'
import config from '../../utils/config'
import type { ModalCancellableOption } from '../../utils/config'

const MODAL_SCROLLS = ['clip', 'keep'] as const
type ModalScroll = typeof MODAL_SCROLLS[number]

const MODAL_ARIA_ROLES = ['dialog', 'alertdialog'] as const
type ModalAriaRole = typeof MODAL_ARIA_ROLES[number]

const Modal = defineComponent({
    name: 'BModal',
    directives: {
        trapFocus
    },
    props: {
        modelValue: Boolean,
        component: [Object, Function, String],
        content: {
            type: [String, Object, Array] as PropType<string | VNode | (string | VNode)[] >
        },
        programmatic: Boolean,
        props: Object,
        events: {
            type: Object,
            default() {
                return {}
            }
        },
        width: {
            type: [String, Number],
            default: 960
        },
        hasModalCard: Boolean,
        animation: {
            type: String,
            default: 'zoom-out'
        },
        canCancel: {
            type: [Array, Boolean] as PropType<boolean | ModalCancellableOption[]>,
            default: () => {
                return config.defaultModalCanCancel
            }
        },
        cancelCallback: {
            type: Function as PropType<(method: ModalCancellableOption) => void>,
            default: () => {}
        },
        scroll: {
            type: String as PropType<ModalScroll>,
            default: () => {
                return config.defaultModalScroll
                    ? config.defaultModalScroll
                    : 'clip'
            },
            validator: (value: unknown): value is ModalScroll => {
                return MODAL_SCROLLS.indexOf(value as ModalScroll) >= 0
            }
        },
        fullScreen: Boolean,
        trapFocus: {
            type: Boolean,
            default: () => {
                return config.defaultTrapFocus
            }
        },
        autoFocus: {
            type: Boolean,
            default: () => {
                return config.defaultAutoFocus
            }
        },
        customClass: String,
        customContentClass: [String, Array, Object],
        ariaRole: {
            type: String as PropType<ModalAriaRole>,
            validator: (value: unknown): value is ModalAriaRole => {
                return MODAL_ARIA_ROLES.indexOf(value as ModalAriaRole) >= 0
            }
        },
        ariaModal: Boolean,
        ariaLabel: {
            type: String,
            validator: (value: unknown) => {
                return Boolean(value)
            }
        },
        closeButtonAriaLabel: String,
        destroyOnHide: {
            type: Boolean,
            default: true
        },
        renderOnMounted: {
            type: Boolean,
            default: false
        }
    },
    emits: {
        'after-enter': () => true,
        'after-leave': () => true,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        cancel: (method: ModalCancellableOption) => true,
        close: () => true,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        'update:modelValue': (active: boolean) => true
    },
    data() {
        return {
            isActive: this.modelValue || false,
            savedScrollTop: null as number | null,
            newWidth: typeof this.width === 'number'
                ? this.width + 'px'
                : this.width,
            animating: !this.modelValue,
            destroyed: !(this.modelValue || this.renderOnMounted)
        }
    },
    computed: {
        cancelOptions() {
            return typeof this.canCancel === 'boolean'
                ? this.canCancel
                    ? config.defaultModalCanCancel
                    : []
                : this.canCancel
        },
        showX() {
            return this.cancelOptions.indexOf('x') >= 0
        },
        customStyle() {
            if (!this.fullScreen) {
                return { maxWidth: this.newWidth }
            }
            return null
        }
    },
    watch: {
        modelValue(value) {
            this.isActive = value
        },
        isActive(value) {
            if (value) this.destroyed = false
            this.handleScroll()
            this.$nextTick(() => {
                if (value && this.$el && this.$el.focus && this.autoFocus) {
                    this.$el.focus()
                }
            })
        }
    },
    methods: {
        handleScroll() {
            if (typeof window === 'undefined') return

            if (this.scroll === 'clip') {
                if (this.isActive) {
                    document.documentElement.classList.add('is-clipped')
                } else {
                    document.documentElement.classList.remove('is-clipped')
                }
                return
            }

            this.savedScrollTop = !this.savedScrollTop
                ? document.documentElement.scrollTop
                : this.savedScrollTop

            if (this.isActive) {
                document.body.classList.add('is-noscroll')
            } else {
                document.body.classList.remove('is-noscroll')
            }

            if (this.isActive) {
                document.body.style.top = `-${this.savedScrollTop}px`
                return
            }

            document.documentElement.scrollTop = this.savedScrollTop
            document.body.style.top = ''
            this.savedScrollTop = null
        },

        /*
        * Close the Modal if canCancel and call the cancelCallback prop (function).
        */
        cancel(method: ModalCancellableOption) {
            if (this.cancelOptions.indexOf(method) < 0) return
            this.$emit('cancel', method)
            this.cancelCallback.apply(null, [method])
            this.close()
        },

        /*
        * Call the cancelCallback prop (function).
        * Emit events, and destroy modal if it's programmatic.
        */
        close() {
            this.$emit('close')
            this.$emit('update:modelValue', false)

            // Timeout for the animation complete before destroying
            if (this.programmatic) {
                this.isActive = false
                setTimeout(() => {
                    removeElement(this.$el)
                }, 150)
            }
        },

        /*
        * Keypress event that is bound to the document.
        */
        keyPress({ key }: KeyboardEvent) {
            if (this.isActive && (key === 'Escape' || key === 'Esc')) this.cancel('escape')
        },

        /*
        * Transition after-enter hook
        */
        afterEnter() {
            this.animating = false
            this.$emit('after-enter')
        },

        /*
        * Transition before-leave hook
        */
        beforeLeave() {
            this.animating = true
        },

        /*
        * Transition after-leave hook
        */
        afterLeave() {
            if (this.destroyOnHide) {
                this.destroyed = true
            }
            this.$emit('after-leave')
        }
    },
    created() {
        if (typeof window !== 'undefined') {
            document.addEventListener('keyup', this.keyPress)
        }
    },
    mounted() {
        if (this.programmatic) {
            // Insert the Modal component in body tag
            // only if it's programmatic
            // the following line used be in `beforeMount`
            // but $el is null at `beforeMount`
            document.body.appendChild(this.$el)
            this.isActive = true
        } else if (this.isActive) this.handleScroll()
    },
    beforeUnmount() {
        if (typeof window !== 'undefined') {
            document.removeEventListener('keyup', this.keyPress)
            // reset scroll
            document.documentElement.classList.remove('is-clipped')
            const savedScrollTop = !this.savedScrollTop
                ? document.documentElement.scrollTop
                : this.savedScrollTop
            document.body.classList.remove('is-noscroll')
            document.documentElement.scrollTop = savedScrollTop
            document.body.style.top = ''
        }
    }
})

export type ModalProps = ExtractComponentProps<typeof Modal>

export default Modal
</script>
