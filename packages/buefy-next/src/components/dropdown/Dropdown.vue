<template>
    <div
        class="dropdown dropdown-menu-animation"
        ref="dropdown"
        :class="rootClasses"
        @mouseleave="isHoverable = false"
    >
        <div
            v-if="!inline"
            :tabindex="disabled ? undefined : triggerTabindex"
            ref="trigger"
            class="dropdown-trigger"
            @click="onClick"
            @contextmenu.prevent="onContextMenu"
            @mouseenter="onHover"
            @focus.capture="onFocus"
            @touchstart="onTouchStart"
            @touchmove="onTouchMove"
            @touchend="onTouchEnd"
            aria-haspopup="true"
        >
            <slot name="trigger" :active="isActive" />
        </div>

        <transition :name="animation">
            <div
                v-if="isMobileModal"
                v-show="isActive"
                class="background"
                :aria-hidden="!isActive"
            />
        </transition>
        <transition :name="animation">
            <div
                v-show="(!disabled && (isActive || isHoverable)) || inline"
                ref="dropdownMenu"
                class="dropdown-menu"
                :style="style"
                :aria-hidden="!isActive"
                v-trap-focus="trapFocus"
            >
                <div
                    class="dropdown-content"
                    :role="ariaRole"
                    :aria-modal="!inline"
                    :style="contentStyle"
                >
                    <slot />
                </div>
            </div>
        </transition>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'

import trapFocus from '../../directives/trapFocus'
import config from '../../utils/config'
import { removeElement, createAbsoluteElement, isCustomElement, toCssWidth } from '../../utils/helpers'

const DEFAULT_CLOSE_OPTIONS = ['escape', 'outside']

export const DROPDOWN_TRIGGERS = ['click', 'contextmenu', 'focus', 'hover'] as const

export type DropdownTrigger = typeof DROPDOWN_TRIGGERS[number]

export const DROPDOWN_INJECTION_KEY = Symbol('bdropdown')

// TODO: `ItemValueType` is ideally a type parameter of `BDropdown`,
// but I do not know how to do it with the Options API.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ItemValueType = any

