<template>
    <header class="docs-header">
        <nav class="breadcrumb" aria-label="breadcrumbs">
            <ul>
                <template v-for="(item, index) in breadcrumb">
                    <li
                        v-if="routes[item]"
                        :key="item"
                        :class="{ 'is-active': index === breadcrumb.length - 1 }"
                    >
                        <router-link :to="routes[item].path">
                            {{ routes[item].breadTitle || routes[item].title }}
                        </router-link>
                    </li>
                </template>
            </ul>
        </nav>

        <div class="columns">
            <div class="column">
                <!-- eslint-disable-next-line vue/no-v-html -->
                <h1 class="title" v-html="title" />
                <!-- eslint-disable-next-line vue/no-v-html -->
                <h2 class="subtitle" v-html="subtitle" />
            </div>
        </div>
    </header>
</template>

<script>
import routes from '@/data/routes'

export default {
    props: {
        breadcrumb: Array,
        title: String,
        subtitle: String
    },
    data() {
        return {
            routes
        }
    }
}
</script>
