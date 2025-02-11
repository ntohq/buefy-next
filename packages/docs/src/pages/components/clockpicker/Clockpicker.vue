<template>
    <div>
        <Example :component="ExSimple" :code="ExSimpleCode" vertical/>

        <Example :component="ExNonReadonly" :code="ExNonReadonlyCode" title="Non read-only" vertical>
            <p>Use <code>editable</code> to let the user type a time.</p>
        </Example>

        <Example :component="ExRange" :code="ExRangeCode" title="Range" vertical>
            <p>You can limit the time range with <code>min-time</code> and <code>max-time</code> props.</p>
        </Example>

        <Example :component="ExFooter" :code="ExFooterCode" title="Footer" vertical>
            <p>Any slots are added to the footer of the clockpicker.</p>
        </Example>

        <Example :component="ExColors" :code="ExColorsCode" title="Colors" vertical>
            <p>
                Clockpicker supports all <code>is-&lt;color&gt;</code> classes from Bulma, including custom colors added at build time.
                This can be specified in the <code>class</code> property or in the <code>type</code> property.
                Inline display is also availble by specifying the <code>inline</code> prop.
            </p>
        </Example>

        <ApiView :data="api"/>
    </div>
</template>

<script lang="ts">
    import { defineComponent } from 'vue'

    import { shallowFields } from '@/utils'
    import ApiView from '@/components/ApiView.vue'
    import Example from '@/components/Example.vue'

    import api from './api/clockpicker'

    import ExSimple from './examples/ExSimple.vue'
    import ExSimpleCode from './examples/ExSimple.vue?raw'

    import ExNonReadonly from './examples/ExNonReadonly.vue'
    import ExNonReadonlyCode from './examples/ExNonReadonly.vue?raw'

    import ExRange from './examples/ExRange.vue'
    import ExRangeCode from './examples/ExRange.vue?raw'

    import ExFooter from './examples/ExFooter.vue'
    import ExFooterCode from './examples/ExFooter.vue?raw'

    import ExColors from './examples/ExColors.vue'
    import ExColorsCode from './examples/ExColors.vue?raw'

    export default defineComponent({
        components: {
            ApiView,
            Example
        },
        data() {
            return {
                api,
                ...shallowFields({
                    ExSimple,
                    ExNonReadonly,
                    ExRange,
                    ExFooter,
                    ExColors
                }),
                ExSimpleCode,
                ExNonReadonlyCode,
                ExRangeCode,
                ExFooterCode,
                ExColorsCode
            }
        }
    })
</script>
