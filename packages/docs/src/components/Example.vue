<template>
    <section class="example-section">
        <p :id="`${slugifiedTitle}`" class="title is-4">
            <router-link v-if="title" :to="`#${slugifiedTitle}`">
                #
            </router-link>
            {{ title }}
        </p>
        <div class="content">
            <slot />
        </div>

        <div
            v-if="code && component"
            class="example"
            :class="{ 'is-vertical': vertical }"
        >
            <div class="button-container">
                <CodepenEdit :code="code" :title="title" />
            </div>
            <div class="example-component" :class="{ 'is-paddingless': paddingless }">
                <component :is="component" />
            </div>
            <CodeView
                :code="code"
                bordered
                codepen
            />
        </div>
        <hr class="is-medium">
    </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import CodepenEdit from './CodepenEdit.vue'
import CodeView from './CodeView.vue'

export default defineComponent({
    // eslint-disable-next-line vue/multi-word-component-names
    name: 'Example',
    components: {
        CodeView,
        CodepenEdit
    },
    props: {
        component: [Object, Function],
        code: String,
        title: String,
        paddingless: Boolean,
        vertical: Boolean
    },
    computed: {
        slugifiedTitle() {
            if (!this.title) return ''
            return this.title.toLowerCase()
                .replace(/\s+/g, '-') // Replace spaces with -
                .replace(/[^\w-]+/g, '') // Remove all non-word chars
                .replace(/--+/g, '-') // Replace multiple - with single -
                .replace(/^-+/, '') // Trim - from start of text
                .replace(/-+$/, '') // Trim - from end of text
        }
    }
})
</script>
