import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TileSelector from '@/components/shared/TileSelector.vue'

describe('TileSelector', () => {
  describe('rendering', () => {
    it('renders a button for each option', () => {
      const wrapper = mount(TileSelector, {
        props: { options: ['A', 'B', 'C'], modelValue: 'A' },
      })

      const buttons = wrapper.findAll('button')
      expect(buttons).toHaveLength(3)
      expect(buttons[0]!.text()).toBe('A')
      expect(buttons[1]!.text()).toBe('B')
      expect(buttons[2]!.text()).toBe('C')
    })

    it('renders numeric options', () => {
      const wrapper = mount(TileSelector, {
        props: { options: [1, 2, 3], modelValue: 1 },
      })

      const buttons = wrapper.findAll('button')
      expect(buttons).toHaveLength(3)
      expect(buttons[0]!.text()).toBe('1')
    })
  })

  describe('single select (modelValue is a primitive)', () => {
    it('marks the active option with tile-active class', () => {
      const wrapper = mount(TileSelector, {
        props: { options: ['A', 'B', 'C'], modelValue: 'B' },
      })

      const buttons = wrapper.findAll('button')
      expect(buttons[0]!.classes()).toContain('tile')
      expect(buttons[1]!.classes()).toContain('tile-active')
      expect(buttons[2]!.classes()).toContain('tile')
    })

    it('emits update:modelValue with the clicked option', async () => {
      const wrapper = mount(TileSelector, {
        props: { options: ['A', 'B', 'C'], modelValue: 'A' },
      })

      await wrapper.findAll('button')[2]!.trigger('click')

      expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
      expect(wrapper.emitted('update:modelValue')![0]).toEqual(['C'])
    })
  })

  describe('multi select (modelValue is an array)', () => {
    it('marks multiple active options', () => {
      const wrapper = mount(TileSelector, {
        props: { options: ['A', 'B', 'C'], modelValue: ['A', 'C'] },
      })

      const buttons = wrapper.findAll('button')
      expect(buttons[0]!.classes()).toContain('tile-active')
      expect(buttons[1]!.classes()).toContain('tile')
      expect(buttons[2]!.classes()).toContain('tile-active')
    })

    it('emits the clicked option value', async () => {
      const wrapper = mount(TileSelector, {
        props: { options: ['A', 'B', 'C'], modelValue: ['A'] },
      })

      await wrapper.findAll('button')[1]!.trigger('click')

      expect(wrapper.emitted('update:modelValue')![0]).toEqual(['B'])
    })
  })

  describe('testIdPrefix', () => {
    it('sets data-test-id on buttons when testIdPrefix is provided', () => {
      const wrapper = mount(TileSelector, {
        props: { options: ['X', 'Y'], modelValue: 'X', testIdPrefix: 'club-' },
      })

      const buttons = wrapper.findAll('button')
      expect(buttons[0]!.attributes('data-test-id')).toBe('club-X')
      expect(buttons[1]!.attributes('data-test-id')).toBe('club-Y')
    })

    it('does not set data-test-id when testIdPrefix is not provided', () => {
      const wrapper = mount(TileSelector, {
        props: { options: ['X'], modelValue: 'X' },
      })

      expect(wrapper.find('button').attributes('data-test-id')).toBeUndefined()
    })
  })
})
