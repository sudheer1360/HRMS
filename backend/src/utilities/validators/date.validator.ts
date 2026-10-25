/**
 * date.validator.ts — Date and time validation utilities for HRMS domain.
 */

/** Returns true if value is a valid date string or Date object */
export function isValidDate(value: string | Date): boolean {
  const d = value instanceof Date ? value : new Date(value);
  return !isNaN(d.getTime());
}

/** Validates YYYY-MM-DD format string */
export function isISODateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && isValidDate(value);
}

/** Validates HH:MM or HH:MM:SS format */
export function isTimeString(value: string): boolean {
  return /^\d{2}:\d{2}(:\d{2})?$/.test(value);
}

/** Returns true if `from` is before `to` */
export function isDateRangeValid(from: string | Date, to: string | Date): boolean {
  return new Date(from) <= new Date(to);
}

/** Returns true if date is not in the future */
export function isNotFuture(date: string | Date): boolean {
  return new Date(date) <= new Date();
}

/** Returns true if date is not in the past */
export function isNotPast(date: string | Date): boolean {
  return new Date(date) >= new Date();
}

/** Returns true if person is at least minAge years old */
export function isMinimumAge(dob: string | Date, minAge = 18): boolean {
  const birth = new Date(dob);
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - minAge);
  return birth <= cutoff;
}

/** Returns true if person is at most maxAge years old */
export function isMaximumAge(dob: string | Date, maxAge = 65): boolean {
  const birth = new Date(dob);
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - maxAge);
  return birth >= cutoff;
}
