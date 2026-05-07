export const SHOT_COUNTS = [5, 10, 15] as const
export type ShotCount = (typeof SHOT_COUNTS)[number]
