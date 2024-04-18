import type { App } from 'vue'
import Switch from './Switch.vue'
import { use, registerComponent } from '../../utils/plugins'

const Plugin = {
    install(Vue: App) {
        registerComponent(Vue, Switch)
    }
}

use(Plugin)

export default Plugin

export {
    Switch as BSwitch
}
