<script lang="ts">
import { defineComponent } from 'vue'
import TabbedChildMixin from '../../utils/TabbedChildMixin'

export default defineComponent({
    name: 'BTabItem',
    mixins: [TabbedChildMixin('tab')],
    props: {
        disabled: Boolean
    },
    data() {
        return {
            elementClass: 'tab-item',
            elementRole: 'tabpanel'
        }
    }
})
</script>
