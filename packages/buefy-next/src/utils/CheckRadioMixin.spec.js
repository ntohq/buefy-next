import { shallowMount } from '@vue/test-utils'
import CheckRadioMixin from '@utils/CheckRadioMixin'

describe('CheckRadioMixin', () => {
    HTMLElement.prototype.insertAdjacentElement = jest.fn()

    const component = {
        template: '<div class="b-component"></div>',
        mixins: [CheckRadioMixin]
    }
    let wrapper

    beforeEach(() => {
        wrapper = shallowMount(component, {
            attachTo: document.body
        })
    })

    it('set value prop', async () => {
        await wrapper.setProps({
            modelValue: 'test'
        })
        expect(wrapper.vm.newValue).toEqual('test')
    })
})
