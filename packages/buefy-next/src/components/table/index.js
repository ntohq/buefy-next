import Table from './Table.vue'
import TableColumn from './TableColumn.vue'

import { registerComponent } from '../../utils/plugins'
import { VueInstance, setVueInstance } from '../../utils/config'

const Plugin = {
    install(Vue) {
        // individual import + extend method into Table.vue
        if (typeof VueInstance === 'undefined') {
            setVueInstance(Vue)
        }
        registerComponent(Vue, Table)
        registerComponent(Vue, TableColumn)
    }
}

export default Plugin

export {
    Table as BTable,
    TableColumn as BTableColumn
}
