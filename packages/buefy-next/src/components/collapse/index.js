import Collapse from './Collapse.vue'

import { use, registerComponent } from '../../utils/plugins'

const Plugin = {
    install(Vue) {
        registerComponent(Vue, Collapse)
    }
}

export default Plugin

export {
    Collapse as BCollapse
}
