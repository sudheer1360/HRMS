export declare class AppError extends Error {
    readonly statusCode: number;
    readonly code: string;
    readonly isOperational: boolean;
    constructor(message: string, statusCode: number, code: string, isOperational?: boolean);
}
export declare class ValidationError extends AppError {
    readonly details?: {
        field: string;
        message: string;
    }[];
    constructor(message: string, details?: {
        field: string;
        message: string;
    }[]);
}
export declare class AuthenticationError extends AppError {
    constructor(message?: string);
}
export declare class AuthorizationError extends AppError {
    constructor(message?: string);
}
export declare class NotFoundError extends AppError {
    constructor(entity: string, id?: string);
}
export declare class ConflictError extends AppError {
    constructor(message: string);
}
export declare class BusinessRuleError extends AppError {
    constructor(message: string, code?: string);
}
export declare class RateLimitError extends AppError {
    constructor(message?: string);
}
//# sourceMappingURL=index.d.ts.map