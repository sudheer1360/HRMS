import { describe, it, expect } from 'vitest';
import {
  createLeaveTypeSchema,
  createLeavePolicySchema,
  applyLeaveSchema,
  leaveApprovalSchema,
  leaveFilterSchema,
} from '../../src/modules/leave/leave.schema.js';

// ═══════════════════════════════════════════════════════════════════════════════
describe('Leave Schemas', () => {

  // ── createLeaveTypeSchema ──────────────────────────────────────────────────
  describe('createLeaveTypeSchema', () => {
    const valid = {
      companyId: 'company-1',
      leaveName: 'Annual Leave',
      leaveCode: 'AL',
      isPaid: true,
      requiresApproval: true,
      minDurationDays: 0.5,
      allowEncashment: false,
    };

    it('parses a valid payload', () => {
      const result = createLeaveTypeSchema.parse(valid);
      expect(result.leaveCode).toBe('AL');
      expect(result.isPaid).toBe(true);
    });

    it('applies default minDurationDays of 0.5', () => {
      const { minDurationDays, ...rest } = valid;
      const result = createLeaveTypeSchema.parse(rest);
      expect(result.minDurationDays).toBe(0.5);
    });

    it('coerces isPaid from string "true"', () => {
      const result = createLeaveTypeSchema.parse({ ...valid, isPaid: 'true' });
      expect(result.isPaid).toBe(true);
    });

    it('coerces allowEncashment from string "false"', () => {
      const result = createLeaveTypeSchema.parse({ ...valid, allowEncashment: 'false' });
      expect(result.allowEncashment).toBe(false);
    });

    it('fails when companyId is missing', () => {
      const { companyId, ...rest } = valid;
      expect(() => createLeaveTypeSchema.parse(rest)).toThrow();
    });

    it('fails when leaveName is too short (< 2 chars)', () => {
      expect(() => createLeaveTypeSchema.parse({ ...valid, leaveName: 'A' })).toThrow();
    });

    it('fails when leaveCode is too short (< 2 chars)', () => {
      expect(() => createLeaveTypeSchema.parse({ ...valid, leaveCode: 'A' })).toThrow();
    });

    it('fails when leaveCode exceeds 20 characters', () => {
      expect(() => createLeaveTypeSchema.parse({ ...valid, leaveCode: 'A'.repeat(21) })).toThrow();
    });

    it('fails when minDurationDays is less than 0.5', () => {
      expect(() => createLeaveTypeSchema.parse({ ...valid, minDurationDays: 0.1 })).toThrow();
    });
  });

  // ── createLeavePolicySchema ────────────────────────────────────────────────
  describe('createLeavePolicySchema', () => {
    const valid = {
      companyId: 'company-1',
      leaveTypeId: 'lt-1',
      annualQuota: 20,
      accrualFrequency: 'Monthly' as const,
      sandwichRule: false,
      minServiceDays: 0,
    };

    it('parses a valid payload', () => {
      const result = createLeavePolicySchema.parse(valid);
      expect(result.annualQuota).toBe(20);
      expect(result.accrualFrequency).toBe('Monthly');
    });

    it('defaults accrualFrequency to Monthly', () => {
      const { accrualFrequency, ...rest } = valid;
      const result = createLeavePolicySchema.parse(rest);
      expect(result.accrualFrequency).toBe('Monthly');
    });

    it('defaults sandwichRule to false', () => {
      const { sandwichRule, ...rest } = valid;
      const result = createLeavePolicySchema.parse(rest);
      expect(result.sandwichRule).toBe(false);
    });

    it('accepts Quarterly and Yearly accrual frequencies', () => {
      expect(createLeavePolicySchema.parse({ ...valid, accrualFrequency: 'Quarterly' }).accrualFrequency).toBe('Quarterly');
      expect(createLeavePolicySchema.parse({ ...valid, accrualFrequency: 'Yearly' }).accrualFrequency).toBe('Yearly');
    });

    it('fails on invalid accrualFrequency', () => {
      expect(() => createLeavePolicySchema.parse({ ...valid, accrualFrequency: 'Daily' })).toThrow();
    });

    it('fails when annualQuota is not positive', () => {
      expect(() => createLeavePolicySchema.parse({ ...valid, annualQuota: 0 })).toThrow();
      expect(() => createLeavePolicySchema.parse({ ...valid, annualQuota: -5 })).toThrow();
    });

    it('fails when companyId is empty', () => {
      expect(() => createLeavePolicySchema.parse({ ...valid, companyId: '' })).toThrow();
    });
  });

  // ── applyLeaveSchema ───────────────────────────────────────────────────────
  describe('applyLeaveSchema', () => {
    const valid = {
      leaveTypeId: 'lt-1',
      fromDate: '2026-07-01',
      toDate: '2026-07-03',
      reason: 'Family vacation',
    };

    it('parses valid leave application input', () => {
      const result = applyLeaveSchema.parse(valid);
      expect(result.fromDate).toBe('2026-07-01');
      expect(result.toDate).toBe('2026-07-03');
    });

    it('accepts leave with same from and to date (single day)', () => {
      const result = applyLeaveSchema.parse({ ...valid, fromDate: '2026-07-01', toDate: '2026-07-01' });
      expect(result.fromDate).toBe(result.toDate);
    });

    it('makes reason optional', () => {
      const { reason, ...rest } = valid;
      const result = applyLeaveSchema.parse(rest);
      expect(result.reason).toBeUndefined();
    });

    it('makes contactDuringLeave optional', () => {
      const result = applyLeaveSchema.parse({ ...valid, contactDuringLeave: '+91-9999999999' });
      expect(result.contactDuringLeave).toBe('+91-9999999999');
    });

    it('fails when toDate is before fromDate', () => {
      expect(() =>
        applyLeaveSchema.parse({ ...valid, fromDate: '2026-07-05', toDate: '2026-07-01' })
      ).toThrow();
    });

    it('fails when leaveTypeId is missing', () => {
      const { leaveTypeId, ...rest } = valid;
      expect(() => applyLeaveSchema.parse(rest)).toThrow();
    });

    it('fails when fromDate is empty', () => {
      expect(() => applyLeaveSchema.parse({ ...valid, fromDate: '' })).toThrow();
    });

    it('fails when toDate is empty', () => {
      expect(() => applyLeaveSchema.parse({ ...valid, toDate: '' })).toThrow();
    });
  });

  // ── leaveApprovalSchema ────────────────────────────────────────────────────
  describe('leaveApprovalSchema', () => {
    it('parses Approved status', () => {
      const result = leaveApprovalSchema.parse({ status: 'Approved' });
      expect(result.status).toBe('Approved');
    });

    it('parses Rejected status with rejectedReason', () => {
      const result = leaveApprovalSchema.parse({ status: 'Rejected', rejectedReason: 'Insufficient cover' });
      expect(result.rejectedReason).toBe('Insufficient cover');
    });

    it('makes rejectedReason optional', () => {
      const result = leaveApprovalSchema.parse({ status: 'Rejected' });
      expect(result.rejectedReason).toBeUndefined();
    });

    it('fails on invalid status values', () => {
      expect(() => leaveApprovalSchema.parse({ status: 'Pending' })).toThrow();
      expect(() => leaveApprovalSchema.parse({ status: 'Cancelled' })).toThrow();
      expect(() => leaveApprovalSchema.parse({ status: '' })).toThrow();
    });
  });

  // ── leaveFilterSchema ──────────────────────────────────────────────────────
  describe('leaveFilterSchema', () => {
    it('applies default page=1 and limit=20', () => {
      const result = leaveFilterSchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('coerces page and limit from strings', () => {
      const result = leaveFilterSchema.parse({ page: '2', limit: '50' });
      expect(result.page).toBe(2);
      expect(result.limit).toBe(50);
    });

    it('clamps limit to maximum of 100', () => {
      expect(() => leaveFilterSchema.parse({ limit: '101' })).toThrow();
    });

    it('fails when page is less than 1', () => {
      expect(() => leaveFilterSchema.parse({ page: '0' })).toThrow();
    });

    it('passes optional filter fields through', () => {
      const result = leaveFilterSchema.parse({
        status: 'Pending',
        employeeId: 'emp-1',
        fromDate: '2026-07-01',
        toDate: '2026-07-31',
      });
      expect(result.status).toBe('Pending');
      expect(result.employeeId).toBe('emp-1');
    });
  });
});
