export type AllowableMatrixColumnNumber = 1 | 2 | 3 | 4

export const CLUB_LABELS = ['LW', 'SW', 'GW', 'AW', 'UW', 'PW'] as const
export type ClubLabel = (typeof CLUB_LABELS)[number]

export type RowDisplayOption = 'Carry' | 'Total' | 'Both'

export const SWING_FEEL_SYSTEMS = ['Percentage', 'Clock'] as const
export type SwingFeelSystem = (typeof SWING_FEEL_SYSTEMS)[number]

export const PERCENTAGE_OPTIONS = ['25%', '33%', '50%', '66%', '75%', '90%', '100%'] as const
export const CLOCK_OPTIONS = ['7:00', '8:00', '9:00', '10:00', '11:00', '12:00'] as const

export const MAX_YARDAGE = 999

export type YardageCell = { carry_value: number | null; total_value: number | null }
export type YardageGrid = YardageCell[][]

export type WedgeMatrix = {
  id: number
  user_id: number
  label: string | null
  number_of_rows: number
  number_of_columns: AllowableMatrixColumnNumber
  column_headers: Array<string>
  selected_row_display_option: RowDisplayOption
  yardage_values: YardageGrid
  club_labels?: ClubLabel[]
}
