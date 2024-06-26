import { shallowMount } from '@vue/test-utils'
import BMessage from '@components/message/Message'

let wrapper

describe('BMessage', () => {
    beforeEach(() => {
        wrapper = shallowMount(BMessage)
    })

    it('is called', () => {
        expect(wrapper.vm).toBeTruthy()
        expect(wrapper.vm.$options.name).toBe('BMessage')
    })

    it('render correctly', () => {
        expect(wrapper.html()).toMatchSnapshot()
    })

    it('custom header contains html element', () => {
        wrapper = shallowMount(BMessage, {
            slots: {
                header: 'Custom header with <a>link</a>'
            }
        })
        expect(wrapper.find('a').exists()).toBeTruthy()
    })
})
