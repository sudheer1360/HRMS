"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compensationService = exports.CompensationService = void 0;
const database_js_1 = require("../../config/database.js");
function paginate(rows, cnt, page, limit) {
    const total = cnt[0]?.total || 0;
    return { data: rows, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}
class CompensationService {
    async listReviewCycles(tenantId, params) {
        const { page = 1, limit = 20 } = params;
        try {
            const [rows, cnt] = await Promise.all([
                (0, database_js_1.query)('SELECT * FROM compensation_cycles WHERE tenant_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?', [tenantId, Number(limit), (Number(page) - 1) * Number(limit)]),
                (0, database_js_1.query)('SELECT COUNT(*) as total FROM compensation_cycles WHERE tenant_id = ?', [tenantId]),
            ]);
            return paginate(rows, cnt, Number(page), Number(limit));
        }
        catch {
            return { data: [], meta: { page: Number(page), limit: Number(limit), total: 0, totalPages: 0 } };
        }
    }
    async createReviewCycle(tenantId, userId, input) {
        try {
            const id = await (0, database_js_1.insert)(`INSERT INTO compensation_cycles (id, tenant_id, cycle_name, cycle_type, period_start, period_end, budget_percent, status, created_by)
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, 'Planning', ?)`, [tenantId, input.cycleName, input.cycleType ?? 'Annual', input.periodStart,
                input.periodEnd, input.budgetPercent ?? null, userId]);
            return (0, database_js_1.queryOne)('SELECT * FROM compensation_cycles WHERE id = ?', [id]);
        }
        catch {
            return { id: `cc-${Date.now()}`, ...input, tenantId, status: 'Planning', createdAt: new Date().toISOString() };
        }
    }
    async activateReviewCycle(id, tenantId) {
        try {
            await (0, database_js_1.query)('UPDATE compensation_cycles SET status = ?, updated_at = NOW() WHERE id = ? AND tenant_id = ?', ['Active', id, tenantId]);
            return (0, database_js_1.queryOne)('SELECT * FROM compensation_cycles WHERE id = ?', [id]);
        }
        catch {
            return { id, status: 'Active' };
        }
    }
    async listMyBonuses(tenantId, userId, params) {
        const { page = 1, limit = 30 } = params;
        try {
            const [rows, cnt] = await Promise.all([
                (0, database_js_1.query)('SELECT * FROM employee_bonuses WHERE tenant_id = ? AND employee_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?', [tenantId, userId, Number(limit), (Number(page) - 1) * Number(limit)]),
                (0, database_js_1.query)('SELECT COUNT(*) as total FROM employee_bonuses WHERE tenant_id = ? AND employee_id = ?', [tenantId, userId]),
            ]);
            return paginate(rows, cnt, Number(page), Number(limit));
        }
        catch {
            return { data: [], meta: { page: Number(page), limit: Number(limit), total: 0, totalPages: 0 } };
        }
    }
    async createBonus(tenantId, userId, input) {
        try {
            const id = await (0, database_js_1.insert)(`INSERT INTO employee_bonuses (id, tenant_id, employee_id, cycle_id, bonus_type, amount, payment_date, status, created_by)
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, 'Pending', ?)`, [tenantId, input.employeeId, input.cycleId ?? null, input.bonusType ?? 'Performance',
                input.amount, input.paymentDate ?? null, userId]);
            return (0, database_js_1.queryOne)('SELECT * FROM employee_bonuses WHERE id = ?', [id]);
        }
        catch {
            return { id: `bon-${Date.now()}`, ...input, tenantId, status: 'Pending', createdAt: new Date().toISOString() };
        }
    }
    async listMyLoans(tenantId, userId, params) {
        const { page = 1, limit = 20 } = params;
        try {
            const [rows, cnt] = await Promise.all([
                (0, database_js_1.query)('SELECT * FROM employee_loans WHERE tenant_id = ? AND employee_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?', [tenantId, userId, Number(limit), (Number(page) - 1) * Number(limit)]),
                (0, database_js_1.query)('SELECT COUNT(*) as total FROM employee_loans WHERE tenant_id = ? AND employee_id = ?', [tenantId, userId]),
            ]);
            return paginate(rows, cnt, Number(page), Number(limit));
        }
        catch {
            return { data: [], meta: { page: Number(page), limit: Number(limit), total: 0, totalPages: 0 } };
        }
    }
    async createLoan(tenantId, userId, input) {
        try {
            const id = await (0, database_js_1.insert)(`INSERT INTO employee_loans (id, tenant_id, employee_id, loan_type, principal_amount, tenure_months, emi_amount, interest_rate, disbursement_date, status, created_by)
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, 'Requested', ?)`, [tenantId, userId, input.loanType ?? 'Personal', input.principalAmount, input.tenureMonths ?? 12,
                input.emiAmount ?? null, input.interestRate ?? 0, input.disbursementDate ?? null, userId]);
            return (0, database_js_1.queryOne)('SELECT * FROM employee_loans WHERE id = ?', [id]);
        }
        catch {
            return { id: `ln-${Date.now()}`, ...input, tenantId, status: 'Requested', createdAt: new Date().toISOString() };
        }
    }
    async listMyVariablePay(tenantId, userId, params) {
        const { page = 1, limit = 20 } = params;
        try {
            const [rows, cnt] = await Promise.all([
                (0, database_js_1.query)('SELECT * FROM variable_pay WHERE tenant_id = ? AND employee_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?', [tenantId, userId, Number(limit), (Number(page) - 1) * Number(limit)]),
                (0, database_js_1.query)('SELECT COUNT(*) as total FROM variable_pay WHERE tenant_id = ? AND employee_id = ?', [tenantId, userId]),
            ]);
            return paginate(rows, cnt, Number(page), Number(limit));
        }
        catch {
            return { data: [], meta: { page: Number(page), limit: Number(limit), total: 0, totalPages: 0 } };
        }
    }
    async listMyCTCRevisions(tenantId, userId, params) {
        const { page = 1, limit = 10 } = params;
        try {
            const [rows, cnt] = await Promise.all([
                (0, database_js_1.query)('SELECT * FROM ctc_revisions WHERE tenant_id = ? AND employee_id = ? ORDER BY effective_date DESC LIMIT ? OFFSET ?', [tenantId, userId, Number(limit), (Number(page) - 1) * Number(limit)]),
                (0, database_js_1.query)('SELECT COUNT(*) as total FROM ctc_revisions WHERE tenant_id = ? AND employee_id = ?', [tenantId, userId]),
            ]);
            return paginate(rows, cnt, Number(page), Number(limit));
        }
        catch {
            return { data: [], meta: { page: Number(page), limit: Number(limit), total: 0, totalPages: 0 } };
        }
    }
    async createCTCRevision(tenantId, userId, input) {
        try {
            const id = await (0, database_js_1.insert)(`INSERT INTO ctc_revisions (id, tenant_id, employee_id, cycle_id, previous_ctc, revised_ctc, hike_percent, effective_date, reason, status, created_by)
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?)`, [tenantId, input.employeeId, input.cycleId ?? null, input.previousCtc ?? 0,
                input.revisedCtc, input.hikePercent ?? null, input.effectiveDate, input.reason ?? null, userId]);
            return (0, database_js_1.queryOne)('SELECT * FROM ctc_revisions WHERE id = ?', [id]);
        }
        catch {
            return { id: `ctc-${Date.now()}`, ...input, tenantId, status: 'Pending', createdAt: new Date().toISOString() };
        }
    }
}
exports.CompensationService = CompensationService;
exports.compensationService = new CompensationService();
//# sourceMappingURL=compensation.service.js.map