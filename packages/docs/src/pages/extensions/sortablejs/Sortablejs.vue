<template>
    <div>
        <div class="buttons">
            <a
                class="button"
                href="https://sortablejs.github.io/Sortable/"
                target="_blank">
                Website
            </a>
            <a
                class="button"
                href="https://github.com/SortableJS/Sortable"
                target="_blank">
                Docs
            </a>
        </div>

        <Example :component="ExSimple" :code="ExSimpleCode" vertical>
            <b-message type="is-info">
                <p><strong>Sortable is not included in Buefy</strong>, you have to install it:</p>
                <CodeView code="npm install sortablejs" expanded/>
            </b-message>
        </Example>
    </div>
</template>

<script>
    import ExSimple from './examples/ExSimple'
    import ExSimpleCode from './examples/ExSimple.vue?raw'

    export default {
        data() {
            return {
                ExSimple,
                ExSimpleCode
            }
        }
    }
</script>
