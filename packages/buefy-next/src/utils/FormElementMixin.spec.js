import { shallowMount } from '@vue/test-utils'
import FormElementMixin from '@utils/FormElementMixin'

describe('FormElementMixin', () => {
    HTMLElement.prototype.insertAdjacentElement = jest.fn()

    const component = {
        template: '<div class="b-component"></div>',
        mixins: [FormElementMixin]
    }
    let wrapper

    beforeEach(() => {
        wrapper = shallowMount(component, {
            attachTo: document.body
        })
    })

    it('is valid as default', () => {
        expect(wrapper.vm.isValid).toBeTruthy()
    })

    it('should set isFocused and emit focus event on onFocus', async () => {
        wrapper.vm.onFocus()
        await wrapper.vm.$nextTick()
        expect(wrapper.vm.isFocused).toBeTruthy()
        expect(wrapper.emitted().focus).toBeTruthy()
    })

    it('should reset isFocused and emit blur event on onBlur', async () => {
        wrapper.vm.checkHtml5Validity = jest.fn()
        wrapper.vm.onBlur()
        await wrapper.vm.$nextTick()
        expect(wrapper.vm.isFocused).toBeFalsy()
        expect(wrapper.emitted().blur).toBeTruthy()
        expect(wrapper.vm.checkHtml5Validity).toHaveBeenCalled()
    })
})
