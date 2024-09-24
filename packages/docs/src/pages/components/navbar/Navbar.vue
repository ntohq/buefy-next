<template>
    <div>
        <Example :component="ExSimple" :code="ExSimpleCode"/>

        <ApiView :data="api"/>
        <VariablesView :data="variables"/>
    </div>
</template>


<script lang="ts">
    import { defineComponent } from 'vue'

    import api from './api/navbar'
    import variables from './variables/navbar'
    import { shallowFields } from '@/utils'

    import ExSimple from './examples/ExSimple.vue'
    import ExSimpleCode from './examples/ExSimple.vue?raw'

    export default defineComponent({
        data() {
            return {
                api,
                variables,
                ...shallowFields({
                    ExSimple
                }),
                ExSimpleCode
            }
        },
    })
</script>
