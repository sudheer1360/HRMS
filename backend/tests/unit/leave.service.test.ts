import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LeaveService } from '../../src/modules/leave/leave.service.js';
import { NotFoundError, ConflictError, BusinessRuleError } from '../../src/common/errors/index.js';

// ── Mock DB helpers ────────────────────────────────────────────────────────────
vi.mock('../../src/config/database.js', () => ({
  query: vi.fn(),
  queryOne: vi.fn(),
  insert: vi.fn(),
  execute: vi.fn(),
}));

import * as db from '../../src/config/database.js';
const mockQuery   = vi.mocked(db.query);
const mockQueryOne = vi.mocked(db.queryOne);
const mockInsert  = vi.mocked(db.insert);

// ── Fixtures ───────────────────────────────────────────────────────────────────
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
const leavePolicy = { id: POL_ID, leaveTypeId: LT_ID, annualQuota: 20 };
const application = {
  id: APP_ID, tenantId: TENANT, employeeId: EMP_ID,
  leaveTypeId: LT_ID, fromDate: '2026-07-01', toDate: '2026-07-03',
  totalDays: 3, status: 'Pending',
};
const balance = { id: BAL_ID, employeeId: EMP_ID, leaveTypeId: LT_ID, year: YEAR, currentBalance: 10 };
const holiday = { id: HOL_ID, holidayName: 'New Year', holidayDate: '2026-01-01', year: 2026 };

// ── Helper to reset mocks ──────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
});

