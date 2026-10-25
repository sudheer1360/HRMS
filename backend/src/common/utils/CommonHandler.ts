/**
 * CommonHandler — General-purpose utility helpers for controllers and services.
 *
 * Adapts the Backend Structure's CommonHandler to HRMS's domain:
 *   - isEmpty / isNullish checks
 *   - Email / mobile / PAN / Aadhaar / IFSC / GSTIN validators
 *   - Masking helpers (PII data)
 *   - ID generation (UUID v4)
 *   - Date/time utilities
 *   - String utilities (truncate, slugify, capitalise)
 *   - Pagination query builder
 *
 * Usage:
 *   this.common.isEmpty(value)
 *   this.common.generateUniqueId()
 *   this.common.isEmail('test@example.com')
 *   this.common.maskAadhaar('123456789012')
 */
import { randomUUID } from 'crypto';

export class CommonHandler {
  // ── Emptiness checks ────────────────────────────────────────────────────

  isEmpty(value: unknown): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  }

  isNullish(value: unknown): value is null | undefined {
    return value === null || value === undefined;
  }

  // ── ID generation ───────────────────────────────────────────────────────

  generateUniqueId(): string {
    return randomUUID();
  }

  /** Generate a sortable prefix-based code, e.g. EMP000001 */
  generateCode(prefix: string, sequence: number, padLength = 6): string {
    return `${prefix}${String(sequence).padStart(padLength, '0')}`;
  }

  // ── Validators ──────────────────────────────────────────────────────────

  isEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  isValidMobile(mobile: string): boolean {
    return /^[6-9]\d{9}$/.test(mobile);
  }

  isValidPAN(pan: string): boolean {
    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
  }

  isValidAadhaar(aadhaar: string): boolean {
    return /^\d{12}$/.test(aadhaar);
  }

  isValidIFSC(ifsc: string): boolean {
    return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);
  }

  isValidGSTIN(gstin: string): boolean {
    return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin);
  }

  // ── PII masking ─────────────────────────────────────────────────────────

  maskAadhaar(aadhaar: string): string {
    if (aadhaar.length !== 12) return '****';
    return `XXXX-XXXX-${aadhaar.slice(-4)}`;
  }

  maskPAN(pan: string): string {
    if (pan.length !== 10) return '****';
    return `${pan.slice(0, 4)}XXXX${pan.slice(-1)}`;
  }

  maskAccountNumber(account: string): string {
    if (account.length <= 4) return '****';
    return `XXXX${account.slice(-4)}`;
  }

  maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!domain) return '***';
    const visible = local.slice(0, Math.min(3, local.length));
    return `${visible}***@${domain}`;
  }

  maskMobile(mobile: string): string {
    if (mobile.length < 4) return '****';
    return `XXXXXX${mobile.slice(-4)}`;
  }

  // ── String utilities ─────────────────────────────────────────────────────

  capitalise(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  titleCase(str: string): string {
    return str
      .split(' ')
      .map((word) => this.capitalise(word))
      .join(' ');
  }

  slugify(str: string): string {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  truncate(str: string, maxLength: number, suffix = '...'): string {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - suffix.length) + suffix;
  }

  // ── Date utilities ───────────────────────────────────────────────────────

  calculateAge(dob: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
  }

  /** Returns date as YYYY-MM-DD string (UTC) */
  toDateString(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /** Returns current date as YYYY-MM-DD */
  today(): string {
    return this.toDateString(new Date());
  }

  /** Difference in whole days between two dates */
  daysBetween(from: Date, to: Date): number {
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.round((to.getTime() - from.getTime()) / msPerDay);
  }

  /** Add N days to a date */
  addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  // ── Object utilities ─────────────────────────────────────────────────────

  /** Remove keys with undefined/null values from an object */
  compactObject<T extends Record<string, unknown>>(
    obj: T
  ): Partial<T> {
    return Object.fromEntries(
      Object.entries(obj).filter(([, v]) => v !== null && v !== undefined)
    ) as Partial<T>;
  }

  /** Pick specific keys from an object */
  pick<T extends Record<string, unknown>, K extends keyof T>(
    obj: T,
    keys: K[]
  ): Pick<T, K> {
    return Object.fromEntries(
      keys.filter((k) => k in obj).map((k) => [k, obj[k]])
    ) as Pick<T, K>;
  }

  /** Omit specific keys from an object */
  omit<T extends Record<string, unknown>, K extends keyof T>(
    obj: T,
    keys: K[]
  ): Omit<T, K> {
    return Object.fromEntries(
      Object.entries(obj).filter(([k]) => !keys.includes(k as K))
    ) as Omit<T, K>;
  }

  // ── Number utilities ─────────────────────────────────────────────────────

  /** Round to N decimal places */
  round(value: number, decimals = 2): number {
    return Math.round(value * 10 ** decimals) / 10 ** decimals;
  }

  /** Clamp value between min and max */
  clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
}

// Singleton — controllers and services share one instance
export const commonHandler = new CommonHandler();
