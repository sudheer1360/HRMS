/**
 * Leave service tests — Node.js built-in test runner (no vitest/esbuild)
 * Compile+run via: see package.json test:node script
 */
import { describe, it, mock, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
// ── Stub DB before service is imported ──────────────────────────────────────
const mockQuery = mock.fn();
const mockQueryOne = mock.fn();
const mockInsert = mock.fn();
await mock.module('../../src/config/database.js', {
    namedExports: {
        query: mockQuery,
        queryOne: mockQueryOne,
        insert: mockInsert,
        execute: mock.fn(),
    },
});
const { LeaveService } = await import('../../src/modules/leave/leave.service.js');
const { NotFoundError, ConflictError, BusinessRuleError } = await import('../../src/common/errors/index.js');
// ── Fixtures ─────────────────────────────────────────────────────────────────
const TENANT = 'tenant-1';
const COMPANY = 'company-1';
const EMP_ID = 'emp-1';
const LT_ID = 'lt-1';
const APP_ID = 'app-1';
const BAL_ID = 'bal-1';
const HOL_ID = 'hol-1';
const POL_ID = 'pol-1';
const YEAR = new Date().getFullYear();
const leaveType = { id: LT_ID, leaveName: 'Annual Leave', leaveCode: 'AL', isPaid: true, status: 'Active' };
const leavePolicy = { id: POL_ID, leave_type_id: LT_ID, annual_quota: 20, status: 'Active' };
const application = { id: APP_ID, tenantId: TENANT, employeeId: EMP_ID, leaveTypeId: LT_ID, fromDate: '2026-07-01', toDate: '2026-07-03', totalDays: 3, status: 'Pending' };
const balance = { id: BAL_ID, employeeId: EMP_ID, leaveTypeId: LT_ID, year: YEAR, currentBalance: 10 };
const holiday = { id: HOL_ID, holidayName: 'New Year', holidayDate: '2026-01-01', year: 2026 };
function clearMocks() {
    mockQuery.mock.resetCalls();
    mockQueryOne.mock.resetCalls();
    mockInsert.mock.resetCalls();
    mockQuery.mock.mockImplementation(async () => []);
}
// ═════════════════════════════════════════════════════════════════════════════
describe('LeaveService', () => {
    let svc;
    beforeEach(() => { svc = new LeaveService(); clearMocks(); });
    // ── Leave Types ─────────────────────────────────────────────────────────────
    describe('listLeaveTypes', () => {
        it('returns active leave types for a company', async () => {
            mockQuery.mock.mockImplementationOnce(async () => [leaveType]);
            const result = await svc.listLeaveTypes(TENANT, COMPANY);
            assert.deepEqual(result, [leaveType]);
            assert.ok(mockQuery.mock.calls[0].arguments[0].includes('leave_types'));
        });
        it('returns empty array when no types exist', async () => {
            mockQuery.mock.mockImplementationOnce(async () => []);
            assert.deepEqual(await svc.listLeaveTypes(TENANT, COMPANY), []);
        });
    });
    describe('createLeaveType', () => {
        const input = { companyId: COMPANY, leaveName: 'Annual Leave', leaveCode: 'AL', isPaid: true, requiresApproval: true, minDurationDays: 0.5, allowEncashment: false };
        it('creates a leave type and returns it', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => null);
            mockInsert.mock.mockImplementationOnce(async () => LT_ID);
            mockQueryOne.mock.mockImplementationOnce(async () => leaveType);
            const result = await svc.createLeaveType(TENANT, input);
            assert.equal(result.id, LT_ID);
        });
        it('throws ConflictError when code already exists', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => ({ id: 'x' }));
            await assert.rejects(() => svc.createLeaveType(TENANT, input), ConflictError);
        });
    });
    describe('updateLeaveType', () => {
        const input = { leaveName: 'Updated', isPaid: false, requiresApproval: true, minDurationDays: 1, allowEncashment: false, status: 'Active' };
        it('updates and returns updated leave type', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => ({ id: LT_ID }));
            mockQueryOne.mock.mockImplementationOnce(async () => ({ ...leaveType, ...input }));
            const result = await svc.updateLeaveType(LT_ID, TENANT, input);
            assert.equal(result.leaveName, 'Updated');
        });
        it('throws NotFoundError when type does not exist', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => null);
            await assert.rejects(() => svc.updateLeaveType('bad', TENANT, input), NotFoundError);
        });
    });
    describe('deleteLeaveType', () => {
        it('soft-deletes by setting status Inactive', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => ({ id: LT_ID }));
            const result = await svc.deleteLeaveType(LT_ID, TENANT);
            assert.match(result.message, /deactivated/i);
            assert.ok(mockQuery.mock.calls[0].arguments[0].includes('Inactive'));
        });
        it('throws NotFoundError for unknown id', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => null);
            await assert.rejects(() => svc.deleteLeaveType('bad', TENANT), NotFoundError);
        });
    });
    // ── Leave Policies ──────────────────────────────────────────────────────────
    describe('createLeavePolicy', () => {
        const input = { companyId: COMPANY, leaveTypeId: LT_ID, annualQuota: 20, accrualFrequency: 'Monthly', sandwichRule: false, minServiceDays: 0 };
        it('creates policy and returns it', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => null);
            mockInsert.mock.mockImplementationOnce(async () => POL_ID);
            mockQueryOne.mock.mockImplementationOnce(async () => leavePolicy);
            const result = await svc.createLeavePolicy(TENANT, input);
            assert.equal(result.id, POL_ID);
        });
        it('throws ConflictError when active policy exists', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => ({ id: POL_ID }));
            await assert.rejects(() => svc.createLeavePolicy(TENANT, input), ConflictError);
        });
    });
    // ── Leave Applications ──────────────────────────────────────────────────────
    describe('apply', () => {
        const input = { leaveTypeId: LT_ID, fromDate: '2026-07-01', toDate: '2026-07-03', reason: 'Vacation' };
        it('creates application and deducts balance', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => null);
            mockQueryOne.mock.mockImplementationOnce(async () => balance);
            mockInsert.mock.mockImplementationOnce(async () => APP_ID);
            const result = await svc.apply(TENANT, EMP_ID, input);
            assert.equal(result.applicationId, APP_ID);
            assert.equal(result.totalDays, 3);
        });
        it('throws BusinessRuleError on overlapping leave', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => ({ id: 'x' }));
            await assert.rejects(() => svc.apply(TENANT, EMP_ID, input), BusinessRuleError);
        });
        it('throws BusinessRuleError when balance is insufficient', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => null);
            mockQueryOne.mock.mockImplementationOnce(async () => ({ ...balance, currentBalance: 1 }));
            await assert.rejects(() => svc.apply(TENANT, EMP_ID, input), BusinessRuleError);
        });
        it('applies leave with no balance record (no quota enforcement)', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => null);
            mockQueryOne.mock.mockImplementationOnce(async () => null);
            mockInsert.mock.mockImplementationOnce(async () => APP_ID);
            const result = await svc.apply(TENANT, EMP_ID, input);
            assert.equal(result.applicationId, APP_ID);
            assert.equal(mockQuery.mock.callCount(), 0);
        });
        it('calculates totalDays = 1 for single-day leave', async () => {
            const single = { ...input, toDate: '2026-07-01' };
            mockQueryOne.mock.mockImplementationOnce(async () => null);
            mockQueryOne.mock.mockImplementationOnce(async () => balance);
            mockInsert.mock.mockImplementationOnce(async () => APP_ID);
            const result = await svc.apply(TENANT, EMP_ID, single);
            assert.equal(result.totalDays, 1);
        });
    });
    describe('approve', () => {
        it('approves pending application and updates balance', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => application);
            mockQueryOne.mock.mockImplementationOnce(async () => ({ id: BAL_ID }));
            const result = await svc.approve(APP_ID, TENANT, 'approver');
            assert.match(result.message, /approved/i);
        });
        it('throws NotFoundError for missing application', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => null);
            await assert.rejects(() => svc.approve('bad', TENANT, 'approver'), NotFoundError);
        });
        it('throws BusinessRuleError when not Pending', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => ({ ...application, status: 'Approved' }));
            await assert.rejects(() => svc.approve(APP_ID, TENANT, 'approver'), BusinessRuleError);
        });
    });
    describe('reject', () => {
        it('rejects pending application and restores balance', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => application);
            mockQueryOne.mock.mockImplementationOnce(async () => ({ id: BAL_ID }));
            const result = await svc.reject(APP_ID, TENANT, 'approver', 'No cover');
            assert.match(result.message, /rejected/i);
        });
        it('throws NotFoundError for missing application', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => null);
            await assert.rejects(() => svc.reject('bad', TENANT, 'approver'), NotFoundError);
        });
        it('throws BusinessRuleError when not Pending', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => ({ ...application, status: 'Rejected' }));
            await assert.rejects(() => svc.reject(APP_ID, TENANT, 'approver'), BusinessRuleError);
        });
    });
    describe('cancel', () => {
        it('cancels a Pending application and restores balance', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => application);
            mockQueryOne.mock.mockImplementationOnce(async () => ({ id: BAL_ID }));
            const result = await svc.cancel(APP_ID, TENANT, EMP_ID);
            assert.match(result.message, /cancelled/i);
        });
        it('cancels an Approved application and rolls back used_ytd', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => ({ ...application, status: 'Approved' }));
            mockQueryOne.mock.mockImplementationOnce(async () => ({ id: BAL_ID }));
            const result = await svc.cancel(APP_ID, TENANT, EMP_ID);
            assert.match(result.message, /cancelled/i);
            const usedCall = mockQuery.mock.calls.find(c => c.arguments[0].includes('used_ytd'));
            assert.ok(usedCall, 'expected used_ytd rollback query');
        });
        it('throws BusinessRuleError for already-Cancelled leave', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => ({ ...application, status: 'Cancelled' }));
            await assert.rejects(() => svc.cancel(APP_ID, TENANT, EMP_ID), BusinessRuleError);
        });
        it('throws BusinessRuleError for Rejected leave', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => ({ ...application, status: 'Rejected' }));
            await assert.rejects(() => svc.cancel(APP_ID, TENANT, EMP_ID), BusinessRuleError);
        });
        it('throws NotFoundError when application not found', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => null);
            await assert.rejects(() => svc.cancel('bad', TENANT, EMP_ID), NotFoundError);
        });
    });
    describe('listApplications', () => {
        it('returns paginated list with meta', async () => {
            mockQuery.mock.mockImplementationOnce(async () => [application]);
            mockQuery.mock.mockImplementationOnce(async () => [{ total: 1 }]);
            const result = await svc.listApplications(TENANT, { page: 1, limit: 20 });
            assert.deepEqual(result.data, [application]);
            assert.equal(result.meta.total, 1);
            assert.equal(result.meta.hasNext, false);
        });
        it('filters by status when provided', async () => {
            mockQuery.mock.mockImplementationOnce(async () => []);
            mockQuery.mock.mockImplementationOnce(async () => [{ total: 0 }]);
            await svc.listApplications(TENANT, { status: 'Approved', page: 1, limit: 20 });
            assert.ok(mockQuery.mock.calls[0].arguments[0].includes('la.status = ?'));
        });
        it('hasPrev is true on page 2', async () => {
            mockQuery.mock.mockImplementationOnce(async () => []);
            mockQuery.mock.mockImplementationOnce(async () => [{ total: 30 }]);
            const result = await svc.listApplications(TENANT, { page: 2, limit: 20 });
            assert.equal(result.meta.hasPrev, true);
        });
    });
    describe('getApplication', () => {
        it('returns the application', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => application);
            assert.deepEqual(await svc.getApplication(APP_ID, TENANT), application);
        });
        it('throws NotFoundError for unknown id', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => null);
            await assert.rejects(() => svc.getApplication('bad', TENANT), NotFoundError);
        });
    });
    // ── Balances ─────────────────────────────────────────────────────────────────
    describe('getBalance', () => {
        it('returns balance for employee in current year', async () => {
            mockQuery.mock.mockImplementationOnce(async () => [balance]);
            const result = await svc.getBalance(TENANT, EMP_ID);
            assert.equal(result[0].id, BAL_ID);
            assert.deepEqual(mockQuery.mock.calls[0].arguments[1], [EMP_ID, YEAR]);
        });
        it('uses provided year when given', async () => {
            mockQuery.mock.mockImplementationOnce(async () => []);
            await svc.getBalance(TENANT, EMP_ID, 2025);
            assert.deepEqual(mockQuery.mock.calls[0].arguments[1], [EMP_ID, 2025]);
        });
    });
    describe('initBalances', () => {
        it('creates balance records for each employee × policy', async () => {
            mockQuery.mock.mockImplementationOnce(async () => [{ id: EMP_ID }]);
            mockQuery.mock.mockImplementationOnce(async () => [leavePolicy]);
            mockQueryOne.mock.mockImplementationOnce(async () => null);
            mockInsert.mock.mockImplementationOnce(async () => BAL_ID);
            const result = await svc.initBalances(TENANT, COMPANY, YEAR);
            assert.match(result.message, /1/);
        });
        it('skips already-existing balance records', async () => {
            mockQuery.mock.mockImplementationOnce(async () => [{ id: EMP_ID }]);
            mockQuery.mock.mockImplementationOnce(async () => [leavePolicy]);
            mockQueryOne.mock.mockImplementationOnce(async () => ({ id: BAL_ID }));
            const result = await svc.initBalances(TENANT, COMPANY, YEAR);
            assert.match(result.message, /0/);
            assert.equal(mockInsert.mock.callCount(), 0);
        });
    });
    describe('updateBalance', () => {
        it('updates balance record', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => ({ id: BAL_ID }));
            mockQueryOne.mock.mockImplementationOnce(async () => ({ ...balance, currentBalance: 15 }));
            const result = await svc.updateBalance(BAL_ID, TENANT, { openingBalance: 15, currentBalance: 15 });
            assert.equal(result.currentBalance, 15);
        });
        it('throws NotFoundError when balance not found', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => null);
            await assert.rejects(() => svc.updateBalance('bad', TENANT, {}), NotFoundError);
        });
    });
    // ── Holidays ─────────────────────────────────────────────────────────────────
    describe('listHolidays', () => {
        it('returns holidays for company and year', async () => {
            mockQuery.mock.mockImplementationOnce(async () => [holiday]);
            const result = await svc.listHolidays(TENANT, COMPANY, 2026);
            assert.equal(result[0].id, HOL_ID);
            assert.deepEqual(mockQuery.mock.calls[0].arguments[1], [COMPANY, 2026]);
        });
    });
    describe('createHoliday', () => {
        const input = { companyId: COMPANY, holidayName: 'New Year', holidayDate: '2026-01-01', holidayType: 'National', isOptional: false };
        it('creates holiday and returns it', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => null);
            mockInsert.mock.mockImplementationOnce(async () => HOL_ID);
            mockQueryOne.mock.mockImplementationOnce(async () => holiday);
            assert.deepEqual(await svc.createHoliday(TENANT, input), holiday);
        });
        it('throws ConflictError when date is taken', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => ({ id: HOL_ID }));
            await assert.rejects(() => svc.createHoliday(TENANT, input), ConflictError);
        });
        it('infers year from holidayDate', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => null);
            mockInsert.mock.mockImplementationOnce(async () => HOL_ID);
            mockQueryOne.mock.mockImplementationOnce(async () => holiday);
            await svc.createHoliday(TENANT, { ...input, holidayDate: '2027-12-25' });
            assert.ok(mockInsert.mock.calls[0].arguments[1].includes(2027));
        });
    });
    describe('updateHoliday', () => {
        const input = { holidayName: 'Updated', holidayType: 'Regional', isOptional: true };
        it('updates and returns updated holiday', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => ({ id: HOL_ID }));
            mockQueryOne.mock.mockImplementationOnce(async () => ({ ...holiday, ...input }));
            const result = await svc.updateHoliday(HOL_ID, TENANT, input);
            assert.equal(result.holidayName, 'Updated');
        });
        it('throws NotFoundError for unknown holiday', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => null);
            await assert.rejects(() => svc.updateHoliday('bad', TENANT, input), NotFoundError);
        });
    });
    describe('deleteHoliday', () => {
        it('hard-deletes holiday', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => ({ id: HOL_ID }));
            const result = await svc.deleteHoliday(HOL_ID, TENANT);
            assert.match(result.message, /deleted/i);
            assert.ok(mockQuery.mock.calls[0].arguments[0].startsWith('DELETE FROM holidays'));
        });
        it('throws NotFoundError for unknown id', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => null);
            await assert.rejects(() => svc.deleteHoliday('bad', TENANT), NotFoundError);
        });
    });
    // ── Calendar ──────────────────────────────────────────────────────────────────
    describe('getCalendar', () => {
        it('returns applications and holidays for month/year', async () => {
            mockQuery.mock.mockImplementationOnce(async () => [application]);
            mockQuery.mock.mockImplementationOnce(async () => [holiday]);
            const result = await svc.getCalendar(TENANT, EMP_ID, 7, 2026);
            assert.equal(result.applications.length, 1);
            assert.equal(result.holidays.length, 1);
        });
        it('builds correct end date for Feb 2026 (28 days)', async () => {
            await svc.getCalendar(TENANT, EMP_ID, 2, 2026);
            const args = mockQuery.mock.calls[1].arguments[1];
            assert.ok(args.includes('2026-02-28'), `expected 2026-02-28 in ${JSON.stringify(args)}`);
        });
    });
});
