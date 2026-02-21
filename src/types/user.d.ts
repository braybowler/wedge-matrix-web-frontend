import type { WedgeMatrix } from '@/types/matrix'

export interface User {
  id: number
  email: string
  email_verified_at: string | null
  has_dismissed_tutorial: boolean
  wedge_matrices: Array<WedgeMatrix>
}
