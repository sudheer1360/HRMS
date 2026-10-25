/**
 * email.validator.ts — Email address validation utilities.
 */

/** Basic RFC-5322 email pattern check */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/** Normalise email: lowercase + trim */
export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Block common disposable email domains */
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'tempmail.com',
  'throwaway.email', 'yopmail.com', '10minutemail.com',
]);

export function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return domain ? DISPOSABLE_DOMAINS.has(domain) : false;
}
