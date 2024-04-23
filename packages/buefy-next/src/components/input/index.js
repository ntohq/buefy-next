import Input from './Input.vue'

import { use, registerComponent } from '../../utils/plugins'

const Plugin = {
    install(Vue) {
        registerComponent(Vue, Input)
    }
}

export default Plugin

export {
    Input as BInput
}
