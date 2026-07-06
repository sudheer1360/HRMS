/**
 * Leave schema tests — uses Node.js built-in test runner (no vitest/esbuild needed)
 * Run: node --import tsx/esm --test tests/unit/leave.schema.node.test.ts
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createLeaveTypeSchema,
  createLeavePolicySchema,
  applyLeaveSchema,
  leaveApprovalSchema,
  leaveFilterSchema,
} from '../../src/modules/leave/leave.schema.js';

// ── createLeaveTypeSchema ──────────────────────────────────────────────────────
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
    assert.equal(result.leaveCode, 'AL');
    assert.equal(result.isPaid, true);
  });

  it('applies default minDurationDays of 0.5', () => {
    const { minDurationDays: _, ...rest } = valid;
    const result = createLeaveTypeSchema.parse(rest);
    assert.equal(result.minDurationDays, 0.5);
  });

  it('coerces isPaid from string "true"', () => {
    const result = createLeaveTypeSchema.parse({ ...valid, isPaid: 'true' });
    assert.equal(result.isPaid, true);
  });

  it('coerces allowEncashment from string "false"', () => {
    const result = createLeaveTypeSchema.parse({ ...valid, allowEncashment: 'false' });
    assert.equal(result.allowEncashment, false);
  });

  it('fails when companyId is missing', () => {
    const { companyId: _, ...rest } = valid;
    assert.throws(() => createLeaveTypeSchema.parse(rest));
  });

  it('fails when leaveName is too short', () => {
    assert.throws(() => createLeaveTypeSchema.parse({ ...valid, leaveName: 'A' }));
  });

  it('fails when leaveCode is too short', () => {
    assert.throws(() => createLeaveTypeSchema.parse({ ...valid, leaveCode: 'A' }));
  });

  it('fails when leaveCode exceeds 20 chars', () => {
    assert.throws(() => createLeaveTypeSchema.parse({ ...valid, leaveCode: 'A'.repeat(21) }));
  });

  it('fails when minDurationDays is below 0.5', () => {
    assert.throws(() => createLeaveTypeSchema.parse({ ...valid, minDurationDays: 0.1 }));
  });
});

// ── createLeavePolicySchema ────────────────────────────────────────────────────
describe('createLeavePolicySchema', () => {
  const valid = {
    companyId: 'company-1',
    leaveTypeId: 'lt-1',
    annualQuota: 20,
    accrualFrequency: 'Monthly' as const,
    sandwichRule: false,
    minServiceDays: 0,
  };

  it('parses valid payload', () => {
    const result = createLeavePolicySchema.parse(valid);
    assert.equal(result.annualQuota, 20);
    assert.equal(result.accrualFrequency, 'Monthly');
  });

  it('defaults accrualFrequency to Monthly', () => {
    const { accrualFrequency: _, ...rest } = valid;
    assert.equal(createLeavePolicySchema.parse(rest).accrualFrequency, 'Monthly');
  });

  it('defaults sandwichRule to false', () => {
    const { sandwichRule: _, ...rest } = valid;
    assert.equal(createLeavePolicySchema.parse(rest).sandwichRule, false);
  });

  it('accepts Quarterly and Yearly frequencies', () => {
    assert.equal(createLeavePolicySchema.parse({ ...valid, accrualFrequency: 'Quarterly' }).accrualFrequency, 'Quarterly');
    assert.equal(createLeavePolicySchema.parse({ ...valid, accrualFrequency: 'Yearly' }).accrualFrequency, 'Yearly');
  });

  it('fails on invalid accrualFrequency', () => {
    assert.throws(() => createLeavePolicySchema.parse({ ...valid, accrualFrequency: 'Daily' }));
  });

  it('fails when annualQuota is zero or negative', () => {
    assert.throws(() => createLeavePolicySchema.parse({ ...valid, annualQuota: 0 }));
    assert.throws(() => createLeavePolicySchema.parse({ ...valid, annualQuota: -5 }));
  });

  it('fails when companyId is empty', () => {
    assert.throws(() => createLeavePolicySchema.parse({ ...valid, companyId: '' }));
  });
});

// ── applyLeaveSchema ───────────────────────────────────────────────────────────
describe('applyLeaveSchema', () => {
  const valid = {
    leaveTypeId: 'lt-1',
    fromDate: '2026-07-01',
    toDate: '2026-07-03',
    reason: 'Vacation',
  };

  it('parses valid leave application', () => {
    const result = applyLeaveSchema.parse(valid);
    assert.equal(result.fromDate, '2026-07-01');
    assert.equal(result.toDate, '2026-07-03');
  });

  it('accepts single-day leave (fromDate === toDate)', () => {
    const result = applyLeaveSchema.parse({ ...valid, toDate: '2026-07-01' });
    assert.equal(result.fromDate, result.toDate);
  });

  it('reason is optional', () => {
    const { reason: _, ...rest } = valid;
    const result = applyLeaveSchema.parse(rest);
    assert.equal(result.reason, undefined);
  });

  it('accepts contactDuringLeave', () => {
    const result = applyLeaveSchema.parse({ ...valid, contactDuringLeave: '+91-9999' });
    assert.equal(result.contactDuringLeave, '+91-9999');
  });

  it('fails when toDate is before fromDate', () => {
    assert.throws(() => applyLeaveSchema.parse({ ...valid, fromDate: '2026-07-05', toDate: '2026-07-01' }));
  });

  it('fails when leaveTypeId is missing', () => {
    const { leaveTypeId: _, ...rest } = valid;
    assert.throws(() => applyLeaveSchema.parse(rest));
  });

  it('fails when fromDate is empty string', () => {
    assert.throws(() => applyLeaveSchema.parse({ ...valid, fromDate: '' }));
  });

  it('fails when toDate is empty string', () => {
    assert.throws(() => applyLeaveSchema.parse({ ...valid, toDate: '' }));
  });
});

// ── leaveApprovalSchema ────────────────────────────────────────────────────────
describe('leaveApprovalSchema', () => {
  it('parses Approved status', () => {
    assert.equal(leaveApprovalSchema.parse({ status: 'Approved' }).status, 'Approved');
  });

  it('parses Rejected with rejectedReason', () => {
    const result = leaveApprovalSchema.parse({ status: 'Rejected', rejectedReason: 'No cover' });
    assert.equal(result.rejectedReason, 'No cover');
  });

  it('rejectedReason is optional', () => {
    assert.equal(leaveApprovalSchema.parse({ status: 'Rejected' }).rejectedReason, undefined);
  });

  it('fails on Pending, Cancelled, or empty status', () => {
    assert.throws(() => leaveApprovalSchema.parse({ status: 'Pending' }));
    assert.throws(() => leaveApprovalSchema.parse({ status: 'Cancelled' }));
    assert.throws(() => leaveApprovalSchema.parse({ status: '' }));
  });
});

// ── leaveFilterSchema ──────────────────────────────────────────────────────────
describe('leaveFilterSchema', () => {
  it('defaults page=1 and limit=20', () => {
    const result = leaveFilterSchema.parse({});
    assert.equal(result.page, 1);
    assert.equal(result.limit, 20);
  });

  it('coerces page/limit from strings', () => {
    const result = leaveFilterSchema.parse({ page: '2', limit: '50' });
    assert.equal(result.page, 2);
    assert.equal(result.limit, 50);
  });

  it('fails when limit exceeds 100', () => {
    assert.throws(() => leaveFilterSchema.parse({ limit: '101' }));
  });

  it('fails when page < 1', () => {
    assert.throws(() => leaveFilterSchema.parse({ page: '0' }));
  });

  it('passes optional filter fields through', () => {
    const result = leaveFilterSchema.parse({ status: 'Pending', employeeId: 'emp-1', fromDate: '2026-07-01', toDate: '2026-07-31' });
    assert.equal(result.status, 'Pending');
    assert.equal(result.employeeId, 'emp-1');
  });
});
