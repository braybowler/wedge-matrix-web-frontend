export type PracticeShotCount = 5 | 10 | 15

export type PracticeShot = {
  shot_number: number
  target_yards: number
  actual_carry: number | null
  difference: number | null
}

export type PracticeSession = {
  matrixId: number
  shotCount: PracticeShotCount
  shots: PracticeShot[]
  currentShotIndex: number
  completed: boolean
}

export type PracticeSessionRecord = {
  id: number
  user_id: number
  wedge_matrix_id: number | null
  shot_count: number
  shots: PracticeShot[]
  average_difference: number
  created_at: string
}
