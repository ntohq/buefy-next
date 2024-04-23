import Upload from './Upload.vue'

import { use, registerComponent } from '../../utils/plugins'

const Plugin = {
    install(Vue) {
        registerComponent(Vue, Upload)
    }
}

export default Plugin

export {
    Upload as BUpload
}
