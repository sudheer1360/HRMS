"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.travelService = exports.TravelService = void 0;
const database_js_1 = require("../../config/database.js");
function paginate(rows, cnt, page, limit) {
    const total = cnt[0]?.total || 0;
    return { data: rows, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}
class TravelService {
    async listRequests(tenantId, userId, params) {
        const { page = 1, limit = 30, status, my } = params;
        try {
            let where = 'WHERE tr.tenant_id = ?';
            const vals = [tenantId];
            if (my === 'true' && userId) {
                where += ' AND tr.employee_id = ?';
                vals.push(userId);
            }
            if (status) {
                where += ' AND tr.status = ?';
                vals.push(status);
            }
            const [rows, cnt] = await Promise.all([
                (0, database_js_1.query)(`SELECT tr.*, e.first_name, e.last_name FROM travel_requests tr LEFT JOIN employees e ON tr.employee_id = e.id ${where} ORDER BY tr.created_at DESC LIMIT ? OFFSET ?`, [...vals, Number(limit), (Number(page) - 1) * Number(limit)]),
                (0, database_js_1.query)(`SELECT COUNT(*) as total FROM travel_requests tr ${where}`, vals),
            ]);
            return paginate(rows, cnt, Number(page), Number(limit));
        }
        catch {
            return { data: [], meta: { page: Number(page), limit: Number(limit), total: 0, totalPages: 0 } };
        }
    }
    async createRequest(tenantId, userId, input) {
        try {
            const code = `TRV-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}`;
            const id = await (0, database_js_1.insert)(`INSERT INTO travel_requests (id, tenant_id, employee_id, travel_code, destination, purpose, departure_date, return_date, travel_mode, estimated_cost, status, created_by)
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?)`, [tenantId, userId, code, input.destination, input.purpose, input.departureDate,
                input.returnDate, input.travelMode || 'Air', input.estimatedCost ?? 0, userId]);
            return (0, database_js_1.queryOne)('SELECT * FROM travel_requests WHERE id = ?', [id]);
        }
        catch {
            return { id: `tr-${Date.now()}`, ...input, tenantId, employeeId: userId, status: 'Pending', createdAt: new Date().toISOString() };
        }
    }
    async updateRequest(id, tenantId, input) {
        try {
            await (0, database_js_1.query)('UPDATE travel_requests SET status = ?, updated_at = NOW() WHERE id = ? AND tenant_id = ?', [input.status, id, tenantId]);
            return (0, database_js_1.queryOne)('SELECT * FROM travel_requests WHERE id = ?', [id]);
        }
        catch {
            return { id, ...input };
        }
    }
    async listExpenses(tenantId, userId, params) {
        const { page = 1, limit = 50, my } = params;
        try {
            let where = 'WHERE te.tenant_id = ?';
            const vals = [tenantId];
            if (my === 'true' && userId) {
                where += ' AND te.employee_id = ?';
                vals.push(userId);
            }
            const [rows, cnt] = await Promise.all([
                (0, database_js_1.query)(`SELECT te.*, e.first_name, e.last_name FROM travel_expenses te LEFT JOIN employees e ON te.employee_id = e.id ${where} ORDER BY te.receipt_date DESC LIMIT ? OFFSET ?`, [...vals, Number(limit), (Number(page) - 1) * Number(limit)]),
                (0, database_js_1.query)(`SELECT COUNT(*) as total FROM travel_expenses te ${where}`, vals),
            ]);
            return paginate(rows, cnt, Number(page), Number(limit));
        }
        catch {
            return { data: [], meta: { page: Number(page), limit: Number(limit), total: 0, totalPages: 0 } };
        }
    }
    async updateExpense(id, tenantId, input) {
        try {
            await (0, database_js_1.query)('UPDATE travel_expenses SET status = ?, updated_at = NOW() WHERE id = ? AND tenant_id = ?', [input.status, id, tenantId]);
            return (0, database_js_1.queryOne)('SELECT * FROM travel_expenses WHERE id = ?', [id]);
        }
        catch {
            return { id, ...input };
        }
    }
    async createExpense(tenantId, userId, input) {
        try {
            const code = `EXP-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}`;
            const id = await (0, database_js_1.insert)(`INSERT INTO travel_expenses (id, tenant_id, employee_id, claim_code, travel_request_id, category, description, amount, receipt_date, status, created_by)
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?)`, [tenantId, userId, code, input.travelRequestId ?? null, input.category, input.description, input.amount, input.receiptDate, userId]);
            return (0, database_js_1.queryOne)('SELECT * FROM travel_expenses WHERE id = ?', [id]);
        }
        catch {
            return { id: `exp-${Date.now()}`, ...input, tenantId, employeeId: userId, status: 'Pending', createdAt: new Date().toISOString() };
        }
    }
    async listAdvances(tenantId, userId, params) {
        const { page = 1, limit = 20, my } = params;
        try {
            let where = 'WHERE ta.tenant_id = ?';
            const vals = [tenantId];
            if (my === 'true' && userId) {
                where += ' AND ta.employee_id = ?';
                vals.push(userId);
            }
            const [rows, cnt] = await Promise.all([
                (0, database_js_1.query)(`SELECT ta.*, e.first_name, e.last_name FROM travel_advances ta LEFT JOIN employees e ON ta.employee_id = e.id ${where} ORDER BY ta.created_at DESC LIMIT ? OFFSET ?`, [...vals, Number(limit), (Number(page) - 1) * Number(limit)]),
                (0, database_js_1.query)(`SELECT COUNT(*) as total FROM travel_advances ta ${where}`, vals),
            ]);
            return paginate(rows, cnt, Number(page), Number(limit));
        }
        catch {
            return { data: [], meta: { page: Number(page), limit: Number(limit), total: 0, totalPages: 0 } };
        }
    }
    async createAdvance(tenantId, userId, input) {
        try {
            const code = `ADV-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}`;
            const id = await (0, database_js_1.insert)(`INSERT INTO travel_advances (id, tenant_id, employee_id, advance_code, travel_request_id, purpose, amount, status, created_by)
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, 'Requested', ?)`, [tenantId, userId, code, input.travelRequestId ?? null, input.purpose, input.amount, userId]);
            return (0, database_js_1.queryOne)('SELECT * FROM travel_advances WHERE id = ?', [id]);
        }
        catch {
            return { id: `adv-${Date.now()}`, ...input, tenantId, employeeId: userId, status: 'Requested', createdAt: new Date().toISOString() };
        }
    }
}
exports.TravelService = TravelService;
exports.travelService = new TravelService();
//# sourceMappingURL=travel.service.js.map