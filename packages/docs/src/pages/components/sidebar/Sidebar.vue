<template>
    <div>
        <Example :component="ExSimple" :code="ExSimpleCode"/>

        <Example :component="ExStatic" :code="ExStaticCode" title="Static"/>

        <ApiView :data="api"/>
        <VariablesView :data="variables"/>
    </div>
</template>


<script lang="ts">
    import { defineComponent } from 'vue'

    import api from './api/sidebar'
    import variables from './variables/sidebar'
    import { shallowFields } from '@/utils'

    import ExSimple from './examples/ExSimple.vue'
    import ExSimpleCode from './examples/ExSimple.vue?raw'
    import ExStatic from './examples/ExStatic.vue'
    import ExStaticCode from './examples/ExStatic.vue?raw'

    export default defineComponent({
        data() {
            return {
                api,
                variables,
                ...shallowFields({
                    ExSimple,
                    ExStatic
                }),
                ExSimpleCode,
                ExStaticCode
            }
        },
    })
</script>
