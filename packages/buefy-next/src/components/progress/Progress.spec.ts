import { shallowMount } from '@vue/test-utils'
import BProgress from '@components/progress/Progress.vue'
import { describe, expect, it } from 'vitest'

describe('BProgress', () => {
    it('is called', () => {
        const wrapper = shallowMount(BProgress)
        expect(wrapper.vm).toBeTruthy()
        expect(wrapper.vm.$options.name).toBe('BProgress')
    })

    it('render correctly', () => {
        const wrapper = shallowMount(BProgress)

        expect(wrapper.html()).toMatchSnapshot()
    })

    it('add value attribute when a value is passed', async () => {
        const value = 50
        const wrapper = shallowMount(BProgress)
        await wrapper.setProps({ value })

        expect(wrapper.find('.progress').attributes().value).toEqual(`${value}`)
    })

    describe('Passing a value prop', () => {
        it('remove value attribute to the <progress> element', async () => {
            const wrapper = shallowMount(BProgress, {
                props: { value: undefined }
            })

            await wrapper.vm.$nextTick()
            expect(wrapper.find('.progress').attributes().value).toEqual(undefined)
        })

        describe('Passing true to show-value prop', () => {
            it('adds a help <p> element in the root div.progress-wrapper when "show-value" prop is true', () => {
                const value = 50
                const wrapper = shallowMount(BProgress, {
                    props: {
                        value,
                        showValue: true
                    }
                })
                expect(wrapper.find('.progress-wrapper').find('p.progress-value').text()).toEqual(`${value}`)
            })

            it('display the value as percent when passing "percent" for the format prop', async () => {
                const value = 50
                const max = 100
                const format = 'percent'
                const wrapper = shallowMount(BProgress, {
                    props: {
                        value,
                        max,
                        format,
                        showValue: true,
                        locale: 'en-US'
                    }
                })

                await wrapper.vm.$nextTick()
                expect(wrapper.find('.progress').text()).toEqual(`${value * max / 100}%`)
            })

            it('display the trailing zeroes when setting the keepTrailingZeroes prop', () => {
                const value = 50
                const keepTrailingZeroes = true
                const wrapper = shallowMount(BProgress, {
                    props: {
                        value,
                        keepTrailingZeroes,
                        showValue: true
                    }
                })

                expect(wrapper.find('.progress').text()).toEqual(`${value}.00`)
            })
        })
    })
})
