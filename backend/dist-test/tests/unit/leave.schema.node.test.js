"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Leave schema tests — uses Node.js built-in test runner (no vitest/esbuild needed)
 * Run: node --import tsx/esm --test tests/unit/leave.schema.node.test.ts
 */
const node_test_1 = require("node:test");
const strict_1 = __importDefault(require("node:assert/strict"));
const leave_schema_js_1 = require("../../src/modules/leave/leave.schema.js");
// ── createLeaveTypeSchema ──────────────────────────────────────────────────────
(0, node_test_1.describe)('createLeaveTypeSchema', () => {
    const valid = {
        companyId: 'company-1',
        leaveName: 'Annual Leave',
        leaveCode: 'AL',
        isPaid: true,
        requiresApproval: true,
        minDurationDays: 0.5,
        allowEncashment: false,
    };
    (0, node_test_1.it)('parses a valid payload', () => {
        const result = leave_schema_js_1.createLeaveTypeSchema.parse(valid);
        strict_1.default.equal(result.leaveCode, 'AL');
        strict_1.default.equal(result.isPaid, true);
    });
    (0, node_test_1.it)('applies default minDurationDays of 0.5', () => {
        const { minDurationDays: _, ...rest } = valid;
        const result = leave_schema_js_1.createLeaveTypeSchema.parse(rest);
        strict_1.default.equal(result.minDurationDays, 0.5);
    });
    (0, node_test_1.it)('coerces isPaid from string "true"', () => {
        const result = leave_schema_js_1.createLeaveTypeSchema.parse({ ...valid, isPaid: 'true' });
        strict_1.default.equal(result.isPaid, true);
    });
    (0, node_test_1.it)('coerces allowEncashment from string "false"', () => {
        const result = leave_schema_js_1.createLeaveTypeSchema.parse({ ...valid, allowEncashment: 'false' });
        strict_1.default.equal(result.allowEncashment, false);
    });
    (0, node_test_1.it)('fails when companyId is missing', () => {
        const { companyId: _, ...rest } = valid;
        strict_1.default.throws(() => leave_schema_js_1.createLeaveTypeSchema.parse(rest));
    });
    (0, node_test_1.it)('fails when leaveName is too short', () => {
        strict_1.default.throws(() => leave_schema_js_1.createLeaveTypeSchema.parse({ ...valid, leaveName: 'A' }));
    });
    (0, node_test_1.it)('fails when leaveCode is too short', () => {
        strict_1.default.throws(() => leave_schema_js_1.createLeaveTypeSchema.parse({ ...valid, leaveCode: 'A' }));
    });
    (0, node_test_1.it)('fails when leaveCode exceeds 20 chars', () => {
        strict_1.default.throws(() => leave_schema_js_1.createLeaveTypeSchema.parse({ ...valid, leaveCode: 'A'.repeat(21) }));
    });
    (0, node_test_1.it)('fails when minDurationDays is below 0.5', () => {
        strict_1.default.throws(() => leave_schema_js_1.createLeaveTypeSchema.parse({ ...valid, minDurationDays: 0.1 }));
    });
});
// ── createLeavePolicySchema ────────────────────────────────────────────────────
(0, node_test_1.describe)('createLeavePolicySchema', () => {
    const valid = {
        companyId: 'company-1',
        leaveTypeId: 'lt-1',
        annualQuota: 20,
        accrualFrequency: 'Monthly',
        sandwichRule: false,
        minServiceDays: 0,
    };
    (0, node_test_1.it)('parses valid payload', () => {
        const result = leave_schema_js_1.createLeavePolicySchema.parse(valid);
        strict_1.default.equal(result.annualQuota, 20);
        strict_1.default.equal(result.accrualFrequency, 'Monthly');
    });
    (0, node_test_1.it)('defaults accrualFrequency to Monthly', () => {
        const { accrualFrequency: _, ...rest } = valid;
        strict_1.default.equal(leave_schema_js_1.createLeavePolicySchema.parse(rest).accrualFrequency, 'Monthly');
    });
    (0, node_test_1.it)('defaults sandwichRule to false', () => {
        const { sandwichRule: _, ...rest } = valid;
        strict_1.default.equal(leave_schema_js_1.createLeavePolicySchema.parse(rest).sandwichRule, false);
    });
    (0, node_test_1.it)('accepts Quarterly and Yearly frequencies', () => {
        strict_1.default.equal(leave_schema_js_1.createLeavePolicySchema.parse({ ...valid, accrualFrequency: 'Quarterly' }).accrualFrequency, 'Quarterly');
        strict_1.default.equal(leave_schema_js_1.createLeavePolicySchema.parse({ ...valid, accrualFrequency: 'Yearly' }).accrualFrequency, 'Yearly');
    });
    (0, node_test_1.it)('fails on invalid accrualFrequency', () => {
        strict_1.default.throws(() => leave_schema_js_1.createLeavePolicySchema.parse({ ...valid, accrualFrequency: 'Daily' }));
    });
    (0, node_test_1.it)('fails when annualQuota is zero or negative', () => {
        strict_1.default.throws(() => leave_schema_js_1.createLeavePolicySchema.parse({ ...valid, annualQuota: 0 }));
        strict_1.default.throws(() => leave_schema_js_1.createLeavePolicySchema.parse({ ...valid, annualQuota: -5 }));
    });
    (0, node_test_1.it)('fails when companyId is empty', () => {
        strict_1.default.throws(() => leave_schema_js_1.createLeavePolicySchema.parse({ ...valid, companyId: '' }));
    });
});
// ── applyLeaveSchema ───────────────────────────────────────────────────────────
(0, node_test_1.describe)('applyLeaveSchema', () => {
    const valid = {
        leaveTypeId: 'lt-1',
        fromDate: '2026-07-01',
        toDate: '2026-07-03',
        reason: 'Vacation',
    };
    (0, node_test_1.it)('parses valid leave application', () => {
        const result = leave_schema_js_1.applyLeaveSchema.parse(valid);
        strict_1.default.equal(result.fromDate, '2026-07-01');
        strict_1.default.equal(result.toDate, '2026-07-03');
    });
    (0, node_test_1.it)('accepts single-day leave (fromDate === toDate)', () => {
        const result = leave_schema_js_1.applyLeaveSchema.parse({ ...valid, toDate: '2026-07-01' });
        strict_1.default.equal(result.fromDate, result.toDate);
    });
    (0, node_test_1.it)('reason is optional', () => {
        const { reason: _, ...rest } = valid;
        const result = leave_schema_js_1.applyLeaveSchema.parse(rest);
        strict_1.default.equal(result.reason, undefined);
    });
    (0, node_test_1.it)('accepts contactDuringLeave', () => {
        const result = leave_schema_js_1.applyLeaveSchema.parse({ ...valid, contactDuringLeave: '+91-9999' });
        strict_1.default.equal(result.contactDuringLeave, '+91-9999');
    });
    (0, node_test_1.it)('fails when toDate is before fromDate', () => {
        strict_1.default.throws(() => leave_schema_js_1.applyLeaveSchema.parse({ ...valid, fromDate: '2026-07-05', toDate: '2026-07-01' }));
    });
    (0, node_test_1.it)('fails when leaveTypeId is missing', () => {
        const { leaveTypeId: _, ...rest } = valid;
        strict_1.default.throws(() => leave_schema_js_1.applyLeaveSchema.parse(rest));
    });
    (0, node_test_1.it)('fails when fromDate is empty string', () => {
        strict_1.default.throws(() => leave_schema_js_1.applyLeaveSchema.parse({ ...valid, fromDate: '' }));
    });
    (0, node_test_1.it)('fails when toDate is empty string', () => {
        strict_1.default.throws(() => leave_schema_js_1.applyLeaveSchema.parse({ ...valid, toDate: '' }));
    });
});
// ── leaveApprovalSchema ────────────────────────────────────────────────────────
(0, node_test_1.describe)('leaveApprovalSchema', () => {
    (0, node_test_1.it)('parses Approved status', () => {
        strict_1.default.equal(leave_schema_js_1.leaveApprovalSchema.parse({ status: 'Approved' }).status, 'Approved');
    });
    (0, node_test_1.it)('parses Rejected with rejectedReason', () => {
        const result = leave_schema_js_1.leaveApprovalSchema.parse({ status: 'Rejected', rejectedReason: 'No cover' });
        strict_1.default.equal(result.rejectedReason, 'No cover');
    });
    (0, node_test_1.it)('rejectedReason is optional', () => {
        strict_1.default.equal(leave_schema_js_1.leaveApprovalSchema.parse({ status: 'Rejected' }).rejectedReason, undefined);
    });
    (0, node_test_1.it)('fails on Pending, Cancelled, or empty status', () => {
        strict_1.default.throws(() => leave_schema_js_1.leaveApprovalSchema.parse({ status: 'Pending' }));
        strict_1.default.throws(() => leave_schema_js_1.leaveApprovalSchema.parse({ status: 'Cancelled' }));
        strict_1.default.throws(() => leave_schema_js_1.leaveApprovalSchema.parse({ status: '' }));
    });
});
// ── leaveFilterSchema ──────────────────────────────────────────────────────────
(0, node_test_1.describe)('leaveFilterSchema', () => {
    (0, node_test_1.it)('defaults page=1 and limit=20', () => {
        const result = leave_schema_js_1.leaveFilterSchema.parse({});
        strict_1.default.equal(result.page, 1);
        strict_1.default.equal(result.limit, 20);
    });
    (0, node_test_1.it)('coerces page/limit from strings', () => {
        const result = leave_schema_js_1.leaveFilterSchema.parse({ page: '2', limit: '50' });
        strict_1.default.equal(result.page, 2);
        strict_1.default.equal(result.limit, 50);
    });
    (0, node_test_1.it)('fails when limit exceeds 100', () => {
        strict_1.default.throws(() => leave_schema_js_1.leaveFilterSchema.parse({ limit: '101' }));
    });
    (0, node_test_1.it)('fails when page < 1', () => {
        strict_1.default.throws(() => leave_schema_js_1.leaveFilterSchema.parse({ page: '0' }));
    });
    (0, node_test_1.it)('passes optional filter fields through', () => {
        const result = leave_schema_js_1.leaveFilterSchema.parse({ status: 'Pending', employeeId: 'emp-1', fromDate: '2026-07-01', toDate: '2026-07-31' });
        strict_1.default.equal(result.status, 'Pending');
        strict_1.default.equal(result.employeeId, 'emp-1');
    });
});
