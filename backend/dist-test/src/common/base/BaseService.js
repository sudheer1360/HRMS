"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseService = void 0;
/**
 * BaseService — Abstract base for all HRMS service classes.
 *
 * Provides reusable helpers so every service keeps DRY:
 *  - buildPagination()        → normalised page/limit/offset from query params
 *  - buildPaginatedMeta()     → standard meta object for list responses
 *  - buildUpdateFields()      → { fields[], vals[] } for dynamic UPDATE queries
 *  - sanitiseSortColumn()     → safe ORDER BY column whitelisting
 */
class BaseService {
    // ── Pagination ────────────────────────────────────────────────────────────
    buildPagination(params) {
        const page = Math.max(1, Number(params.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
        return { page, limit, offset: (page - 1) * limit };
    }
    buildPaginatedMeta(total, page, limit) {
        return {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1,
        };
    }
    // ── Dynamic UPDATE queries ────────────────────────────────────────────────
    /**
     * Converts a camelCase input object into SQL SET clause fragments.
     *
     * @param input    – partial request body (camelCase keys)
     * @param fieldMap – mapping { camelCaseKey: 'db_column_name' }
     * @returns { fields: ['col = ?', ...], vals: [value, ...] }
     *
     * @example
     * const { fields, vals } = this.buildUpdateFields(input, {
     *   companyName: 'company_name',
     *   email: 'email',
     * });
     * if (!fields.length) throw new ValidationError('Nothing to update');
     * await execute(`UPDATE companies SET ${fields.join(', ')} WHERE id = ?`, [...vals, id]);
     */
    buildUpdateFields(input, fieldMap) {
        const fields = [];
        const vals = [];
        for (const [jsKey, dbCol] of Object.entries(fieldMap)) {
            if (input[jsKey] !== undefined) {
                fields.push(`${dbCol} = ?`);
                vals.push(input[jsKey]);
            }
        }
        return { fields, vals };
    }
    // ── Sort safety ───────────────────────────────────────────────────────────
    /**
     * Whitelist-validates a sort column so user input cannot inject SQL.
     * Falls back to `defaultCol` if the supplied value isn't in the allowlist.
     */
    sanitiseSortColumn(col, allowed, defaultCol = 'created_at') {
        return col && allowed.includes(col) ? col : defaultCol;
    }
    /**
     * Validates ORDER direction; only 'asc' or 'desc' are accepted.
     */
    sanitiseSortOrder(order) {
        return order?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    }
}
exports.BaseService = BaseService;
//# sourceMappingURL=BaseService.js.map