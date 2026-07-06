/**
 * BaseService — Abstract base for all HRMS service classes.
 *
 * Provides reusable helpers so every service keeps DRY:
 *  - buildPagination()        → normalised page/limit/offset from query params
 *  - buildPaginatedMeta()     → standard meta object for list responses
 *  - buildUpdateFields()      → { fields[], vals[] } for dynamic UPDATE queries
 *  - sanitiseSortColumn()     → safe ORDER BY column whitelisting
 */
export declare abstract class BaseService {
    protected buildPagination(params: Record<string, any>): {
        page: number;
        limit: number;
        offset: number;
    };
    protected buildPaginatedMeta(total: number, page: number, limit: number): {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
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
    protected buildUpdateFields(input: Record<string, any>, fieldMap: Record<string, string>): {
        fields: string[];
        vals: any[];
    };
    /**
     * Whitelist-validates a sort column so user input cannot inject SQL.
     * Falls back to `defaultCol` if the supplied value isn't in the allowlist.
     */
    protected sanitiseSortColumn(col: string | undefined, allowed: string[], defaultCol?: string): string;
    /**
     * Validates ORDER direction; only 'asc' or 'desc' are accepted.
     */
    protected sanitiseSortOrder(order: string | undefined): 'ASC' | 'DESC';
}
//# sourceMappingURL=BaseService.d.ts.map