// ═══════════════════════════════════════════════════════════════════════════════
describe('LeaveService', () => {
  let svc: LeaveService;
  beforeEach(() => { svc = new LeaveService(); });

  // ── Leave Types ──────────────────────────────────────────────────────────────
  describe('listLeaveTypes', () => {
    it('returns active leave types for a company', async () => {
      mockQuery.mockResolvedValueOnce([leaveType] as any);
      const result = await svc.listLeaveTypes(TENANT, COMPANY);
      expect(result).toEqual([leaveType]);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('leave_types'),
        [COMPANY, 'Active'],
      );
    });

    it('returns empty array when no leave types exist', async () => {
      mockQuery.mockResolvedValueOnce([] as any);
      const result = await svc.listLeaveTypes(TENANT, COMPANY);
      expect(result).toEqual([]);
    });
  });

  describe('createLeaveType', () => {
    const input = { companyId: COMPANY, leaveName: 'Annual Leave', leaveCode: 'AL', isPaid: true, requiresApproval: true, minDurationDays: 0.5, allowEncashment: false };

    it('creates a leave type and returns it', async () => {
      mockQueryOne
        .mockResolvedValueOnce(null)       // no duplicate check
        .mockResolvedValueOnce(leaveType as any); // SELECT after insert
      mockInsert.mockResolvedValueOnce(LT_ID);

      const result = await svc.createLeaveType(TENANT, input);
      expect(result).toEqual(leaveType);
      expect(mockInsert).toHaveBeenCalledOnce();
    });

    it('throws ConflictError when leave code already exists', async () => {
      mockQueryOne.mockResolvedValueOnce({ id: 'existing' } as any);
      await expect(svc.createLeaveType(TENANT, input)).rejects.toThrow(ConflictError);
    });
  });

  describe('updateLeaveType', () => {
    const input = { leaveName: 'Updated Leave', isPaid: false, requiresApproval: true, minDurationDays: 1, allowEncashment: false, status: 'Active' };

    it('updates leave type and returns updated record', async () => {
      mockQueryOne
        .mockResolvedValueOnce({ id: LT_ID } as any)   // existence check
        .mockResolvedValueOnce({ ...leaveType, ...input } as any); // after update
      mockQuery.mockResolvedValueOnce([] as any);

      const result = await svc.updateLeaveType(LT_ID, TENANT, input);
      expect((result as any).leaveName).toBe('Updated Leave');
    });

    it('throws NotFoundError when leave type does not exist', async () => {
      mockQueryOne.mockResolvedValueOnce(null);
      await expect(svc.updateLeaveType('nonexistent', TENANT, input)).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteLeaveType', () => {
    it('soft-deletes by setting status to Inactive', async () => {
      mockQueryOne.mockResolvedValueOnce({ id: LT_ID } as any);
      mockQuery.mockResolvedValueOnce([] as any);

      const result = await svc.deleteLeaveType(LT_ID, TENANT);
      expect((result as any).message).toMatch(/deactivated/i);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('Inactive'),
        [LT_ID],
      );
    });

    it('throws NotFoundError for unknown id', async () => {
      mockQueryOne.mockResolvedValueOnce(null);
      await expect(svc.deleteLeaveType('bad-id', TENANT)).rejects.toThrow(NotFoundError);
    });
  });

  // ── Leave Policies ───────────────────────────────────────────────────────────
  describe('createLeavePolicy', () => {
    const input = { companyId: COMPANY, leaveTypeId: LT_ID, annualQuota: 20, accrualFrequency: 'Monthly', sandwichRule: false, minServiceDays: 0 };

    it('creates policy and returns it', async () => {
      mockQueryOne
        .mockResolvedValueOnce(null)               // no duplicate
        .mockResolvedValueOnce(leavePolicy as any); // after insert
      mockInsert.mockResolvedValueOnce(POL_ID);

      const result = await svc.createLeavePolicy(TENANT, input);
      expect(result).toEqual(leavePolicy);
    });

    it('throws ConflictError when active policy exists for leave type', async () => {
      mockQueryOne.mockResolvedValueOnce({ id: POL_ID } as any);
      await expect(svc.createLeavePolicy(TENANT, input)).rejects.toThrow(ConflictError);
    });
  });

  // ── Leave Applications ───────────────────────────────────────────────────────
  describe('apply', () => {
    const input = { leaveTypeId: LT_ID, fromDate: '2026-07-01', toDate: '2026-07-03', reason: 'Vacation' };

    it('creates leave application and deducts balance', async () => {
      mockQueryOne
        .mockResolvedValueOnce(null)                   // no overlap
        .mockResolvedValueOnce(balance as any);        // balance fetch
      mockInsert.mockResolvedValueOnce(APP_ID);
      mockQuery.mockResolvedValueOnce([] as any);      // balance update

      const result = await svc.apply(TENANT, EMP_ID, input) as any;
      expect(result.applicationId).toBe(APP_ID);
      expect(result.totalDays).toBe(3);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('pending_ytd'),
        expect.arrayContaining([3, 3, BAL_ID]),
      );
    });

    it('throws BusinessRuleError on overlapping leave', async () => {
      mockQueryOne.mockResolvedValueOnce({ id: 'existing-app' } as any);
      await expect(svc.apply(TENANT, EMP_ID, input)).rejects.toThrow(BusinessRuleError);
    });

    it('throws BusinessRuleError when balance is insufficient', async () => {
      mockQueryOne
        .mockResolvedValueOnce(null) // no overlap
        .mockResolvedValueOnce({ ...balance, currentBalance: 1 } as any); // insufficient
      await expect(svc.apply(TENANT, EMP_ID, input)).rejects.toThrow(BusinessRuleError);
    });

    it('applies leave even when no balance record exists (no quota check)', async () => {
      mockQueryOne
        .mockResolvedValueOnce(null) // no overlap
        .mockResolvedValueOnce(null); // no balance record
      mockInsert.mockResolvedValueOnce(APP_ID);

      const result = await svc.apply(TENANT, EMP_ID, input) as any;
      expect(result.applicationId).toBe(APP_ID);
      // balance update should NOT be called
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it('calculates totalDays correctly for single-day leave', async () => {
      const singleDay = { ...input, fromDate: '2026-07-01', toDate: '2026-07-01' };
      mockQueryOne.mockResolvedValueOnce(null).mockResolvedValueOnce(balance as any);
      mockInsert.mockResolvedValueOnce(APP_ID);
      mockQuery.mockResolvedValueOnce([] as any);

      const result = await svc.apply(TENANT, EMP_ID, singleDay) as any;
      expect(result.totalDays).toBe(1);
    });
  });

  describe('approve', () => {
    it('approves a pending application and moves balance to used_ytd', async () => {
      mockQueryOne
        .mockResolvedValueOnce(application as any) // fetch app
        .mockResolvedValueOnce({ id: BAL_ID } as any); // fetch balance
      mockQuery.mockResolvedValue([] as any);

      const result = await svc.approve(APP_ID, TENANT, 'approver-1') as any;
      expect(result.message).toMatch(/approved/i);
      // two query calls: update app status + update balance
      expect(mockQuery).toHaveBeenCalledTimes(2);
    });

    it('throws NotFoundError when application does not exist', async () => {
      mockQueryOne.mockResolvedValueOnce(null);
      await expect(svc.approve('bad', TENANT, 'approver')).rejects.toThrow(NotFoundError);
    });

    it('throws BusinessRuleError when application is not Pending', async () => {
      mockQueryOne.mockResolvedValueOnce({ ...application, status: 'Approved' } as any);
      await expect(svc.approve(APP_ID, TENANT, 'approver')).rejects.toThrow(BusinessRuleError);
    });
  });

  describe('reject', () => {
    it('rejects a pending application and restores balance', async () => {
      mockQueryOne
        .mockResolvedValueOnce(application as any)
        .mockResolvedValueOnce({ id: BAL_ID } as any);
      mockQuery.mockResolvedValue([] as any);

      const result = await svc.reject(APP_ID, TENANT, 'approver-1', 'No cover') as any;
      expect(result.message).toMatch(/rejected/i);
      expect(mockQuery).toHaveBeenCalledTimes(2);
    });

    it('throws NotFoundError for missing application', async () => {
      mockQueryOne.mockResolvedValueOnce(null);
      await expect(svc.reject('bad', TENANT, 'approver')).rejects.toThrow(NotFoundError);
    });

    it('throws BusinessRuleError when already rejected', async () => {
      mockQueryOne.mockResolvedValueOnce({ ...application, status: 'Rejected' } as any);
      await expect(svc.reject(APP_ID, TENANT, 'approver')).rejects.toThrow(BusinessRuleError);
    });
  });

  describe('cancel', () => {
    it('cancels a Pending application and restores balance', async () => {
      mockQueryOne
        .mockResolvedValueOnce(application as any)    // fetch app (status: Pending)
        .mockResolvedValueOnce({ id: BAL_ID } as any); // balance
      mockQuery.mockResolvedValue([] as any);

      const result = await svc.cancel(APP_ID, TENANT, EMP_ID) as any;
      expect(result.message).toMatch(/cancelled/i);
    });

    it('cancels an Approved application and adjusts used_ytd', async () => {
      mockQueryOne
        .mockResolvedValueOnce({ ...application, status: 'Approved' } as any)
        .mockResolvedValueOnce({ id: BAL_ID } as any);
      mockQuery.mockResolvedValue([] as any);

      const result = await svc.cancel(APP_ID, TENANT, EMP_ID) as any;
      expect(result.message).toMatch(/cancelled/i);
      // balance updated with used_ytd rollback
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('used_ytd'),
        expect.any(Array),
      );
    });

    it('throws BusinessRuleError when cancelling already-Cancelled leave', async () => {
      mockQueryOne.mockResolvedValueOnce({ ...application, status: 'Cancelled' } as any);
      await expect(svc.cancel(APP_ID, TENANT, EMP_ID)).rejects.toThrow(BusinessRuleError);
    });

    it('throws BusinessRuleError when cancelling Rejected leave', async () => {
      mockQueryOne.mockResolvedValueOnce({ ...application, status: 'Rejected' } as any);
      await expect(svc.cancel(APP_ID, TENANT, EMP_ID)).rejects.toThrow(BusinessRuleError);
    });

    it('throws NotFoundError when application does not exist', async () => {
      mockQueryOne.mockResolvedValueOnce(null);
      await expect(svc.cancel('bad', TENANT, EMP_ID)).rejects.toThrow(NotFoundError);
    });
  });

  describe('listApplications', () => {
    it('returns paginated list with meta', async () => {
      const rows = [application];
      mockQuery
        .mockResolvedValueOnce(rows as any)
        .mockResolvedValueOnce([{ total: 1 }] as any);

      const result = await svc.listApplications(TENANT, { page: 1, limit: 20 }) as any;
      expect(result.data).toEqual(rows);
      expect(result.meta.total).toBe(1);
      expect(result.meta.hasNext).toBe(false);
    });

    it('filters by status when provided', async () => {
      mockQuery
        .mockResolvedValueOnce([] as any)
        .mockResolvedValueOnce([{ total: 0 }] as any);

      await svc.listApplications(TENANT, { status: 'Approved', page: 1, limit: 20 });
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('la.status = ?'),
        expect.arrayContaining(['Approved']),
      );
    });

    it('filters by employeeId when provided', async () => {
      mockQuery
        .mockResolvedValueOnce([] as any)
        .mockResolvedValueOnce([{ total: 0 }] as any);

      await svc.listApplications(TENANT, { employeeId: EMP_ID, page: 1, limit: 20 });
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('la.employee_id = ?'),
        expect.arrayContaining([EMP_ID]),
      );
    });

    it('computes hasPrev correctly on page 2', async () => {
      mockQuery
        .mockResolvedValueOnce([] as any)
        .mockResolvedValueOnce([{ total: 30 }] as any);

      const result = await svc.listApplications(TENANT, { page: 2, limit: 20 }) as any;
      expect(result.meta.hasPrev).toBe(true);
    });
  });

  describe('getApplication', () => {
    it('returns the application with joined data', async () => {
      mockQueryOne.mockResolvedValueOnce(application as any);
      const result = await svc.getApplication(APP_ID, TENANT);
      expect(result).toEqual(application);
    });

    it('throws NotFoundError for unknown id', async () => {
      mockQueryOne.mockResolvedValueOnce(null);
      await expect(svc.getApplication('bad', TENANT)).rejects.toThrow(NotFoundError);
    });
  });

  // ── Leave Balances ───────────────────────────────────────────────────────────
  describe('getBalance', () => {
    it('returns balance records for an employee in current year', async () => {
      mockQuery.mockResolvedValueOnce([balance] as any);
      const result = await svc.getBalance(TENANT, EMP_ID) as any[];
      expect(result[0].id).toBe(BAL_ID);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        [EMP_ID, YEAR],
      );
    });

    it('uses provided year when given', async () => {
      mockQuery.mockResolvedValueOnce([] as any);
      await svc.getBalance(TENANT, EMP_ID, 2025);
      expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [EMP_ID, 2025]);
    });
  });

  describe('initBalances', () => {
    it('creates balance records for active employees × active policies', async () => {
      mockQuery
        .mockResolvedValueOnce([{ id: EMP_ID }] as any)       // employees
        .mockResolvedValueOnce([{ ...leavePolicy, leave_type_id: LT_ID, annual_quota: 20 }] as any); // policies
      mockQueryOne.mockResolvedValueOnce(null); // no existing balance
      mockInsert.mockResolvedValueOnce(BAL_ID);

      const result = await svc.initBalances(TENANT, COMPANY, YEAR) as any;
      expect(result.message).toContain('1');
    });

    it('skips employees that already have a balance', async () => {
      mockQuery
        .mockResolvedValueOnce([{ id: EMP_ID }] as any)
        .mockResolvedValueOnce([{ ...leavePolicy, leave_type_id: LT_ID, annual_quota: 20 }] as any);
      mockQueryOne.mockResolvedValueOnce({ id: BAL_ID } as any); // already exists

      const result = await svc.initBalances(TENANT, COMPANY, YEAR) as any;
      expect(result.message).toContain('0');
      expect(mockInsert).not.toHaveBeenCalled();
    });
  });

  describe('updateBalance', () => {
    it('updates opening and current balance', async () => {
      mockQueryOne
        .mockResolvedValueOnce({ id: BAL_ID } as any)
        .mockResolvedValueOnce({ ...balance, openingBalance: 15, currentBalance: 15 } as any);
      mockQuery.mockResolvedValueOnce([] as any);

      const result = await svc.updateBalance(BAL_ID, TENANT, { openingBalance: 15, currentBalance: 15 }) as any;
      expect(result.currentBalance).toBe(15);
    });

    it('throws NotFoundError when balance record not found', async () => {
      mockQueryOne.mockResolvedValueOnce(null);
      await expect(svc.updateBalance('bad', TENANT, {})).rejects.toThrow(NotFoundError);
    });
  });

  // ── Holidays ─────────────────────────────────────────────────────────────────
  describe('listHolidays', () => {
    it('returns holidays for a company and year', async () => {
      mockQuery.mockResolvedValueOnce([holiday] as any);
      const result = await svc.listHolidays(TENANT, COMPANY, 2026) as any[];
      expect(result[0].id).toBe(HOL_ID);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        [COMPANY, 2026],
      );
    });
  });

  describe('createHoliday', () => {
    const input = { companyId: COMPANY, holidayName: 'New Year', holidayDate: '2026-01-01', holidayType: 'National', isOptional: false };

    it('creates holiday and returns it', async () => {
      mockQueryOne
        .mockResolvedValueOnce(null)            // no duplicate
        .mockResolvedValueOnce(holiday as any); // after insert
      mockInsert.mockResolvedValueOnce(HOL_ID);

      const result = await svc.createHoliday(TENANT, input);
      expect(result).toEqual(holiday);
    });

    it('throws ConflictError when holiday date is taken', async () => {
      mockQueryOne.mockResolvedValueOnce({ id: HOL_ID } as any);
      await expect(svc.createHoliday(TENANT, input)).rejects.toThrow(ConflictError);
    });

    it('infers year from holidayDate automatically', async () => {
      mockQueryOne.mockResolvedValueOnce(null).mockResolvedValueOnce(holiday as any);
      mockInsert.mockResolvedValueOnce(HOL_ID);

      await svc.createHoliday(TENANT, { ...input, holidayDate: '2027-12-25' });
      expect(mockInsert).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([2027]),
      );
    });
  });

  describe('updateHoliday', () => {
    const input = { holidayName: 'Updated Holiday', holidayType: 'Regional', isOptional: true };

    it('updates holiday and returns updated record', async () => {
      mockQueryOne
        .mockResolvedValueOnce({ id: HOL_ID } as any)
        .mockResolvedValueOnce({ ...holiday, ...input } as any);
      mockQuery.mockResolvedValueOnce([] as any);

      const result = await svc.updateHoliday(HOL_ID, TENANT, input) as any;
      expect(result.holidayName).toBe('Updated Holiday');
    });

    it('throws NotFoundError for unknown holiday', async () => {
      mockQueryOne.mockResolvedValueOnce(null);
      await expect(svc.updateHoliday('bad', TENANT, input)).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteHoliday', () => {
    it('hard-deletes a holiday', async () => {
      mockQueryOne.mockResolvedValueOnce({ id: HOL_ID } as any);
      mockQuery.mockResolvedValueOnce([] as any);

      const result = await svc.deleteHoliday(HOL_ID, TENANT) as any;
      expect(result.message).toMatch(/deleted/i);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM holidays'),
        [HOL_ID],
      );
    });

    it('throws NotFoundError for unknown id', async () => {
      mockQueryOne.mockResolvedValueOnce(null);
      await expect(svc.deleteHoliday('bad', TENANT)).rejects.toThrow(NotFoundError);
    });
  });

  // ── Calendar ─────────────────────────────────────────────────────────────────
  describe('getCalendar', () => {
    it('returns applications and holidays for given month/year', async () => {
      mockQuery
        .mockResolvedValueOnce([application] as any)
        .mockResolvedValueOnce([holiday] as any);

      const result = await svc.getCalendar(TENANT, EMP_ID, 7, 2026) as any;
      expect(result.applications).toHaveLength(1);
      expect(result.holidays).toHaveLength(1);
    });

    it('builds correct date range for the month', async () => {
      mockQuery.mockResolvedValue([] as any);

      await svc.getCalendar(TENANT, EMP_ID, 2, 2026);
      // Feb 2026 should end on the 28th
      const secondCall = mockQuery.mock.calls[1];
      expect(secondCall[1]).toContain('2026-02-28');
    });
  });
});
