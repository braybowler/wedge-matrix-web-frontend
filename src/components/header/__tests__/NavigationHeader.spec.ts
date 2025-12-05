import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import WedgeMatrix, { type WedgeMatrixProps } from '@/components/matrix/WedgeMatrix.vue'

const defaultMountProps: WedgeMatrixProps = {
  numColumns: 1,
  columnHeaders: [
    {
      swingPercentage: 100,
      id: 1,
    },
  ],
  clubs: [
    {
      label: 'LW',
      id: 1,
    },
    {
      label: 'SW',
      id: 2,
    },
    {
      label: 'GW',
      id: 3,
    },
    {
      label: 'PW',
      id: 4,
    },
  ],
}

describe('WedgeMatrix Component', () => {
  describe('Matrix Rendering', () => {
    it('renders', () => {
      const wrapper = mount(WedgeMatrix, {
        props: defaultMountProps,
      })

      expect(wrapper.exists()).toBeTruthy()
    })

    it.each([
      {
        numColumns: 3,
        columnHeaders: [
          {
            swingPercentage: 25,
            id: 1,
          },
          {
            swingPercentage: 50,
            id: 2,
          },
          {
            swingPercentage: 75,
            id: 3,
          },
        ],
        clubs: [
          {
            label: 'LW',
            id: 1,
          },
        ],
        clubLabelsNotPresent: ['SW', 'GW', 'PW'],
      },
      {
        numColumns: 3,
        columnHeaders: [
          {
            swingPercentage: 25,
            id: 1,
          },
          {
            swingPercentage: 50,
            id: 2,
          },
          {
            swingPercentage: 75,
            id: 3,
          },
        ],
        clubs: [
          {
            label: 'LW',
            id: 1,
          },
          {
            label: 'SW',
            id: 2,
          },
        ],
        clubLabelsNotPresent: ['GW', 'PW'],
      },
      {
        numColumns: 3,
        columnHeaders: [
          {
            swingPercentage: 25,
            id: 1,
          },
          {
            swingPercentage: 50,
            id: 2,
          },
          {
            swingPercentage: 75,
            id: 3,
          },
        ],
        clubs: [
          {
            label: 'LW',
            id: 1,
          },
          {
            label: 'SW',
            id: 2,
          },
          {
            label: 'GW',
            id: 3,
          },
        ],
        clubLabelsNotPresent: ['PW'],
      },
      {
        numColumns: 3,
        columnHeaders: [
          {
            swingPercentage: 25,
            id: 1,
          },
          {
            swingPercentage: 50,
            id: 2,
          },
          {
            swingPercentage: 75,
            id: 3,
          },
        ],
        clubs: [
          {
            label: 'LW',
            id: 1,
          },
          {
            label: 'SW',
            id: 2,
          },
          {
            label: 'GW',
            id: 3,
          },
          {
            label: 'PW',
            id: 4,
          },
        ],
        clubLabelsNotPresent: [],
      },
    ])(
      'displays correct clubs (matrix rows) passed via props: $clubs',
      ({ numColumns, columnHeaders, clubs, clubLabelsNotPresent }) => {
        const wrapper = mount(WedgeMatrix, {
          props: {
            numColumns,
            columnHeaders,
            clubs,
          } as WedgeMatrixProps,
        })

        clubs.forEach((club) => {
          expect(wrapper.text()).toContain(club.label)
          clubLabelsNotPresent.forEach((clubLabelNotPresent) => {
            expect(wrapper.text()).not.toContain(clubLabelNotPresent)
          })
        })
      },
    )

    it.each([
      {
        numColumns: 1,
        columnHeaders: [
          {
            swingPercentage: 25,
            id: 1,
          },
        ],
        clubs: [
          {
            label: 'LW',
            id: 1,
          },
          {
            label: 'SW',
            id: 2,
          },
          {
            label: 'GW',
            id: 3,
          },
          {
            label: 'PW',
            id: 4,
          },
        ],
      },
      {
        numColumns: 2,
        columnHeaders: [
          {
            swingPercentage: 25,
            id: 1,
          },
          {
            swingPercentage: 50,
            id: 2,
          },
        ],
        clubs: [
          {
            label: 'LW',
            id: 1,
          },
          {
            label: 'SW',
            id: 2,
          },
          {
            label: 'GW',
            id: 3,
          },
          {
            label: 'PW',
            id: 4,
          },
        ],
      },
      {
        numColumns: 3,
        columnHeaders: [
          {
            swingPercentage: 25,
            id: 1,
          },
          {
            swingPercentage: 50,
            id: 2,
          },
          {
            swingPercentage: 75,
            id: 3,
          },
        ],
        clubs: [
          {
            label: 'LW',
            id: 1,
          },
          {
            label: 'SW',
            id: 2,
          },
          {
            label: 'GW',
            id: 3,
          },
          {
            label: 'PW',
            id: 4,
          },
        ],
      },
      {
        numColumns: 4,
        columnHeaders: [
          {
            swingPercentage: 25,
            id: 1,
          },
          {
            swingPercentage: 50,
            id: 2,
          },
          {
            swingPercentage: 75,
            id: 3,
          },
          {
            swingPercentage: 100,
            id: 4,
          },
        ],
        clubs: [
          {
            label: 'LW',
            id: 1,
          },
          {
            label: 'SW',
            id: 2,
          },
          {
            label: 'GW',
            id: 3,
          },
          {
            label: 'PW',
            id: 4,
          },
        ],
      },
    ])(
      'displays correct column headers (matrix columns) passed via props: $columnHeaders',
      ({ numColumns, columnHeaders, clubs }) => {
        const wrapper = mount(WedgeMatrix, {
          props: {
            numColumns,
            columnHeaders,
            clubs,
          } as WedgeMatrixProps,
        })

        const columnsHeaders = wrapper.findAll('[data-test-id="swing-percentage-container"]')

        expect(columnsHeaders.length).toEqual(numColumns)
        columnHeaders.forEach((columnHeader) => {
          expect(wrapper.text()).toContain(columnHeader.swingPercentage)
        })
      },
    )

    it.todo('displays correct row display options, if passed via props')
  })

  describe('User Input', () => {
    it.todo('accepts user yardage input')
    it.todo('validates user yardage input')
    it.todo('clears the matrix values on clear matrix button press')
  })
})