export default defineComponent({
    name: 'BDropdown',
    directives: {
        trapFocus
    },
    provide() {
        return {
            [DROPDOWN_INJECTION_KEY]: this
        }
    },
    props: {
        modelValue: {
            type: [
                String, Number, Boolean, Object, Array, Function
            ] as PropType<ItemValueType | ItemValueType[]>,
            default: null
        },
        disabled: Boolean,
        inline: Boolean,
        scrollable: Boolean,
        maxHeight: {
            type: [String, Number],
            default: 200
        },
        position: {
            type: String,
            validator(value) {
                return [
                    'is-top-right',
                    'is-top-left',
                    'is-bottom-left',
                    'is-bottom-right'
                ].indexOf(value as string) > -1
            }
        },
        triggers: {
            type: Array<DropdownTrigger>,
            default: () => ['click']
        },
        mobileModal: {
            type: Boolean,
            default: () => {
                return config.defaultDropdownMobileModal
            }
        },
        ariaRole: {
            type: String,
            validator(value) {
                return [
                    'menu',
                    'list',
                    'dialog'
                ].indexOf(value as string) > -1
            },
            default: null
        },
        animation: {
            type: String,
            default: 'fade'
        },
        multiple: Boolean,
        trapFocus: {
            type: Boolean,
            default: () => {
                return config.defaultTrapFocus
            }
        },
        closeOnClick: {
            type: Boolean,
            default: true
        },
        canClose: {
            type: [Array, Boolean],
            default: true
        },
        expanded: Boolean,
        appendToBody: Boolean,
        appendToBodyCopyParent: Boolean,
        triggerTabindex: {
            type: Number,
            default: 0
        }
    },
    emits: {
        /* eslint-disable @typescript-eslint/no-unused-vars */
        'active-change': (_isActive: boolean) => true,
        change: (_selected: ItemValueType | ItemValueType[]) => true,
        'update:modelValue': (_value: ItemValueType | ItemValueType[]) => true
        /* eslint-enable @typescript-eslint/no-unused-vars */
    },
    data() {
        return {
            selected: this.modelValue,
            style: {},
            isActive: false,
            isHoverable: false,
            maybeTap: false,
            isTouchEnabled: false,
            _bodyEl: undefined as Element | undefined, // Used to append to body
            timeOutID: undefined as ReturnType<typeof setTimeout> | undefined,
            timeOutID2: undefined as ReturnType<typeof setTimeout> | undefined
        }
    },
    computed: {
        rootClasses() {
            return [this.position, {
                'is-disabled': this.disabled,
                'is-hoverable': this.hoverable,
                'is-inline': this.inline,
                'is-active': this.isActive || this.inline,
                'is-mobile-modal': this.isMobileModal,
                'is-expanded': this.expanded,
                'is-touch-enabled': this.isTouchEnabled
            } as Record<string, boolean | undefined>]
        },
        isMobileModal() {
            return this.mobileModal && !this.inline
        },
        cancelOptions() {
            return typeof this.canClose === 'boolean'
                ? this.canClose
                    ? DEFAULT_CLOSE_OPTIONS
                    : []
                : this.canClose
        },
        contentStyle() {
            return {
                maxHeight: this.scrollable ? toCssWidth(this.maxHeight) ?? undefined : undefined,
                overflow: this.scrollable ? 'auto' : undefined
            }
        },
        hoverable() {
            return this.triggers.indexOf('hover') >= 0
        }
    },
    watch: {
        /*
        * When v-model is changed set the new selected item.
        */
        modelValue(value) {
            this.selected = value
        },

        /*
        * Emit event when isActive value is changed.
        *
        * Also resets `isTouchEnabled` when it turns inactive.
        */
        isActive(value) {
            this.$emit('active-change', value)
            if (!value) {
                // delays to reset the touch enabled flag until the dropdown
                // menu disappears to avoid glitches
                // also takes care of chattering, e.g., repeated quick taps,
                // otherwise the flag may become inconsistent with the actual
                // state of the dropdown menu
                this.timeOutID = setTimeout(() => {
                    if (!this.isActive) {
                        this.isTouchEnabled = false
                    }
                }, 250)
            }
            this.handleScroll()
            if (this.appendToBody) {
                this.$nextTick(() => {
                    this.updateAppendToBody()
                })
            }
        },

        isHoverable(value) {
            if (this.hoverable) {
                this.$emit('active-change', value)
            }
        }
    },
    methods: {
        handleScroll() {
            if (typeof window === 'undefined') return

            if (this.isMobileModal) {
                if (this.isActive) {
                    document.documentElement.classList.add('is-clipped-touch')
                } else {
                    document.documentElement.classList.remove('is-clipped-touch')
                }
            }
        },

        /*
         * Click listener from DropdownItem.
         *   1. Set new selected item.
         *   2. Emit input event to update the user v-model.
         *   3. Close the dropdown.
         */
        selectItem(value: ItemValueType) {
            if (this.multiple) {
                if (this.selected) {
                    const selected = this.selected as ItemValueType[]
                    if (selected.indexOf(value) === -1) {
                        // Add value
                        this.selected = [...selected, value]
                    } else {
                        // Remove value
                        this.selected = selected.filter((val) => val !== value)
                    }
                } else {
                    this.selected = [value]
                }
                this.$emit('change', this.selected)
            } else {
                if (this.selected !== value) {
                    this.selected = value
                    this.$emit('change', this.selected)
                }
            }
            this.$emit('update:modelValue', this.selected)
            if (!this.multiple) {
                this.isActive = !this.closeOnClick
                if (this.hoverable && this.closeOnClick) {
                    this.isHoverable = false
                }
            }
        },

        /*
        * White-listed items to not close when clicked.
        */
        isInWhiteList(el: EventTarget | null) {
            if (el === this.$refs.dropdownMenu) return true
            if (el === this.$refs.trigger) return true
            // All chidren from dropdown
            if (this.$refs.dropdownMenu != null) {
                const children = (this.$refs.dropdownMenu as Element).querySelectorAll('*')
                for (const child of children) {
                    if (el === child) {
                        return true
                    }
                }
            }
            // All children from trigger
            if (this.$refs.trigger != null) {
                const children = (this.$refs.trigger as Element).querySelectorAll('*')
                for (const child of children) {
                    if (el === child) {
                        return true
                    }
                }
            }
            return false
        },

        /*
        * Close dropdown if clicked outside.
        */
        clickedOutside(event: Event) {
            if (this.cancelOptions.indexOf('outside') < 0) return
            if (this.inline) return

            const target = isCustomElement(this) ? event.composedPath()[0] : event.target
            if (!this.isInWhiteList(target)) this.isActive = false
        },

        /*
         * Keypress event that is bound to the document
         */
        keyPress({ key }: { key?: KeyboardEvent['key'] }) {
            if (this.isActive && (key === 'Escape' || key === 'Esc')) {
                if (this.cancelOptions.indexOf('escape') < 0) return
                this.isActive = false
            }
        },

        onClick() {
            // hover precedes
            if (this.triggers.indexOf('hover') !== -1) return
            if (this.triggers.indexOf('click') < 0) return
            this.toggle()
        },
        onContextMenu() {
            if (this.triggers.indexOf('contextmenu') < 0) return
            this.toggle()
        },
        onHover() {
            if (this.triggers.indexOf('hover') < 0) return
            // touch precedes
            if (this.isTouchEnabled) return
            this.isHoverable = true
        },
        // takes care of touch-enabled devices
        // - does nothing if hover trigger is disabled
        // - suppresses hover trigger by setting isTouchEnabled
        // - handles only a tap; i.e., touchstart on the trigger immediately
        //   folowed by touchend
        onTouchStart() {
            this.maybeTap = true
        },
        onTouchMove() {
            this.maybeTap = false
        },
        onTouchEnd(e: TouchEvent) {
            if (this.triggers.indexOf('hover') === -1) return
            if (!this.maybeTap) return
            // tap on dropdown contents may happen without preventDefault
            e.preventDefault()
            this.maybeTap = false
            this.isTouchEnabled = true
            this.toggle()
        },
        onFocus() {
            if (this.triggers.indexOf('focus') < 0) return
            this.toggle()
        },

        /*
        * Toggle dropdown if it's not disabled.
        */
        toggle() {
            if (this.disabled) return

            if (!this.isActive) {
                // if not active, toggle after clickOutside event
                // this fixes toggling programmatic
                // $nextTick may not wait for other events since Vue 3.
                this.timeOutID2 = setTimeout(() => {
                    const value = !this.isActive
                    this.isActive = value
                })
            } else {
                this.isActive = !this.isActive
            }
        },

        updateAppendToBody() {
            const dropdown = this.$refs.dropdown as HTMLElement
            const dropdownMenu = this.$refs.dropdownMenu as Element
            const trigger = this.$refs.trigger as Element
            if (dropdownMenu && trigger) {
                // update wrapper dropdown
                const dropdownWrapper = this.$data._bodyEl!.children[0]
                dropdownWrapper.classList.forEach((item) => dropdownWrapper.classList.remove(item))
                dropdownWrapper.classList.add('dropdown')
                dropdownWrapper.classList.add('dropdown-menu-animation')
                // TODO: The following test never becomes true on Vue 3.
                //       It was intended to solve the following issue:
                //         https://github.com/buefy/buefy/issues/1872
                //       Since TypeScript won't tolerate it, I comment it out
                //       until we learn more about the issue.
                /*
                if (this.$vnode && this.$vnode.data && this.$vnode.data.staticClass) {
                    dropdownWrapper.classList.add(this.$vnode.data.staticClass)
                } */
                this.rootClasses.forEach((item) => {
                    // skip position prop
                    if (item && typeof item === 'object') {
                        for (const key in item) {
                            if (item[key]) {
                                dropdownWrapper.classList.add(key)
                            }
                        }
                    }
                })
                if (this.appendToBodyCopyParent) {
                    const parentNode = (this.$refs.dropdown as Element).parentNode!
                    const parent = this.$data._bodyEl!
                    parent.classList.forEach((item) => parent.classList.remove(item));
                    (parentNode as Element).classList.forEach((item) => {
                        parent.classList.add(item)
                    })
                }
                const rect = trigger.getBoundingClientRect()
                let top = rect.top + window.scrollY
                let left = rect.left + window.scrollX
                if (!this.position || this.position.indexOf('bottom') >= 0) {
                    top += trigger.clientHeight
                } else {
                    top -= dropdownMenu.clientHeight
                }
                if (this.position && this.position.indexOf('left') >= 0) {
                    left -= (dropdownMenu.clientWidth - trigger.clientWidth)
                }
                this.style = {
                    position: 'absolute',
                    top: `${top}px`,
                    left: `${left}px`,
                    zIndex: '99',
                    width: this.expanded ? `${dropdown.offsetWidth}px` : undefined
                }
            }
        }
    },
    mounted() {
        if (this.appendToBody) {
            this.$data._bodyEl = createAbsoluteElement(this.$refs.dropdownMenu as Element)
            this.updateAppendToBody()
        }
    },
    created() {
        if (typeof window !== 'undefined') {
            document.addEventListener('click', this.clickedOutside)
            document.addEventListener('keyup', this.keyPress)
        }
    },
    beforeUnmount() {
        if (typeof window !== 'undefined') {
            document.removeEventListener('click', this.clickedOutside)
            document.removeEventListener('keyup', this.keyPress)
        }
        if (this.appendToBody) {
            removeElement(this.$data._bodyEl!)
        }
        clearTimeout(this.timeOutID)
        clearTimeout(this.timeOutID2)
    }
})
</script>
