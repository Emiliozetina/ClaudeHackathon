/** Today's date as "YYYY-MM-DD" in UTC, to compare with task dates by string. */
export function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

/** The "YYYY-MM-DD" part of a date or ISO timestamp. */
export function dayOf(value: string): string {
  return value.slice(0, 10);
}
