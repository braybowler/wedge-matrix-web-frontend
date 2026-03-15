export type PracticeShotCount = 5 | 10 | 15

export type PracticeMode = 'gauntlet' | 'drill'

export type PracticeShot = {
  shot_number: number
  target_yards: number
  actual_carry: number | null
  difference: number | null
  club_label?: string
  swing_label?: string
}

export type PracticeSession = {
  matrixId: number
  shotCount: PracticeShotCount
  shots: PracticeShot[]
  currentShotIndex: number
  completed: boolean
}

export type DrillCombo = {
  clubIndex: number
  columnIndex: number
  clubLabel: string
  swingLabel: string
  targetYards: number | null
}

export type DrillStep = {
  combo: DrillCombo
  shots: (number | null)[]
}

export type DrillSession = {
  matrixId: number
  steps: DrillStep[]
  currentStepIndex: number
  completed: boolean
}

export type PracticeSessionRecord = {
  id: number
  user_id: number
  wedge_matrix_id: number | null
  mode: PracticeMode
  shot_count: number
  shots: PracticeShot[]
  average_difference: number
  created_at: string
}
