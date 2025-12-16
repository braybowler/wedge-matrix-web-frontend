export type AllowableMatrixColumnNumber = 1 | 2 | 3 | 4

export type ClubLabel = 'LW' | 'SW' | 'GW' | 'AW' | 'PW'

export type RowDisplayOption = 'Carry' | 'Total' | 'Both'

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
}
