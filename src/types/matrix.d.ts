export type AllowableMatrixColumnNumber = 1 | 2 | 3 | 4

export type ClubLabel = 'LW' | 'SW' | 'GW' | 'AW' | 'PW'

export type RowDisplayOption = 'Carry' | 'Total' | 'Both'

export type UserClub = {
  id: number
  label: ClubLabel
}

export type UserColumnHeader = {
  swingPercentage: number
  id: number
}
