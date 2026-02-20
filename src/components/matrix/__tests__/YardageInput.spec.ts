import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import YardageInput from '@/components/matrix/YardageInput.vue'

describe('YardageInput Component', () => {
  const defaultProps = {
    value: null,
    field: 'carry_value' as const,
    placeholder: 'C',
    dataTestId: 'carry-input',
  }

  it('renders an input element', () => {
    const wrapper = mount(YardageInput, { props: defaultProps })

    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('sets the correct data-test-id attribute', () => {
    const wrapper = mount(YardageInput, { props: defaultProps })

    expect(wrapper.find('[data-test-id="carry-input"]').exists()).toBe(true)
  })

  it('displays the placeholder text', () => {
    const wrapper = mount(YardageInput, { props: defaultProps })

    expect(wrapper.find('input').attributes('placeholder')).toBe('C')
  })

  it('displays the value when provided', () => {
    const wrapper = mount(YardageInput, { props: { ...defaultProps, value: 75 } })

    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('75')
  })

  it('renders empty when value is null', () => {
    const wrapper = mount(YardageInput, { props: defaultProps })

    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('')
  })

  it('emits change with field and raw value on input change', async () => {
    const wrapper = mount(YardageInput, { props: defaultProps })
    const input = wrapper.find('input')

    await input.setValue('50')
    await input.trigger('change')

    expect(wrapper.emitted('change')).toBeTruthy()
    expect(wrapper.emitted('change')![0]).toEqual(['carry_value', '50'])
  })

  it('emits change with total_value field', async () => {
    const wrapper = mount(YardageInput, {
      props: { ...defaultProps, field: 'total_value' as const, placeholder: 'T', dataTestId: 'total-input' },
    })
    const input = wrapper.find('input')

    await input.setValue('120')
    await input.trigger('change')

    expect(wrapper.emitted('change')![0]).toEqual(['total_value', '120'])
  })

  it('has numeric input attributes', () => {
    const wrapper = mount(YardageInput, { props: defaultProps })
    const input = wrapper.find('input')

    expect(input.attributes('type')).toBe('number')
    expect(input.attributes('min')).toBe('1')
    expect(input.attributes('max')).toBe('999')
    expect(input.attributes('step')).toBe('1')
    expect(input.attributes('inputmode')).toBe('numeric')
  })
})
