"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.complianceService = exports.ComplianceService = void 0;
const database_js_1 = require("../../config/database.js");
function paginate(rows, cnt, page, limit) {
    const total = cnt[0]?.total || 0;
    return { data: rows, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}
class ComplianceService {
    async listCalendarEvents(tenantId, params) {
        const { page = 1, limit = 50 } = params;
        try {
            const [rows, cnt] = await Promise.all([
                (0, database_js_1.query)('SELECT * FROM compliance_events WHERE tenant_id = ? ORDER BY due_date ASC LIMIT ? OFFSET ?', [tenantId, Number(limit), (Number(page) - 1) * Number(limit)]),
                (0, database_js_1.query)('SELECT COUNT(*) as total FROM compliance_events WHERE tenant_id = ?', [tenantId]),
            ]);
            return paginate(rows, cnt, Number(page), Number(limit));
        }
        catch {
            return { data: [], meta: { page: Number(page), limit: Number(limit), total: 0, totalPages: 0 } };
        }
    }
    async createCalendarEvent(tenantId, userId, input) {
        try {
            const id = await (0, database_js_1.insert)(`INSERT INTO compliance_events (id, tenant_id, title, description, event_type, due_date, frequency, status, created_by)
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, 'Pending', ?)`, [tenantId, input.title, input.description ?? null, input.eventType ?? 'Regulatory',
                input.dueDate, input.frequency ?? 'One-time', userId]);
            return (0, database_js_1.queryOne)('SELECT * FROM compliance_events WHERE id = ?', [id]);
        }
        catch {
            return { id: `ce-${Date.now()}`, ...input, tenantId, status: 'Pending', createdAt: new Date().toISOString() };
        }
    }
    async listFilings(tenantId, params) {
        const { page = 1, limit = 50 } = params;
        try {
            const [rows, cnt] = await Promise.all([
                (0, database_js_1.query)('SELECT * FROM compliance_filings WHERE tenant_id = ? ORDER BY filing_date DESC LIMIT ? OFFSET ?', [tenantId, Number(limit), (Number(page) - 1) * Number(limit)]),
                (0, database_js_1.query)('SELECT COUNT(*) as total FROM compliance_filings WHERE tenant_id = ?', [tenantId]),
            ]);
            return paginate(rows, cnt, Number(page), Number(limit));
        }
        catch {
            return { data: [], meta: { page: Number(page), limit: Number(limit), total: 0, totalPages: 0 } };
        }
    }
    async createFiling(tenantId, userId, input) {
        try {
            const id = await (0, database_js_1.insert)(`INSERT INTO compliance_filings (id, tenant_id, filing_type, period, filing_date, due_date, status, amount_paid, reference_number, created_by)
         VALUES (UUID(), ?, ?, ?, ?, ?, 'Filed', ?, ?, ?)`, [tenantId, input.filingType, input.period, input.filingDate ?? new Date().toISOString().split('T')[0],
                input.dueDate ?? null, input.amountPaid ?? null, input.referenceNumber ?? null, userId]);
            return (0, database_js_1.queryOne)('SELECT * FROM compliance_filings WHERE id = ?', [id]);
        }
        catch {
            return { id: `cf-${Date.now()}`, ...input, tenantId, status: 'Filed', createdAt: new Date().toISOString() };
        }
    }
    async listReports(tenantId, params) {
        const { page = 1, limit = 30 } = params;
        try {
            const [rows, cnt] = await Promise.all([
                (0, database_js_1.query)('SELECT * FROM compliance_reports WHERE tenant_id = ? ORDER BY generated_at DESC LIMIT ? OFFSET ?', [tenantId, Number(limit), (Number(page) - 1) * Number(limit)]),
                (0, database_js_1.query)('SELECT COUNT(*) as total FROM compliance_reports WHERE tenant_id = ?', [tenantId]),
            ]);
            return paginate(rows, cnt, Number(page), Number(limit));
        }
        catch {
            return { data: [], meta: { page: Number(page), limit: Number(limit), total: 0, totalPages: 0 } };
        }
    }
    async listChecklist(tenantId, params) {
        const { page = 1, limit = 50 } = params;
        try {
            const [rows, cnt] = await Promise.all([
                (0, database_js_1.query)('SELECT * FROM compliance_checklist WHERE tenant_id = ? ORDER BY due_date ASC LIMIT ? OFFSET ?', [tenantId, Number(limit), (Number(page) - 1) * Number(limit)]),
                (0, database_js_1.query)('SELECT COUNT(*) as total FROM compliance_checklist WHERE tenant_id = ?', [tenantId]),
            ]);
            return paginate(rows, cnt, Number(page), Number(limit));
        }
        catch {
            return { data: [], meta: { page: Number(page), limit: Number(limit), total: 0, totalPages: 0 } };
        }
    }
    async updateChecklistItem(id, tenantId, input) {
        try {
            await (0, database_js_1.query)('UPDATE compliance_checklist SET status = ?, completed_at = NOW(), updated_at = NOW() WHERE id = ? AND tenant_id = ?', [input.status, id, tenantId]);
            return (0, database_js_1.queryOne)('SELECT * FROM compliance_checklist WHERE id = ?', [id]);
        }
        catch {
            return { id, ...input };
        }
    }
    async listDocuments(tenantId, params) {
        const { page = 1, limit = 50 } = params;
        try {
            const [rows, cnt] = await Promise.all([
                (0, database_js_1.query)('SELECT * FROM compliance_documents WHERE tenant_id = ? ORDER BY expiry_date ASC LIMIT ? OFFSET ?', [tenantId, Number(limit), (Number(page) - 1) * Number(limit)]),
                (0, database_js_1.query)('SELECT COUNT(*) as total FROM compliance_documents WHERE tenant_id = ?', [tenantId]),
            ]);
            return paginate(rows, cnt, Number(page), Number(limit));
        }
        catch {
            return { data: [], meta: { page: Number(page), limit: Number(limit), total: 0, totalPages: 0 } };
        }
    }
    async createDocument(tenantId, userId, input) {
        try {
            const id = await (0, database_js_1.insert)(`INSERT INTO compliance_documents (id, tenant_id, document_name, document_type, issued_date, expiry_date, issuing_authority, status, created_by)
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, 'Active', ?)`, [tenantId, input.documentName, input.documentType ?? 'License',
                input.issuedDate ?? null, input.expiryDate ?? null, input.issuingAuthority ?? null, userId]);
            return (0, database_js_1.queryOne)('SELECT * FROM compliance_documents WHERE id = ?', [id]);
        }
        catch {
            return { id: `cd-${Date.now()}`, ...input, tenantId, status: 'Active', createdAt: new Date().toISOString() };
        }
    }
}
exports.ComplianceService = ComplianceService;
exports.complianceService = new ComplianceService();
//# sourceMappingURL=compliance.service.js.map