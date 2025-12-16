import type { WedgeMatrix } from '@/types/matrix'

export interface User {
  id: number
  email: string
  email_verified_at: string | null
  wedge_matrix: WedgeMatrix
}
