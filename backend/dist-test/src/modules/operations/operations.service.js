"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.operationsService = exports.ExitService = exports.DisciplinaryService = exports.GrievanceService = exports.AssetService = exports.PerformanceService = void 0;
const database_js_1 = require("../../config/database.js");
const index_js_1 = require("../../common/errors/index.js");
// ── Performance ───────────────────────────────────────────────────────────────
class PerformanceService {
    async listCycles(tenantId, companyId) {
        return (0, database_js_1.query)('SELECT * FROM performance_cycles WHERE tenant_id = ? AND company_id = ? ORDER BY created_at DESC', [tenantId, companyId]);
    }
    async createCycle(tenantId, input) {
        const id = await (0, database_js_1.insert)(`INSERT INTO performance_cycles
         (id, tenant_id, company_id, cycle_name, cycle_type, period_start, period_end, self_review_deadline, manager_review_deadline, status)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, 'Planning')`, [tenantId, input.companyId, input.name, input.reviewType || 'Annual',
            input.periodStart, input.periodEnd, input.selfReviewDeadline, input.managerReviewDeadline]);
        return (0, database_js_1.queryOne)('SELECT * FROM performance_cycles WHERE id = ?', [id]);
    }
    async listReviews(tenantId, params) {
        const { employeeId, cycleId, status, page = 1, limit = 20 } = params;
        let where = 'WHERE pr.tenant_id = ?';
        const vals = [tenantId];
        if (employeeId) {
            where += ' AND pr.employee_id = ?';
            vals.push(employeeId);
        }
        if (cycleId) {
            where += ' AND pr.cycle_id = ?';
            vals.push(cycleId);
        }
        if (status) {
            where += ' AND pr.status = ?';
            vals.push(status);
        }
        const [rows, cnt] = await Promise.all([
            (0, database_js_1.query)(`SELECT pr.*, e.first_name, e.last_name, pc.cycle_name
         FROM performance_reviews pr
         LEFT JOIN employees e ON pr.employee_id = e.id
         LEFT JOIN performance_cycles pc ON pr.cycle_id = pc.id
         ${where} ORDER BY pr.created_at DESC LIMIT ? OFFSET ?`, [...vals, Number(limit), (Number(page) - 1) * Number(limit)]),
            (0, database_js_1.query)(`SELECT COUNT(*) as total FROM performance_reviews pr ${where}`, vals),
        ]);
        const total = cnt[0]?.total || 0;
        return { data: rows, meta: { page: Number(page), limit: Number(limit), total } };
    }
    async submitSelfReview(tenantId, cycleId, employeeId, input) {
        const cycle = await (0, database_js_1.queryOne)('SELECT * FROM performance_cycles WHERE id = ? AND tenant_id = ?', [cycleId, tenantId]);
        if (!cycle)
            throw new index_js_1.NotFoundError('Performance cycle', cycleId);
        // Upsert review
        const existing = await (0, database_js_1.queryOne)('SELECT id FROM performance_reviews WHERE cycle_id = ? AND employee_id = ?', [cycleId, employeeId]);
        if (existing) {
            await (0, database_js_1.query)('UPDATE performance_reviews SET self_rating = ?, self_comments = ?, self_submitted_at = NOW(), status = ?, updated_at = NOW() WHERE id = ?', [input.rating, JSON.stringify(input.answers || input.comments), 'SelfReviewDone', existing.id]);
            return (0, database_js_1.queryOne)('SELECT * FROM performance_reviews WHERE id = ?', [existing.id]);
        }
        const id = await (0, database_js_1.insert)(`INSERT INTO performance_reviews (id, tenant_id, cycle_id, employee_id, self_rating, self_comments, self_submitted_at, status)
       VALUES (UUID(), ?, ?, ?, ?, ?, NOW(), 'SelfReviewDone')`, [tenantId, cycleId, employeeId, input.rating, JSON.stringify(input.answers || input.comments)]);
        return (0, database_js_1.queryOne)('SELECT * FROM performance_reviews WHERE id = ?', [id]);
    }
    async submitManagerReview(tenantId, reviewId, input) {
        const review = await (0, database_js_1.queryOne)('SELECT * FROM performance_reviews WHERE id = ? AND tenant_id = ?', [reviewId, tenantId]);
        if (!review)
            throw new index_js_1.NotFoundError('Performance review', reviewId);
        await (0, database_js_1.query)('UPDATE performance_reviews SET manager_rating = ?, manager_comments = ?, manager_submitted_at = NOW(), final_rating = ?, status = ?, updated_at = NOW() WHERE id = ?', [input.rating, JSON.stringify(input.answers || input.comments), input.finalRating ?? input.rating, 'Completed', reviewId]);
        return (0, database_js_1.queryOne)('SELECT * FROM performance_reviews WHERE id = ?', [reviewId]);
    }
}
exports.PerformanceService = PerformanceService;
// ── Assets ────────────────────────────────────────────────────────────────────
class AssetService {
    async listAssets(tenantId, params) {
        const { assignedTo, status, search, page = 1, limit = 20 } = params;
        let where = 'WHERE a.tenant_id = ?';
        const vals = [tenantId];
        if (assignedTo) {
            where += ' AND aa.employee_id = ?';
            vals.push(assignedTo);
        }
        if (status) {
            where += ' AND a.status = ?';
            vals.push(status);
        }
        if (search) {
            where += ' AND (a.asset_name LIKE ? OR a.asset_code LIKE ?)';
            vals.push(`%${search}%`, `%${search}%`);
        }
        const [rows, cnt] = await Promise.all([
            (0, database_js_1.query)(`SELECT a.*, aa.employee_id AS current_holder, aa.allocated_at
         FROM assets a
         LEFT JOIN asset_allocations aa ON aa.asset_id = a.id AND aa.returned_at IS NULL
         ${where} ORDER BY a.created_at DESC LIMIT ? OFFSET ?`, [...vals, Number(limit), (Number(page) - 1) * Number(limit)]),
            (0, database_js_1.query)(`SELECT COUNT(*) as total FROM assets a LEFT JOIN asset_allocations aa ON aa.asset_id = a.id AND aa.returned_at IS NULL ${where}`, vals),
        ]);
        const total = cnt[0]?.total || 0;
        return { data: rows, meta: { page: Number(page), limit: Number(limit), total } };
    }
    async createAsset(tenantId, input) {
        const code = `AST-${Date.now().toString(36).toUpperCase()}`;
        const id = await (0, database_js_1.insert)(`INSERT INTO assets (id, tenant_id, company_id, asset_code, asset_name, category, brand, model, serial_number, purchase_date, purchase_cost, warranty_expiry, status)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Available')`, [tenantId, input.companyId, code, input.name, input.category, input.brand,
            input.model, input.serialNumber, input.purchaseDate, input.purchasePrice, input.warrantyExpiresAt]);
        return (0, database_js_1.queryOne)('SELECT * FROM assets WHERE id = ?', [id]);
    }
    async allocateAsset(assetId, tenantId, input) {
        const asset = await (0, database_js_1.queryOne)('SELECT * FROM assets WHERE id = ? AND tenant_id = ?', [assetId, tenantId]);
        if (!asset)
            throw new index_js_1.NotFoundError('Asset', assetId);
        if (asset.status !== 'Available')
            throw new index_js_1.BusinessRuleError(`Asset is ${asset.status} and cannot be allocated`);
        await (0, database_js_1.insert)('INSERT INTO asset_allocations (id, asset_id, employee_id, notes) VALUES (UUID(), ?, ?, ?)', [assetId, input.employeeId, input.notes]);
        await (0, database_js_1.query)('UPDATE assets SET status = ?, assigned_to = ?, assigned_at = NOW(), updated_at = NOW() WHERE id = ?', ['Allocated', input.employeeId, assetId]);
        return (0, database_js_1.queryOne)('SELECT * FROM assets WHERE id = ?', [assetId]);
    }
    async returnAsset(assetId, tenantId) {
        const asset = await (0, database_js_1.queryOne)('SELECT * FROM assets WHERE id = ? AND tenant_id = ?', [assetId, tenantId]);
        if (!asset)
            throw new index_js_1.NotFoundError('Asset', assetId);
        if (asset.status !== 'Allocated')
            throw new index_js_1.BusinessRuleError('Asset is not currently allocated');
        await (0, database_js_1.query)('UPDATE asset_allocations SET returned_at = NOW(), condition_at_return = ? WHERE asset_id = ? AND returned_at IS NULL', ['Good', assetId]);
        await (0, database_js_1.query)('UPDATE assets SET status = ?, updated_at = NOW() WHERE id = ?', ['Available', assetId]);
        return { message: 'Asset returned successfully' };
    }
}
exports.AssetService = AssetService;
// ── Grievances ────────────────────────────────────────────────────────────────
class GrievanceService {
    async listGrievances(tenantId, params) {
        const { status, employeeId, page = 1, limit = 20 } = params;
        let where = 'WHERE tenant_id = ?';
        const vals = [tenantId];
        if (status) {
            where += ' AND status = ?';
            vals.push(status);
        }
        if (employeeId) {
            where += ' AND employee_id = ?';
            vals.push(employeeId);
        }
        const [rows, cnt] = await Promise.all([
            (0, database_js_1.query)(`SELECT * FROM grievances ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...vals, Number(limit), (Number(page) - 1) * Number(limit)]),
            (0, database_js_1.query)(`SELECT COUNT(*) as total FROM grievances ${where}`, vals),
        ]);
        const total = cnt[0]?.total || 0;
        return { data: rows, meta: { page: Number(page), limit: Number(limit), total } };
    }
    async submitGrievance(tenantId, input) {
        const code = `GRV-${Date.now().toString(36).toUpperCase()}`;
        const id = await (0, database_js_1.insert)(`INSERT INTO grievances (id, tenant_id, employee_id, grievance_code, category, subject, description, is_anonymous, status)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, 'Open')`, [tenantId, input.employeeId, code, input.category, input.subject, input.description, input.isAnonymous ? 1 : 0]);
        return (0, database_js_1.queryOne)('SELECT * FROM grievances WHERE id = ?', [id]);
    }
}
exports.GrievanceService = GrievanceService;
// ── Disciplinary ──────────────────────────────────────────────────────────────
class DisciplinaryService {
    async listDisciplinaryCases(tenantId, params) {
        const { status, employeeId, page = 1, limit = 20 } = params;
        let where = 'WHERE tenant_id = ?';
        const vals = [tenantId];
        if (status) {
            where += ' AND status = ?';
            vals.push(status);
        }
        if (employeeId) {
            where += ' AND employee_id = ?';
            vals.push(employeeId);
        }
        const [rows, cnt] = await Promise.all([
            (0, database_js_1.query)(`SELECT * FROM disciplinary_cases ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...vals, Number(limit), (Number(page) - 1) * Number(limit)]),
            (0, database_js_1.query)(`SELECT COUNT(*) as total FROM disciplinary_cases ${where}`, vals),
        ]);
        const total = cnt[0]?.total || 0;
        return { data: rows, meta: { page: Number(page), limit: Number(limit), total } };
    }
    async createDisciplinaryCase(tenantId, input) {
        const code = `DISC-${Date.now().toString(36).toUpperCase()}`;
        const id = await (0, database_js_1.insert)(`INSERT INTO disciplinary_cases (id, tenant_id, employee_id, case_code, category, incident_date, description, status)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, 'Open')`, [tenantId, input.employeeId, code, input.category, input.incidentDate, input.description]);
        return (0, database_js_1.queryOne)('SELECT * FROM disciplinary_cases WHERE id = ?', [id]);
    }
}
exports.DisciplinaryService = DisciplinaryService;
// ── Exit ──────────────────────────────────────────────────────────────────────
class ExitService {
    async listExitCases(tenantId, params) {
        const { status, employeeId, page = 1, limit = 20 } = params;
        let where = 'WHERE ec.tenant_id = ?';
        const vals = [tenantId];
        if (status) {
            where += ' AND ec.status = ?';
            vals.push(status);
        }
        if (employeeId) {
            where += ' AND ec.employee_id = ?';
            vals.push(employeeId);
        }
        const [rows, cnt] = await Promise.all([
            (0, database_js_1.query)(`SELECT ec.*, e.first_name, e.last_name FROM exit_cases ec
         LEFT JOIN employees e ON ec.employee_id = e.id
         ${where} ORDER BY ec.created_at DESC LIMIT ? OFFSET ?`, [...vals, Number(limit), (Number(page) - 1) * Number(limit)]),
            (0, database_js_1.query)(`SELECT COUNT(*) as total FROM exit_cases ec ${where}`, vals),
        ]);
        const total = cnt[0]?.total || 0;
        return { data: rows, meta: { page: Number(page), limit: Number(limit), total } };
    }
    async initiateExit(tenantId, input) {
        const existing = await (0, database_js_1.queryOne)('SELECT id FROM exit_cases WHERE employee_id = ? AND status NOT IN (?,?)', [input.employeeId, 'Completed', 'Cancelled']);
        if (existing)
            throw new index_js_1.BusinessRuleError('An active exit case already exists for this employee');
        const id = await (0, database_js_1.insert)(`INSERT INTO exit_cases (id, tenant_id, employee_id, exit_type, resignation_date, last_working_day, reason, status)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, 'Initiated')`, [tenantId, input.employeeId, input.exitType, input.resignationDate, input.lastWorkingDay, input.reason]);
        return (0, database_js_1.queryOne)('SELECT * FROM exit_cases WHERE id = ?', [id]);
    }
    async processFnf(id, tenantId, fnfAmount) {
        const ec = await (0, database_js_1.queryOne)('SELECT * FROM exit_cases WHERE id = ? AND tenant_id = ?', [id, tenantId]);
        if (!ec)
            throw new index_js_1.NotFoundError('Exit case', id);
        await (0, database_js_1.query)('UPDATE exit_cases SET fnf_amount = ?, fnf_processed_at = NOW(), status = ?, updated_at = NOW() WHERE id = ?', [fnfAmount, 'FnfDone', id]);
        return (0, database_js_1.queryOne)('SELECT * FROM exit_cases WHERE id = ?', [id]);
    }
}
exports.ExitService = ExitService;
// ── Aggregate facade ──────────────────────────────────────────────────────────
class OperationsService {
    perf = new PerformanceService();
    asset = new AssetService();
    grievance = new GrievanceService();
    disc = new DisciplinaryService();
    exit = new ExitService();
    listCycles(t, c) { return this.perf.listCycles(t, c); }
    createCycle(t, i) { return this.perf.createCycle(t, i); }
    listReviews(t, p) { return this.perf.listReviews(t, p); }
    submitSelfReview(t, c, e, i) { return this.perf.submitSelfReview(t, c, e, i); }
    submitManagerReview(t, r, i) { return this.perf.submitManagerReview(t, r, i); }
    listAssets(t, p) { return this.asset.listAssets(t, p); }
    createAsset(t, i) { return this.asset.createAsset(t, i); }
    allocateAsset(id, t, i) { return this.asset.allocateAsset(id, t, i); }
    returnAsset(id, t) { return this.asset.returnAsset(id, t); }
    listGrievances(t, p) { return this.grievance.listGrievances(t, p); }
    submitGrievance(t, i) { return this.grievance.submitGrievance(t, i); }
    listDisciplinaryCases(t, p) { return this.disc.listDisciplinaryCases(t, p); }
    createDisciplinaryCase(t, i) { return this.disc.createDisciplinaryCase(t, i); }
    listExitCases(t, p) { return this.exit.listExitCases(t, p); }
    initiateExit(t, i) { return this.exit.initiateExit(t, i); }
    processFnf(id, t, a) { return this.exit.processFnf(id, t, a); }
}
exports.operationsService = new OperationsService();
//# sourceMappingURL=operations.service.js.map