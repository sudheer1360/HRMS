/**
 * LeaveService unit tests using CJS module mutation for mocking.
 * Compiled dist-test output is CJS, so we can swap exports before requiring the service.
 * Run: node --test dist-test/tests/unit/leave.service.cjs.test.mjs
 */
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const req = createRequire(import.meta.url);

// ── Build mock stubs (FIFO queue) ─────────────────────────────────────────────
function makeMockFn() {
  const calls = [];
  const queue = [];           // once-impls consumed in order (FIFO)
  let defaultImpl = async () => [];
  const fn = (...args) => {
    calls.push(args);
    const impl = queue.length ? queue.shift() : defaultImpl;
    return impl(...args);
  };
  fn.mockImplementationOnce = (next) => { queue.push(next); };
  fn.mockImplementation   = (f)    => { defaultImpl = f; };
  fn.callCount = () => calls.length;
  fn.getCall   = (i) => calls[i];
  fn.reset = () => { calls.length = 0; queue.length = 0; defaultImpl = async () => []; };
  return fn;
}

const mockQuery    = makeMockFn();
const mockQueryOne = makeMockFn();
const mockInsert   = makeMockFn();
const mockExecute  = makeMockFn();

// ── Inject mocks into the compiled CJS database module ───────────────────────
const dbPath = path.resolve(__dirname, '../../src/config/database.js');
// Pre-register a stub so Node caches our version before the service requires it
req.cache[req.resolve(dbPath)] = {
  id: dbPath, filename: dbPath, loaded: true, exports: {
    query: mockQuery, queryOne: mockQueryOne,
    insert: mockInsert, execute: mockExecute, transaction: async (fn) => fn({}),
  },
  children: [], parent: null, paths: [],
};

// ── Now require the service (it will use our stubbed DB module) ──────────────
const svcPath = path.resolve(__dirname, '../../src/modules/leave/leave.service.js');
const errPath = path.resolve(__dirname, '../../src/common/errors/index.js');

const { LeaveService } = req(svcPath);
const { NotFoundError, ConflictError, BusinessRuleError } = req(errPath);

// ── Fixtures ──────────────────────────────────────────────────────────────────
const TENANT  = 'tenant-1';
const COMPANY = 'company-1';
const EMP_ID  = 'emp-1';
const LT_ID   = 'lt-1';
const APP_ID  = 'app-1';
const BAL_ID  = 'bal-1';
const HOL_ID  = 'hol-1';
const POL_ID  = 'pol-1';
const YEAR    = new Date().getFullYear();

const leaveType   = { id: LT_ID, leaveName: 'Annual Leave', leaveCode: 'AL', isPaid: true, status: 'Active' };
const leavePolicy = { id: POL_ID, leave_type_id: LT_ID, annual_quota: 20, status: 'Active' };
const application = { id: APP_ID, tenantId: TENANT, employeeId: EMP_ID, leaveTypeId: LT_ID, fromDate: '2026-07-01', toDate: '2026-07-03', totalDays: 3, status: 'Pending' };
const balance     = { id: BAL_ID, employeeId: EMP_ID, leaveTypeId: LT_ID, year: YEAR, currentBalance: 10 };
const holiday     = { id: HOL_ID, holidayName: 'New Year', holidayDate: '2026-01-01', year: 2026 };

function clearMocks() {
  mockQuery.reset();
  mockQueryOne.reset();
  mockInsert.reset();
  mockExecute.reset();
  mockQuery.mockImplementation(async () => []);
}

