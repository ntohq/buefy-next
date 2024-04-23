import Switch from './Switch.vue'

import { use, registerComponent } from '../../utils/plugins'

const Plugin = {
    install(Vue) {
        registerComponent(Vue, Switch)
    }
}

export default Plugin

export {
    Switch as BSwitch
}
