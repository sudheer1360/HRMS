"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaveService = exports.LeaveService = void 0;
const database_js_1 = require("../../config/database.js");
const index_js_1 = require("../../common/errors/index.js");
class LeaveService {
    // ── Leave Types ────────────────────────────────────────────────────────────
    async listLeaveTypes(tenantId, companyId) {
        return (0, database_js_1.query)('SELECT * FROM leave_types WHERE company_id = ? AND status = ? ORDER BY leave_name', [companyId, 'Active']);
    }
    async createLeaveType(tenantId, input) {
        const exists = await (0, database_js_1.queryOne)('SELECT id FROM leave_types WHERE company_id = ? AND leave_code = ?', [input.companyId, input.leaveCode]);
        if (exists)
            throw new index_js_1.ConflictError('Leave type code already exists');
        const id = await (0, database_js_1.insert)('INSERT INTO leave_types (id, tenant_id, company_id, leave_name, leave_code, description, is_paid, requires_approval, min_duration_days, allow_encashment) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?)', [tenantId, input.companyId, input.leaveName, input.leaveCode, input.description, input.isPaid !== false, input.requiresApproval !== false, input.minDurationDays || 0.5, input.allowEncashment || false]);
        return (0, database_js_1.queryOne)('SELECT * FROM leave_types WHERE id = ?', [id]);
    }
    async updateLeaveType(id, tenantId, input) {
        const lt = await (0, database_js_1.queryOne)('SELECT id FROM leave_types WHERE id = ? AND tenant_id = ?', [id, tenantId]);
        if (!lt)
            throw new index_js_1.NotFoundError('Leave type', id);
        await (0, database_js_1.query)('UPDATE leave_types SET leave_name = ?, description = ?, is_paid = ?, requires_approval = ?, min_duration_days = ?, allow_encashment = ?, status = ?, updated_at = NOW() WHERE id = ?', [input.leaveName, input.description, input.isPaid, input.requiresApproval, input.minDurationDays, input.allowEncashment, input.status || 'Active', id]);
        return (0, database_js_1.queryOne)('SELECT * FROM leave_types WHERE id = ?', [id]);
    }
    async deleteLeaveType(id, tenantId) {
        const lt = await (0, database_js_1.queryOne)('SELECT id FROM leave_types WHERE id = ?', [id]);
        if (!lt)
            throw new index_js_1.NotFoundError('Leave type', id);
        await (0, database_js_1.query)('UPDATE leave_types SET status = ? WHERE id = ?', ['Inactive', id]);
        return { message: 'Leave type deactivated' };
    }
    // ── Leave Policies ─────────────────────────────────────────────────────────
    async createLeavePolicy(tenantId, input) {
        const exists = await (0, database_js_1.queryOne)('SELECT id FROM leave_policies WHERE company_id = ? AND leave_type_id = ? AND status = ?', [input.companyId, input.leaveTypeId, 'Active']);
        if (exists)
            throw new index_js_1.ConflictError('Policy already exists for this leave type');
        const id = await (0, database_js_1.insert)('INSERT INTO leave_policies (id, tenant_id, company_id, leave_type_id, annual_quota, accrual_frequency, carry_forward_limit, sandwich_rule, min_service_days) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?)', [tenantId, input.companyId, input.leaveTypeId, input.annualQuota, input.accrualFrequency || 'Monthly', input.carryForwardLimit, input.sandwichRule || false, input.minServiceDays || 0]);
        return (0, database_js_1.queryOne)('SELECT * FROM leave_policies WHERE id = ?', [id]);
    }
    // ── Leave Applications ─────────────────────────────────────────────────────
    async apply(tenantId, employeeId, input) {
        const overlap = await (0, database_js_1.queryOne)('SELECT id FROM leave_applications WHERE employee_id = ? AND status NOT IN (?,?) AND from_date <= ? AND to_date >= ?', [employeeId, 'Rejected', 'Cancelled', input.toDate, input.fromDate]);
        if (overlap)
            throw new index_js_1.BusinessRuleError('Leave already applied for overlapping dates', 'LEAVE_OVERLAP');
        const from = new Date(input.fromDate);
        const to = new Date(input.toDate);
        const days = Math.ceil((to.getTime() - from.getTime()) / 86400000) + 1;
        const balance = await (0, database_js_1.queryOne)('SELECT * FROM leave_balances WHERE employee_id = ? AND leave_type_id = ? AND year = ?', [employeeId, input.leaveTypeId, new Date().getFullYear()]);
        if (balance && Number(balance.currentBalance) < days) {
            throw new index_js_1.BusinessRuleError(`Insufficient leave balance. Available: ${balance.currentBalance}`, 'LEAVE_INSUFFICIENT_BALANCE');
        }
        const id = await (0, database_js_1.insert)('INSERT INTO leave_applications (id, tenant_id, employee_id, leave_type_id, from_date, to_date, total_days, reason, contact_during_leave, status) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?)', [tenantId, employeeId, input.leaveTypeId, input.fromDate, input.toDate, days, input.reason, input.contactDuringLeave, 'Pending']);
        if (balance) {
            await (0, database_js_1.query)('UPDATE leave_balances SET pending_ytd = pending_ytd + ?, current_balance = current_balance - ?, updated_at = NOW() WHERE id = ?', [days, days, balance.id]);
        }
        return { message: 'Leave applied successfully', totalDays: days, applicationId: id };
    }
    async approve(id, tenantId, approverId) {
        const app = await (0, database_js_1.queryOne)('SELECT * FROM leave_applications WHERE id = ? AND tenant_id = ?', [id, tenantId]);
        if (!app)
            throw new index_js_1.NotFoundError('Leave application', id);
        if (app.status !== 'Pending')
            throw new index_js_1.BusinessRuleError(`Cannot approve leave in ${app.status} status`);
        await (0, database_js_1.query)('UPDATE leave_applications SET status = ?, approved_by = ?, approved_at = NOW(), updated_at = NOW() WHERE id = ?', ['Approved', approverId, id]);
        const balance = await (0, database_js_1.queryOne)('SELECT id FROM leave_balances WHERE employee_id = ? AND leave_type_id = ? AND year = ?', [app.employeeId, app.leaveTypeId, new Date().getFullYear()]);
        if (balance) {
            await (0, database_js_1.query)('UPDATE leave_balances SET pending_ytd = GREATEST(pending_ytd - ?, 0), used_ytd = used_ytd + ?, updated_at = NOW() WHERE id = ?', [Number(app.totalDays), Number(app.totalDays), balance.id]);
        }
        return { message: 'Leave approved', applicationId: id };
    }
    async reject(id, tenantId, approverId, reason) {
        const app = await (0, database_js_1.queryOne)('SELECT * FROM leave_applications WHERE id = ? AND tenant_id = ?', [id, tenantId]);
        if (!app)
            throw new index_js_1.NotFoundError('Leave application', id);
        if (app.status !== 'Pending')
            throw new index_js_1.BusinessRuleError(`Cannot reject leave in ${app.status} status`);
        await (0, database_js_1.query)('UPDATE leave_applications SET status = ?, approved_by = ?, rejected_reason = ?, updated_at = NOW() WHERE id = ?', ['Rejected', approverId, reason, id]);
        const balance = await (0, database_js_1.queryOne)('SELECT id FROM leave_balances WHERE employee_id = ? AND leave_type_id = ? AND year = ?', [app.employeeId, app.leaveTypeId, new Date().getFullYear()]);
        if (balance) {
            await (0, database_js_1.query)('UPDATE leave_balances SET pending_ytd = GREATEST(pending_ytd - ?, 0), current_balance = current_balance + ?, updated_at = NOW() WHERE id = ?', [Number(app.totalDays), Number(app.totalDays), balance.id]);
        }
        return { message: 'Leave rejected', applicationId: id };
    }
    async cancel(id, tenantId, userId) {
        const app = await (0, database_js_1.queryOne)('SELECT * FROM leave_applications WHERE id = ? AND tenant_id = ?', [id, tenantId]);
        if (!app)
            throw new index_js_1.NotFoundError('Leave application', id);
        if (!['Pending', 'Approved'].includes(app.status))
            throw new index_js_1.BusinessRuleError(`Cannot cancel leave in ${app.status} status`);
        await (0, database_js_1.query)('UPDATE leave_applications SET status = ?, updated_at = NOW() WHERE id = ?', ['Cancelled', id]);
        if (app.status === 'Pending') {
            const balance = await (0, database_js_1.queryOne)('SELECT id FROM leave_balances WHERE employee_id = ? AND leave_type_id = ? AND year = ?', [app.employeeId, app.leaveTypeId, new Date().getFullYear()]);
            if (balance) {
                await (0, database_js_1.query)('UPDATE leave_balances SET pending_ytd = GREATEST(pending_ytd - ?, 0), current_balance = current_balance + ?, updated_at = NOW() WHERE id = ?', [Number(app.totalDays), Number(app.totalDays), balance.id]);
            }
        }
        else if (app.status === 'Approved') {
            const balance = await (0, database_js_1.queryOne)('SELECT id FROM leave_balances WHERE employee_id = ? AND leave_type_id = ? AND year = ?', [app.employeeId, app.leaveTypeId, new Date().getFullYear()]);
            if (balance) {
                await (0, database_js_1.query)('UPDATE leave_balances SET used_ytd = GREATEST(used_ytd - ?, 0), current_balance = current_balance + ?, updated_at = NOW() WHERE id = ?', [Number(app.totalDays), Number(app.totalDays), balance.id]);
            }
        }
        return { message: 'Leave cancelled' };
    }
    async listApplications(tenantId, params) {
        const { page = 1, limit = 20, status, employeeId, fromDate, toDate } = params;
        let where = 'WHERE la.tenant_id = ?';
        const vals = [tenantId];
        if (status) {
            where += ' AND la.status = ?';
            vals.push(status);
        }
        if (employeeId) {
            where += ' AND la.employee_id = ?';
            vals.push(employeeId);
        }
        if (fromDate) {
            where += ' AND la.from_date >= ?';
            vals.push(fromDate);
        }
        if (toDate) {
            where += ' AND la.to_date <= ?';
            vals.push(toDate);
        }
        const [rows, cnt] = await Promise.all([
            (0, database_js_1.query)(`SELECT la.*, lt.leave_name, lt.leave_code, e.full_name AS employee_name, e.employee_code
             FROM leave_applications la
             JOIN leave_types lt ON la.leave_type_id = lt.id
             LEFT JOIN employees e ON la.employee_id = e.id
             ${where} ORDER BY la.created_at DESC LIMIT ? OFFSET ?`, [...vals, Number(limit), (Number(page) - 1) * Number(limit)]),
            (0, database_js_1.query)(`SELECT COUNT(*) as total FROM leave_applications la ${where}`, vals),
        ]);
        const total = cnt[0]?.total || 0;
        return { data: rows, meta: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)), hasNext: Number(page) * Number(limit) < total, hasPrev: Number(page) > 1 } };
    }
    async getApplication(id, tenantId) {
        const app = await (0, database_js_1.queryOne)('SELECT la.*, lt.leave_name, e.full_name AS employee_name FROM leave_applications la JOIN leave_types lt ON la.leave_type_id = lt.id LEFT JOIN employees e ON la.employee_id = e.id WHERE la.id = ? AND la.tenant_id = ?', [id, tenantId]);
        if (!app)
            throw new index_js_1.NotFoundError('Leave application', id);
        return app;
    }
    // ── Leave Balances ─────────────────────────────────────────────────────────
    async getBalance(tenantId, employeeId, year) {
        const y = year || new Date().getFullYear();
        return (0, database_js_1.query)('SELECT lb.*, lt.leave_name, lt.leave_code, lt.is_paid FROM leave_balances lb JOIN leave_types lt ON lb.leave_type_id = lt.id WHERE lb.employee_id = ? AND lb.year = ?', [employeeId, y]);
    }
    async initBalances(tenantId, companyId, year) {
        const employees = await (0, database_js_1.query)('SELECT id FROM employees WHERE company_id = ? AND employment_status NOT IN (?,?) AND deleted_at IS NULL', [companyId, 'Exited', 'Terminated']);
        const policies = await (0, database_js_1.query)('SELECT * FROM leave_policies WHERE company_id = ? AND status = ?', [companyId, 'Active']);
        let created = 0;
        for (const emp of employees) {
            for (const pol of policies) {
                const exists = await (0, database_js_1.queryOne)('SELECT id FROM leave_balances WHERE employee_id = ? AND leave_type_id = ? AND year = ?', [emp.id, pol.leave_type_id, year]);
                if (!exists) {
                    await (0, database_js_1.insert)('INSERT INTO leave_balances (id, tenant_id, employee_id, leave_type_id, year, opening_balance, current_balance) VALUES (UUID(), ?, ?, ?, ?, ?, ?)', [tenantId, emp.id, pol.leave_type_id, year, pol.annual_quota, pol.annual_quota]);
                    created++;
                }
            }
        }
        return { message: `Initialized ${created} leave balance records for ${year}` };
    }
    async updateBalance(id, tenantId, input) {
        const lb = await (0, database_js_1.queryOne)('SELECT id FROM leave_balances WHERE id = ?', [id]);
        if (!lb)
            throw new index_js_1.NotFoundError('Leave balance', id);
        await (0, database_js_1.query)('UPDATE leave_balances SET opening_balance = ?, current_balance = ?, updated_at = NOW() WHERE id = ?', [input.openingBalance, input.currentBalance, id]);
        return (0, database_js_1.queryOne)('SELECT * FROM leave_balances WHERE id = ?', [id]);
    }
    // ── Holidays ───────────────────────────────────────────────────────────────
    async listHolidays(tenantId, companyId, year) {
        return (0, database_js_1.query)('SELECT * FROM holidays WHERE company_id = ? AND year = ? ORDER BY holiday_date', [companyId, year]);
    }
    async createHoliday(tenantId, input) {
        const d = new Date(input.holidayDate);
        const year = d.getFullYear();
        const exists = await (0, database_js_1.queryOne)('SELECT id FROM holidays WHERE company_id = ? AND holiday_date = ?', [input.companyId, input.holidayDate]);
        if (exists)
            throw new index_js_1.ConflictError('Holiday already exists for this date');
        const id = await (0, database_js_1.insert)('INSERT INTO holidays (id, tenant_id, company_id, holiday_name, holiday_date, holiday_type, is_optional, year) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)', [tenantId, input.companyId, input.holidayName, input.holidayDate, input.holidayType || 'National', input.isOptional || false, year]);
        return (0, database_js_1.queryOne)('SELECT * FROM holidays WHERE id = ?', [id]);
    }
    async updateHoliday(id, tenantId, input) {
        const h = await (0, database_js_1.queryOne)('SELECT id FROM holidays WHERE id = ? AND tenant_id = ?', [id, tenantId]);
        if (!h)
            throw new index_js_1.NotFoundError('Holiday', id);
        await (0, database_js_1.query)('UPDATE holidays SET holiday_name = ?, holiday_type = ?, is_optional = ?, updated_at = NOW() WHERE id = ?', [input.holidayName, input.holidayType, input.isOptional, id]);
        return (0, database_js_1.queryOne)('SELECT * FROM holidays WHERE id = ?', [id]);
    }
    async deleteHoliday(id, tenantId) {
        const h = await (0, database_js_1.queryOne)('SELECT id FROM holidays WHERE id = ? AND tenant_id = ?', [id, tenantId]);
        if (!h)
            throw new index_js_1.NotFoundError('Holiday', id);
        await (0, database_js_1.query)('DELETE FROM holidays WHERE id = ?', [id]);
        return { message: 'Holiday deleted' };
    }
    // ── Leave Calendar ─────────────────────────────────────────────────────────
    async getCalendar(tenantId, employeeId, month, year) {
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = new Date(year, month, 0).toISOString().slice(0, 10);
        const [applications, holidays] = await Promise.all([
            (0, database_js_1.query)('SELECT la.*, lt.leave_name FROM leave_applications la JOIN leave_types lt ON la.leave_type_id = lt.id WHERE la.employee_id = ? AND la.status != ? AND ((la.from_date BETWEEN ? AND ?) OR (la.to_date BETWEEN ? AND ?))', [employeeId, 'Cancelled', startDate, endDate, startDate, endDate]),
            (0, database_js_1.query)('SELECT * FROM holidays WHERE tenant_id = ? AND holiday_date BETWEEN ? AND ?', [tenantId, startDate, endDate]),
        ]);
        return { applications, holidays };
    }
}
exports.LeaveService = LeaveService;
exports.leaveService = new LeaveService();