// ═════════════════════════════════════════════════════════════════════════════
describe('LeaveService', () => {
  let svc;
  beforeEach(() => { svc = new LeaveService(); clearMocks(); });

  // ── Leave Types ─────────────────────────────────────────────────────────────
  describe('listLeaveTypes', () => {
    it('returns active leave types for a company', async () => {
      mockQuery.mockImplementationOnce(async () => [leaveType]);
      const result = await svc.listLeaveTypes(TENANT, COMPANY);
      assert.deepEqual(result, [leaveType]);
      assert.ok(mockQuery.getCall(0)[0].includes('leave_types'));
    });

    it('returns empty array when none exist', async () => {
      mockQuery.mockImplementationOnce(async () => []);
      assert.deepEqual(await svc.listLeaveTypes(TENANT, COMPANY), []);
    });
  });

  describe('createLeaveType', () => {
    const input = { companyId: COMPANY, leaveName: 'Annual Leave', leaveCode: 'AL', isPaid: true, requiresApproval: true, minDurationDays: 0.5, allowEncashment: false };

    it('creates a leave type and returns it', async () => {
      mockQueryOne.mockImplementationOnce(async () => null);
      mockInsert.mockImplementationOnce(async () => LT_ID);
      mockQueryOne.mockImplementationOnce(async () => leaveType);
      const result = await svc.createLeaveType(TENANT, input);
      assert.equal(result.id, LT_ID);
    });

    it('throws ConflictError when code already exists', async () => {
      mockQueryOne.mockImplementationOnce(async () => ({ id: 'x' }));
      await assert.rejects(() => svc.createLeaveType(TENANT, input), ConflictError);
    });
  });

  describe('updateLeaveType', () => {
    const input = { leaveName: 'Updated', isPaid: false, requiresApproval: true, minDurationDays: 1, allowEncashment: false, status: 'Active' };

    it('updates and returns updated leave type', async () => {
      mockQueryOne.mockImplementationOnce(async () => ({ id: LT_ID }));
      mockQueryOne.mockImplementationOnce(async () => ({ ...leaveType, ...input }));
      const result = await svc.updateLeaveType(LT_ID, TENANT, input);
      assert.equal(result.leaveName, 'Updated');
    });

    it('throws NotFoundError when type does not exist', async () => {
      mockQueryOne.mockImplementationOnce(async () => null);
      await assert.rejects(() => svc.updateLeaveType('bad', TENANT, input), NotFoundError);
    });
  });

  describe('deleteLeaveType', () => {
    it('soft-deletes by setting status Inactive', async () => {
      mockQueryOne.mockImplementationOnce(async () => ({ id: LT_ID }));
      const result = await svc.deleteLeaveType(LT_ID, TENANT);
      assert.match(result.message, /deactivated/i);
      // SQL is parameterised — 'Inactive' is in the params, not the query string
      assert.ok(mockQuery.getCall(0)[1].includes('Inactive'));
    });

    it('throws NotFoundError for unknown id', async () => {
      mockQueryOne.mockImplementationOnce(async () => null);
      await assert.rejects(() => svc.deleteLeaveType('bad', TENANT), NotFoundError);
    });
  });

  // ── Leave Policies ──────────────────────────────────────────────────────────
  describe('createLeavePolicy', () => {
    const input = { companyId: COMPANY, leaveTypeId: LT_ID, annualQuota: 20, accrualFrequency: 'Monthly', sandwichRule: false, minServiceDays: 0 };

    it('creates policy and returns it', async () => {
      mockQueryOne.mockImplementationOnce(async () => null);
      mockInsert.mockImplementationOnce(async () => POL_ID);
      mockQueryOne.mockImplementationOnce(async () => leavePolicy);
      const result = await svc.createLeavePolicy(TENANT, input);
      assert.equal(result.id, POL_ID);
    });

    it('throws ConflictError when active policy exists', async () => {
      mockQueryOne.mockImplementationOnce(async () => ({ id: POL_ID }));
      await assert.rejects(() => svc.createLeavePolicy(TENANT, input), ConflictError);
    });
  });

  // ── Leave Applications ──────────────────────────────────────────────────────
  describe('apply', () => {
    const input = { leaveTypeId: LT_ID, fromDate: '2026-07-01', toDate: '2026-07-03', reason: 'Vacation' };

    it('creates application and deducts balance', async () => {
      mockQueryOne.mockImplementationOnce(async () => null);
      mockQueryOne.mockImplementationOnce(async () => balance);
      mockInsert.mockImplementationOnce(async () => APP_ID);
      const result = await svc.apply(TENANT, EMP_ID, input);
      assert.equal(result.applicationId, APP_ID);
      assert.equal(result.totalDays, 3);
    });

    it('throws BusinessRuleError on overlapping leave', async () => {
      mockQueryOne.mockImplementationOnce(async () => ({ id: 'x' }));
      await assert.rejects(() => svc.apply(TENANT, EMP_ID, input), BusinessRuleError);
    });

    it('throws BusinessRuleError when balance insufficient', async () => {
      mockQueryOne.mockImplementationOnce(async () => null);
      mockQueryOne.mockImplementationOnce(async () => ({ ...balance, currentBalance: 1 }));
      await assert.rejects(() => svc.apply(TENANT, EMP_ID, input), BusinessRuleError);
    });

    it('applies leave with no balance record (no quota enforcement)', async () => {
      mockQueryOne.mockImplementationOnce(async () => null);
      mockQueryOne.mockImplementationOnce(async () => null);
      mockInsert.mockImplementationOnce(async () => APP_ID);
      const result = await svc.apply(TENANT, EMP_ID, input);
      assert.equal(result.applicationId, APP_ID);
      assert.equal(mockQuery.callCount(), 0);
    });

    it('calculates totalDays = 1 for single-day leave', async () => {
      mockQueryOne.mockImplementationOnce(async () => null);
      mockQueryOne.mockImplementationOnce(async () => balance);
      mockInsert.mockImplementationOnce(async () => APP_ID);
      const result = await svc.apply(TENANT, EMP_ID, { ...input, toDate: '2026-07-01' });
      assert.equal(result.totalDays, 1);
    });
  });

  describe('approve', () => {
    it('approves pending application and updates balance', async () => {
      mockQueryOne.mockImplementationOnce(async () => application);
      mockQueryOne.mockImplementationOnce(async () => ({ id: BAL_ID }));
      const result = await svc.approve(APP_ID, TENANT, 'approver');
      assert.match(result.message, /approved/i);
    });

    it('throws NotFoundError for missing application', async () => {
      mockQueryOne.mockImplementationOnce(async () => null);
      await assert.rejects(() => svc.approve('bad', TENANT, 'approver'), NotFoundError);
    });

    it('throws BusinessRuleError when not Pending', async () => {
      mockQueryOne.mockImplementationOnce(async () => ({ ...application, status: 'Approved' }));
      await assert.rejects(() => svc.approve(APP_ID, TENANT, 'approver'), BusinessRuleError);
    });
  });

  describe('reject', () => {
    it('rejects pending application and restores balance', async () => {
      mockQueryOne.mockImplementationOnce(async () => application);
      mockQueryOne.mockImplementationOnce(async () => ({ id: BAL_ID }));
      const result = await svc.reject(APP_ID, TENANT, 'approver', 'No cover');
      assert.match(result.message, /rejected/i);
    });

    it('throws NotFoundError for missing application', async () => {
      mockQueryOne.mock?.resetCalls?.();
      mockQueryOne.mockImplementationOnce(async () => null);
      await assert.rejects(() => svc.reject('bad', TENANT, 'approver'), NotFoundError);
    });

    it('throws BusinessRuleError when not Pending', async () => {
      mockQueryOne.mockImplementationOnce(async () => ({ ...application, status: 'Rejected' }));
      await assert.rejects(() => svc.reject(APP_ID, TENANT, 'approver'), BusinessRuleError);
    });
  });

  describe('cancel', () => {
    it('cancels a Pending application and restores balance', async () => {
      mockQueryOne.mockImplementationOnce(async () => application);
      mockQueryOne.mockImplementationOnce(async () => ({ id: BAL_ID }));
      const result = await svc.cancel(APP_ID, TENANT, EMP_ID);
      assert.match(result.message, /cancelled/i);
    });

    it('cancels an Approved application and rolls back used_ytd', async () => {
      mockQueryOne.mockImplementationOnce(async () => ({ ...application, status: 'Approved' }));
      mockQueryOne.mockImplementationOnce(async () => ({ id: BAL_ID }));
      const result = await svc.cancel(APP_ID, TENANT, EMP_ID);
      assert.match(result.message, /cancelled/i);
      const calls = Array.from({ length: mockQuery.callCount() }, (_, i) => mockQuery.getCall(i));
      assert.ok(calls.some(c => c[0].includes('used_ytd')), 'expected used_ytd rollback');
    });

    it('throws BusinessRuleError for already-Cancelled leave', async () => {
      mockQueryOne.mockImplementationOnce(async () => ({ ...application, status: 'Cancelled' }));
      await assert.rejects(() => svc.cancel(APP_ID, TENANT, EMP_ID), BusinessRuleError);
    });

    it('throws BusinessRuleError for Rejected leave', async () => {
      mockQueryOne.mockImplementationOnce(async () => ({ ...application, status: 'Rejected' }));
      await assert.rejects(() => svc.cancel(APP_ID, TENANT, EMP_ID), BusinessRuleError);
    });

    it('throws NotFoundError when application not found', async () => {
      mockQueryOne.mockImplementationOnce(async () => null);
      await assert.rejects(() => svc.cancel('bad', TENANT, EMP_ID), NotFoundError);
    });
  });

  describe('listApplications', () => {
    it('returns paginated list with meta', async () => {
      mockQuery.mockImplementationOnce(async () => [application]);
      mockQuery.mockImplementationOnce(async () => [{ total: 1 }]);
      const result = await svc.listApplications(TENANT, { page: 1, limit: 20 });
      assert.deepEqual(result.data, [application]);
      assert.equal(result.meta.total, 1);
      assert.equal(result.meta.hasNext, false);
    });

    it('filters by status when provided', async () => {
      mockQuery.mockImplementationOnce(async () => []);
      mockQuery.mockImplementationOnce(async () => [{ total: 0 }]);
      await svc.listApplications(TENANT, { status: 'Approved', page: 1, limit: 20 });
      // status filter is embedded in the WHERE clause
      const sql = mockQuery.getCall(0)[0];
      assert.ok(sql.includes('la.status = ?'), `Expected SQL to include 'la.status = ?': ${sql}`);
    });

    it('hasPrev is true on page 2', async () => {
      mockQuery.mockImplementationOnce(async () => []);
      mockQuery.mockImplementationOnce(async () => [{ total: 30 }]);
      const result = await svc.listApplications(TENANT, { page: 2, limit: 20 });
      assert.equal(result.meta.hasPrev, true);
    });
  });

  describe('getApplication', () => {
    it('returns the application', async () => {
      mockQueryOne.mockImplementationOnce(async () => application);
      assert.deepEqual(await svc.getApplication(APP_ID, TENANT), application);
    });

    it('throws NotFoundError for unknown id', async () => {
      mockQueryOne.mockImplementationOnce(async () => null);
      await assert.rejects(() => svc.getApplication('bad', TENANT), NotFoundError);
    });
  });

  // ── Balances ─────────────────────────────────────────────────────────────────
  describe('getBalance', () => {
    it('returns balance for employee in current year', async () => {
      mockQuery.mockImplementationOnce(async () => [balance]);
      const result = await svc.getBalance(TENANT, EMP_ID);
      assert.equal(result[0].id, BAL_ID);
      assert.deepEqual(mockQuery.getCall(0)[1], [EMP_ID, YEAR]);
    });

    it('uses provided year', async () => {
      mockQuery.mockImplementationOnce(async () => []);
      await svc.getBalance(TENANT, EMP_ID, 2025);
      assert.deepEqual(mockQuery.getCall(0)[1], [EMP_ID, 2025]);
    });
  });

  describe('initBalances', () => {
    it('creates balance records for each employee × policy', async () => {
      mockQuery.mockImplementationOnce(async () => [{ id: EMP_ID }]);
      mockQuery.mockImplementationOnce(async () => [leavePolicy]);
      mockQueryOne.mockImplementationOnce(async () => null);
      mockInsert.mockImplementationOnce(async () => BAL_ID);
      const result = await svc.initBalances(TENANT, COMPANY, YEAR);
      assert.match(result.message, /1/);
    });

    it('skips already-existing balance records', async () => {
      mockQuery.mockImplementationOnce(async () => [{ id: EMP_ID }]);
      mockQuery.mockImplementationOnce(async () => [leavePolicy]);
      mockQueryOne.mockImplementationOnce(async () => ({ id: BAL_ID }));
      const result = await svc.initBalances(TENANT, COMPANY, YEAR);
      assert.match(result.message, /0/);
      assert.equal(mockInsert.callCount(), 0);
    });
  });

  describe('updateBalance', () => {
    it('updates balance record', async () => {
      mockQueryOne.mockImplementationOnce(async () => ({ id: BAL_ID }));
      mockQueryOne.mockImplementationOnce(async () => ({ ...balance, currentBalance: 15 }));
      const result = await svc.updateBalance(BAL_ID, TENANT, { openingBalance: 15, currentBalance: 15 });
      assert.equal(result.currentBalance, 15);
    });

    it('throws NotFoundError when balance not found', async () => {
      mockQueryOne.mockImplementationOnce(async () => null);
      await assert.rejects(() => svc.updateBalance('bad', TENANT, {}), NotFoundError);
    });
  });

  // ── Holidays ──────────────────────────────────────────────────────────────────
  describe('listHolidays', () => {
    it('returns holidays for company and year', async () => {
      mockQuery.mockImplementationOnce(async () => [holiday]);
      const result = await svc.listHolidays(TENANT, COMPANY, 2026);
      assert.equal(result[0].id, HOL_ID);
      assert.deepEqual(mockQuery.getCall(0)[1], [COMPANY, 2026]);
    });
  });

  describe('createHoliday', () => {
    const input = { companyId: COMPANY, holidayName: 'New Year', holidayDate: '2026-01-01', holidayType: 'National', isOptional: false };

    it('creates holiday and returns it', async () => {
      mockQueryOne.mockImplementationOnce(async () => null);
      mockInsert.mockImplementationOnce(async () => HOL_ID);
      mockQueryOne.mockImplementationOnce(async () => holiday);
      assert.deepEqual(await svc.createHoliday(TENANT, input), holiday);
    });

    it('throws ConflictError when date is taken', async () => {
      mockQueryOne.mockImplementationOnce(async () => ({ id: HOL_ID }));
      await assert.rejects(() => svc.createHoliday(TENANT, input), ConflictError);
    });

    it('infers year from holidayDate', async () => {
      mockQueryOne.mockImplementationOnce(async () => null);
      mockInsert.mockImplementationOnce(async () => HOL_ID);
      mockQueryOne.mockImplementationOnce(async () => holiday);
      await svc.createHoliday(TENANT, { ...input, holidayDate: '2027-12-25' });
      assert.ok(mockInsert.getCall(0)[1].includes(2027));
    });
  });

  describe('updateHoliday', () => {
    const input = { holidayName: 'Updated', holidayType: 'Regional', isOptional: true };

    it('updates and returns updated holiday', async () => {
      mockQueryOne.mockImplementationOnce(async () => ({ id: HOL_ID }));
      mockQueryOne.mockImplementationOnce(async () => ({ ...holiday, ...input }));
      const result = await svc.updateHoliday(HOL_ID, TENANT, input);
      assert.equal(result.holidayName, 'Updated');
    });

    it('throws NotFoundError for unknown holiday', async () => {
      mockQueryOne.mockImplementationOnce(async () => null);
      await assert.rejects(() => svc.updateHoliday('bad', TENANT, input), NotFoundError);
    });
  });

  describe('deleteHoliday', () => {
    it('hard-deletes holiday', async () => {
      mockQueryOne.mockImplementationOnce(async () => ({ id: HOL_ID }));
      const result = await svc.deleteHoliday(HOL_ID, TENANT);
      assert.match(result.message, /deleted/i);
      assert.ok(mockQuery.getCall(0)[0].startsWith('DELETE FROM holidays'));
    });

    it('throws NotFoundError for unknown id', async () => {
      mockQueryOne.mockImplementationOnce(async () => null);
      await assert.rejects(() => svc.deleteHoliday('bad', TENANT), NotFoundError);
    });
  });

  // ── Calendar ──────────────────────────────────────────────────────────────────
  describe('getCalendar', () => {
    it('returns applications and holidays for month/year', async () => {
      mockQuery.mockImplementationOnce(async () => [application]);
      mockQuery.mockImplementationOnce(async () => [holiday]);
      const result = await svc.getCalendar(TENANT, EMP_ID, 7, 2026);
      assert.equal(result.applications.length, 1);
      assert.equal(result.holidays.length, 1);
    });

    it('builds correct end date for Feb 2026 (28 days)', async () => {
      await svc.getCalendar(TENANT, EMP_ID, 2, 2026);
      const args = mockQuery.getCall(1)[1];
      assert.ok(args.includes('2026-02-28'), `expected 2026-02-28, got ${JSON.stringify(args)}`);
    });
  });
});
