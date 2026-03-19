export function differenceClass(diff: number | null): string {
  if (diff === null) return ''
  if (diff <= 3) return 'diff-good'
  if (diff <= 8) return 'diff-ok'
  return 'diff-poor'
}
