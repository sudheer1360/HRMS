import { Request } from 'express';
export interface AuthenticatedRequest<P = Record<string, string>, ResBody = any, ReqBody = any, ReqQuery = any, Locals extends Record<string, any> = Record<string, any>> extends Request<P, ResBody, ReqBody, ReqQuery, Locals> {
    user?: {
        userId: string;
        tenantId: string;
        email: string;
        roles: string[];
    };
    tenantId?: string;
    requestId?: string;
}
export interface PaginationParams {
    page: number;
    limit: number;
    sort?: string;
    order?: 'asc' | 'desc';
}
export interface PaginatedResponse<T> {
    success: true;
    data: T[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
export interface ApiResponse<T> {
    success: true;
    data: T;
    meta?: Record<string, unknown>;
}
export interface ApiError {
    success: false;
    error: {
        code: string;
        message: string;
        details?: {
            field: string;
            message: string;
        }[];
        requestId?: string;
    };
}
export interface JwtPayload {
    sub: string;
    tenantId: string;
    email: string;
    roles: string[];
    iat?: number;
    exp?: number;
}
//# sourceMappingURL=index.d.ts.map