"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Leave service tests — Node.js built-in test runner (no vitest/esbuild)
 * Compile: tsc --noEmitOnError false --noEmit false --outDir dist-test --rootDir . \
 *            --module NodeNext --moduleResolution NodeNext --target ES2022 \
 *            tests/unit/leave.service.node.test.ts src/modules/leave/leave.service.ts \
 *            src/common/errors/index.ts src/config/database.ts
 * Run:  node --test dist-test/tests/unit/leave.service.node.test.js
 */
const node_test_1 = require("node:test");
const strict_1 = __importDefault(require("node:assert/strict"));
// ── Stub DB functions before importing the service ────────────────────────────
const mockQuery = node_test_1.mock.fn();
const mockQueryOne = node_test_1.mock.fn();
const mockInsert = node_test_1.mock.fn();
// Provide module stubs via Node's module-level mock cache
// We swap the real module at load time using mock.module() (Node 22.3+)
await node_test_1.mock.module('../../src/config/database.js', {
    namedExports: {
        query: mockQuery,
        queryOne: mockQueryOne,
        insert: mockInsert,
        execute: node_test_1.mock.fn(),
    },
});
const { LeaveService } = await import('../../src/modules/leave/leave.service.js');
const { NotFoundError, ConflictError, BusinessRuleError } = await import('../../src/common/errors/index.js');
// ── Fixtures ──────────────────────────────────────────────────────────────────
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
const leavePolicy = { id: POL_ID, leaveTypeId: LT_ID, leave_type_id: LT_ID, annualQuota: 20, annual_quota: 20 };
const application = { id: APP_ID, tenantId: TENANT, employeeId: EMP_ID, leaveTypeId: LT_ID, fromDate: '2026-07-01', toDate: '2026-07-03', totalDays: 3, status: 'Pending' };
const balance = { id: BAL_ID, employeeId: EMP_ID, leaveTypeId: LT_ID, year: YEAR, currentBalance: 10 };
const holiday = { id: HOL_ID, holidayName: 'New Year', holidayDate: '2026-01-01', year: 2026 };
function clearMocks() {
    mockQuery.mock.resetCalls();
    mockQueryOne.mock.resetCalls();
    mockInsert.mock.resetCalls();
}
// ═════════════════════════════════════════════════════════════════════════════
(0, node_test_1.describe)('LeaveService', () => {
    let svc;
    (0, node_test_1.beforeEach)(() => { svc = new LeaveService(); clearMocks(); });
    // ── Leave Types ─────────────────────────────────────────────────────────────
    (0, node_test_1.describe)('listLeaveTypes', () => {
        (0, node_test_1.it)('returns active leave types for a company', async () => {
            mockQuery.mock.mockImplementationOnce(async () => [leaveType]);
            const result = await svc.listLeaveTypes(TENANT, COMPANY);
            strict_1.default.deepEqual(result, [leaveType]);
            strict_1.default.ok(mockQuery.mock.calls[0].arguments[0].includes('leave_types'));
        });
        (0, node_test_1.it)('returns empty array when no types exist', async () => {
            mockQuery.mock.mockImplementationOnce(async () => []);
            strict_1.default.deepEqual(await svc.listLeaveTypes(TENANT, COMPANY), []);
        });
    });
    (0, node_test_1.describe)('createLeaveType', () => {
        const input = { companyId: COMPANY, leaveName: 'Annual Leave', leaveCode: 'AL', isPaid: true, requiresApproval: true, minDurationDays: 0.5, allowEncashment: false };
        (0, node_test_1.it)('creates a leave type and returns it', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => null); // no dup
            mockInsert.mock.mockImplementationOnce(async () => LT_ID);
            mockQueryOne.mock.mockImplementationOnce(async () => leaveType); // after insert
            const result = await svc.createLeaveType(TENANT, input);
            strict_1.default.equal(result.id, LT_ID);
        });
        (0, node_test_1.it)('throws ConflictError when leave code exists', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => ({ id: 'x' }));
            await strict_1.default.rejects(() => svc.createLeaveType(TENANT, input), ConflictError);
        });
    });
    (0, node_test_1.describe)('updateLeaveType', () => {
        const input = { leaveName: 'Updated', isPaid: false, requiresApproval: true, minDurationDays: 1, allowEncashment: false, status: 'Active' };
        (0, node_test_1.it)('updates leave type and returns updated record', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => ({ id: LT_ID }));
            mockQuery.mock.mockImplementationOnce(async () => []);
            mockQueryOne.mock.mockImplementationOnce(async () => ({ ...leaveType, ...input }));
            const result = await svc.updateLeaveType(LT_ID, TENANT, input);
            strict_1.default.equal(result.leaveName, 'Updated');
        });
        (0, node_test_1.it)('throws NotFoundError when type does not exist', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => null);
            await strict_1.default.rejects(() => svc.updateLeaveType('bad', TENANT, input), NotFoundError);
        });
    });
    (0, node_test_1.describe)('deleteLeaveType', () => {
        (0, node_test_1.it)('soft-deletes by setting status to Inactive', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => ({ id: LT_ID }));
            mockQuery.mock.mockImplementationOnce(async () => []);
            const result = await svc.deleteLeaveType(LT_ID, TENANT);
            strict_1.default.match(result.message, /deactivated/i);
            strict_1.default.ok(mockQuery.mock.calls[0].arguments[0].includes('Inactive'));
        });
        (0, node_test_1.it)('throws NotFoundError for unknown id', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => null);
            await strict_1.default.rejects(() => svc.deleteLeaveType('bad', TENANT), NotFoundError);
        });
    });
    // ── Leave Policies ──────────────────────────────────────────────────────────
    (0, node_test_1.describe)('createLeavePolicy', () => {
        const input = { companyId: COMPANY, leaveTypeId: LT_ID, annualQuota: 20, accrualFrequency: 'Monthly', sandwichRule: false, minServiceDays: 0 };
        (0, node_test_1.it)('creates policy and returns it', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => null);
            mockInsert.mock.mockImplementationOnce(async () => POL_ID);
            mockQueryOne.mock.mockImplementationOnce(async () => leavePolicy);
            const result = await svc.createLeavePolicy(TENANT, input);
            strict_1.default.equal(result.id, POL_ID);
        });
        (0, node_test_1.it)('throws ConflictError when active policy exists', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => ({ id: POL_ID }));
            await strict_1.default.rejects(() => svc.createLeavePolicy(TENANT, input), ConflictError);
        });
    });
    // ── Leave Applications ──────────────────────────────────────────────────────
    (0, node_test_1.describe)('apply', () => {
        const input = { leaveTypeId: LT_ID, fromDate: '2026-07-01', toDate: '2026-07-03', reason: 'Vacation' };
        (0, node_test_1.it)('creates application and deducts from balance', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => null); // no overlap
            mockQueryOne.mock.mockImplementationOnce(async () => balance); // balance
            mockInsert.mock.mockImplementationOnce(async () => APP_ID);
            mockQuery.mock.mockImplementationOnce(async () => []); // balance update
            const result = await svc.apply(TENANT, EMP_ID, input);
            strict_1.default.equal(result.applicationId, APP_ID);
            strict_1.default.equal(result.totalDays, 3);
        });
        (0, node_test_1.it)('throws BusinessRuleError on overlapping leave', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => ({ id: 'x' }));
            await strict_1.default.rejects(() => svc.apply(TENANT, EMP_ID, input), BusinessRuleError);
        });
        (0, node_test_1.it)('throws BusinessRuleError when balance is insufficient', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => null);
            mockQueryOne.mock.mockImplementationOnce(async () => ({ ...balance, currentBalance: 1 }));
            await strict_1.default.rejects(() => svc.apply(TENANT, EMP_ID, input), BusinessRuleError);
        });
        (0, node_test_1.it)('applies leave when no balance record exists (no quota enforcement)', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => null); // no overlap
            mockQueryOne.mock.mockImplementationOnce(async () => null); // no balance
            mockInsert.mock.mockImplementationOnce(async () => APP_ID);
            const result = await svc.apply(TENANT, EMP_ID, input);
            strict_1.default.equal(result.applicationId, APP_ID);
            strict_1.default.equal(mockQuery.mock.callCount(), 0); // no balance update called
        });
        (0, node_test_1.it)('calculates totalDays = 1 for single-day leave', async () => {
            const single = { ...input, fromDate: '2026-07-01', toDate: '2026-07-01' };
            mockQueryOne.mock.mockImplementationOnce(async () => null);
            mockQueryOne.mock.mockImplementationOnce(async () => balance);
            mockInsert.mock.mockImplementationOnce(async () => APP_ID);
            mockQuery.mock.mockImplementationOnce(async () => []);
            const result = await svc.apply(TENANT, EMP_ID, single);
            strict_1.default.equal(result.totalDays, 1);
        });
    });
    (0, node_test_1.describe)('approve', () => {
        (0, node_test_1.it)('approves pending application and moves balance to used_ytd', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => application);
            mockQuery.mock.mockImplementation(async () => []);
            mockQueryOne.mock.mockImplementationOnce(async () => ({ id: BAL_ID }));
            const result = await svc.approve(APP_ID, TENANT, 'approver');
            strict_1.default.match(result.message, /approved/i);
        });
        (0, node_test_1.it)('throws NotFoundError for missing application', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => null);
            await strict_1.default.rejects(() => svc.approve('bad', TENANT, 'approver'), NotFoundError);
        });
        (0, node_test_1.it)('throws BusinessRuleError when not Pending', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => ({ ...application, status: 'Approved' }));
            await strict_1.default.rejects(() => svc.approve(APP_ID, TENANT, 'approver'), BusinessRuleError);
        });
    });
    (0, node_test_1.describe)('reject', () => {
        (0, node_test_1.it)('rejects pending application and restores balance', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => application);
            mockQuery.mock.mockImplementation(async () => []);
            mockQueryOne.mock.mockImplementationOnce(async () => ({ id: BAL_ID }));
            const result = await svc.reject(APP_ID, TENANT, 'approver', 'No cover');
            strict_1.default.match(result.message, /rejected/i);
        });
        (0, node_test_1.it)('throws NotFoundError for missing application', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => null);
            await strict_1.default.rejects(() => svc.reject('bad', TENANT, 'approver'), NotFoundError);
        });
        (0, node_test_1.it)('throws BusinessRuleError when not Pending', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => ({ ...application, status: 'Rejected' }));
            await strict_1.default.rejects(() => svc.reject(APP_ID, TENANT, 'approver'), BusinessRuleError);
        });
    });
    (0, node_test_1.describe)('cancel', () => {
        (0, node_test_1.it)('cancels a Pending application and restores balance', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => application);
            mockQuery.mock.mockImplementation(async () => []);
            mockQueryOne.mock.mockImplementationOnce(async () => ({ id: BAL_ID }));
            const result = await svc.cancel(APP_ID, TENANT, EMP_ID);
            strict_1.default.match(result.message, /cancelled/i);
        });
        (0, node_test_1.it)('cancels an Approved application and rolls back used_ytd', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => ({ ...application, status: 'Approved' }));
            mockQuery.mock.mockImplementation(async () => []);
            mockQueryOne.mock.mockImplementationOnce(async () => ({ id: BAL_ID }));
            const result = await svc.cancel(APP_ID, TENANT, EMP_ID);
            strict_1.default.match(result.message, /cancelled/i);
            const balanceCall = mockQuery.mock.calls.find(c => c.arguments[0].includes('used_ytd'));
            strict_1.default.ok(balanceCall, 'expected used_ytd update query');
        });
        (0, node_test_1.it)('throws BusinessRuleError for already-Cancelled leave', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => ({ ...application, status: 'Cancelled' }));
            await strict_1.default.rejects(() => svc.cancel(APP_ID, TENANT, EMP_ID), BusinessRuleError);
        });
        (0, node_test_1.it)('throws BusinessRuleError for Rejected leave', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => ({ ...application, status: 'Rejected' }));
            await strict_1.default.rejects(() => svc.cancel(APP_ID, TENANT, EMP_ID), BusinessRuleError);
        });
        (0, node_test_1.it)('throws NotFoundError when application not found', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => null);
            await strict_1.default.rejects(() => svc.cancel('bad', TENANT, EMP_ID), NotFoundError);
        });
    });
    (0, node_test_1.describe)('listApplications', () => {
        (0, node_test_1.it)('returns paginated list with meta', async () => {
            mockQuery.mock.mockImplementationOnce(async () => [application]);
            mockQuery.mock.mockImplementationOnce(async () => [{ total: 1 }]);
            const result = await svc.listApplications(TENANT, { page: 1, limit: 20 });
            strict_1.default.deepEqual(result.data, [application]);
            strict_1.default.equal(result.meta.total, 1);
            strict_1.default.equal(result.meta.hasNext, false);
        });
        (0, node_test_1.it)('filters by status', async () => {
            mockQuery.mock.mockImplementationOnce(async () => []);
            mockQuery.mock.mockImplementationOnce(async () => [{ total: 0 }]);
            await svc.listApplications(TENANT, { status: 'Approved', page: 1, limit: 20 });
            strict_1.default.ok(mockQuery.mock.calls[0].arguments[0].includes('la.status = ?'));
        });
        (0, node_test_1.it)('hasPrev is true on page 2', async () => {
            mockQuery.mock.mockImplementationOnce(async () => []);
            mockQuery.mock.mockImplementationOnce(async () => [{ total: 30 }]);
            const result = await svc.listApplications(TENANT, { page: 2, limit: 20 });
            strict_1.default.equal(result.meta.hasPrev, true);
        });
    });
    (0, node_test_1.describe)('getApplication', () => {
        (0, node_test_1.it)('returns the application', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => application);
            strict_1.default.deepEqual(await svc.getApplication(APP_ID, TENANT), application);
        });
        (0, node_test_1.it)('throws NotFoundError for unknown id', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => null);
            await strict_1.default.rejects(() => svc.getApplication('bad', TENANT), NotFoundError);
        });
    });
    // ── Balances ────────────────────────────────────────────────────────────────
    (0, node_test_1.describe)('getBalance', () => {
        (0, node_test_1.it)('returns balance for employee in current year', async () => {
            mockQuery.mock.mockImplementationOnce(async () => [balance]);
            const result = await svc.getBalance(TENANT, EMP_ID);
            strict_1.default.equal(result[0].id, BAL_ID);
            strict_1.default.deepEqual(mockQuery.mock.calls[0].arguments[1], [EMP_ID, YEAR]);
        });
        (0, node_test_1.it)('uses provided year', async () => {
            mockQuery.mock.mockImplementationOnce(async () => []);
            await svc.getBalance(TENANT, EMP_ID, 2025);
            strict_1.default.deepEqual(mockQuery.mock.calls[0].arguments[1], [EMP_ID, 2025]);
        });
    });
    (0, node_test_1.describe)('initBalances', () => {
        (0, node_test_1.it)('creates balance records for each employee × policy', async () => {
            mockQuery.mock.mockImplementationOnce(async () => [{ id: EMP_ID }]);
            mockQuery.mock.mockImplementationOnce(async () => [{ ...leavePolicy, status: 'Active' }]);
            mockQueryOne.mock.mockImplementationOnce(async () => null);
            mockInsert.mock.mockImplementationOnce(async () => BAL_ID);
            const result = await svc.initBalances(TENANT, COMPANY, YEAR);
            strict_1.default.match(result.message, /1/);
        });
        (0, node_test_1.it)('skips already-existing balances', async () => {
            mockQuery.mock.mockImplementationOnce(async () => [{ id: EMP_ID }]);
            mockQuery.mock.mockImplementationOnce(async () => [{ ...leavePolicy, status: 'Active' }]);
            mockQueryOne.mock.mockImplementationOnce(async () => ({ id: BAL_ID }));
            const result = await svc.initBalances(TENANT, COMPANY, YEAR);
            strict_1.default.match(result.message, /0/);
            strict_1.default.equal(mockInsert.mock.callCount(), 0);
        });
    });
    (0, node_test_1.describe)('updateBalance', () => {
        (0, node_test_1.it)('updates opening and current balance', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => ({ id: BAL_ID }));
            mockQuery.mock.mockImplementationOnce(async () => []);
            mockQueryOne.mock.mockImplementationOnce(async () => ({ ...balance, currentBalance: 15 }));
            const result = await svc.updateBalance(BAL_ID, TENANT, { openingBalance: 15, currentBalance: 15 });
            strict_1.default.equal(result.currentBalance, 15);
        });
        (0, node_test_1.it)('throws NotFoundError when balance not found', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => null);
            await strict_1.default.rejects(() => svc.updateBalance('bad', TENANT, {}), NotFoundError);
        });
    });
    // ── Holidays ─────────────────────────────────────────────────────────────────
    (0, node_test_1.describe)('listHolidays', () => {
        (0, node_test_1.it)('returns holidays for company and year', async () => {
            mockQuery.mock.mockImplementationOnce(async () => [holiday]);
            const result = await svc.listHolidays(TENANT, COMPANY, 2026);
            strict_1.default.equal(result[0].id, HOL_ID);
            strict_1.default.deepEqual(mockQuery.mock.calls[0].arguments[1], [COMPANY, 2026]);
        });
    });
    (0, node_test_1.describe)('createHoliday', () => {
        const input = { companyId: COMPANY, holidayName: 'New Year', holidayDate: '2026-01-01', holidayType: 'National', isOptional: false };
        (0, node_test_1.it)('creates holiday and returns it', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => null);
            mockInsert.mock.mockImplementationOnce(async () => HOL_ID);
            mockQueryOne.mock.mockImplementationOnce(async () => holiday);
            strict_1.default.deepEqual(await svc.createHoliday(TENANT, input), holiday);
        });
        (0, node_test_1.it)('throws ConflictError when date is taken', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => ({ id: HOL_ID }));
            await strict_1.default.rejects(() => svc.createHoliday(TENANT, input), ConflictError);
        });
        (0, node_test_1.it)('infers year from holidayDate', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => null);
            mockInsert.mock.mockImplementationOnce(async () => HOL_ID);
            mockQueryOne.mock.mockImplementationOnce(async () => holiday);
            await svc.createHoliday(TENANT, { ...input, holidayDate: '2027-12-25' });
            strict_1.default.ok(mockInsert.mock.calls[0].arguments[1].includes(2027));
        });
    });
    (0, node_test_1.describe)('updateHoliday', () => {
        const input = { holidayName: 'Updated', holidayType: 'Regional', isOptional: true };
        (0, node_test_1.it)('updates and returns updated holiday', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => ({ id: HOL_ID }));
            mockQuery.mock.mockImplementationOnce(async () => []);
            mockQueryOne.mock.mockImplementationOnce(async () => ({ ...holiday, ...input }));
            const result = await svc.updateHoliday(HOL_ID, TENANT, input);
            strict_1.default.equal(result.holidayName, 'Updated');
        });
        (0, node_test_1.it)('throws NotFoundError for unknown holiday', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => null);
            await strict_1.default.rejects(() => svc.updateHoliday('bad', TENANT, input), NotFoundError);
        });
    });
    (0, node_test_1.describe)('deleteHoliday', () => {
        (0, node_test_1.it)('hard-deletes holiday', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => ({ id: HOL_ID }));
            mockQuery.mock.mockImplementationOnce(async () => []);
            const result = await svc.deleteHoliday(HOL_ID, TENANT);
            strict_1.default.match(result.message, /deleted/i);
            strict_1.default.ok(mockQuery.mock.calls[0].arguments[0].startsWith('DELETE FROM holidays'));
        });
        (0, node_test_1.it)('throws NotFoundError for unknown id', async () => {
            mockQueryOne.mock.mockImplementationOnce(async () => null);
            await strict_1.default.rejects(() => svc.deleteHoliday('bad', TENANT), NotFoundError);
        });
    });
    // ── Calendar ─────────────────────────────────────────────────────────────────
    (0, node_test_1.describe)('getCalendar', () => {
        (0, node_test_1.it)('returns applications and holidays for month/year', async () => {
            mockQuery.mock.mockImplementationOnce(async () => [application]);
            mockQuery.mock.mockImplementationOnce(async () => [holiday]);
            const result = await svc.getCalendar(TENANT, EMP_ID, 7, 2026);
            strict_1.default.equal(result.applications.length, 1);
            strict_1.default.equal(result.holidays.length, 1);
        });
        (0, node_test_1.it)('builds correct end date for Feb 2026 (28 days)', async () => {
            mockQuery.mock.mockImplementation(async () => []);
            await svc.getCalendar(TENANT, EMP_ID, 2, 2026);
            const lastHolQuery = mockQuery.mock.calls[1];
            strict_1.default.ok(lastHolQuery.arguments[1].includes('2026-02-28'));
        });
    });
});
