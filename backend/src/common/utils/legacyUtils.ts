/**
 * Legacy HRMS utility functions.
 *
 * These standalone functions predate the OOP handler classes.
 * They are kept for backward compatibility with existing services that
 * import them directly.  New code should use CommonHandler instead:
 *
 *   this.common.maskAadhaar(value)
 *   this.common.isValidPAN(value)
 *   etc.
 */

export function generateEmployeeCode(prefix: string, seq: number): string {
  return `${prefix}${String(seq).padStart(6, '0')}`;
}

export function maskAadhaar(aadhaar: string): string {
  if (aadhaar.length !== 12) return '********';
  return `****${aadhaar.slice(-4)}`;
}

export function maskPAN(pan: string): string {
  if (pan.length !== 10) return '********';
  return `${pan.slice(0, 4)}****${pan.slice(-1)}`;
}

export function maskAccountNumber(account: string): string {
  if (account.length <= 4) return '****';
  return `****${account.slice(-4)}`;
}

export function calculateAge(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

export function isValidPAN(pan: string): boolean {
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
}

export function isValidAadhaar(aadhaar: string): boolean {
  return /^\d{12}$/.test(aadhaar);
}

export function isValidIFSC(ifsc: string): boolean {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);
}

export function isValidGSTIN(gstin: string): boolean {
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin);
}

export function isValidMobile(mobile: string): boolean {
  return /^[6-9]\d{9}$/.test(mobile);
}

export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number
) {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
