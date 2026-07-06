"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const morgan_1 = __importDefault(require("morgan"));
const index_js_1 = require("./config/index.js");
const errorHandler_js_1 = require("./middleware/errorHandler.js");
const tenant_js_1 = require("./middleware/tenant.js");
// Import routes
const auth_routes_js_1 = __importDefault(require("./modules/auth/auth.routes.js"));
const organization_routes_js_1 = __importDefault(require("./modules/organization/organization.routes.js"));
const employee_routes_js_1 = __importDefault(require("./modules/employee/employee.routes.js"));
const attendance_routes_js_1 = __importDefault(require("./modules/attendance/attendance.routes.js"));
const leave_routes_js_1 = __importDefault(require("./modules/leave/leave.routes.js"));
const shift_routes_js_1 = __importDefault(require("./modules/shift/shift.routes.js"));
const policy_routes_js_1 = __importDefault(require("./modules/policy/policy.routes.js"));
const recruitment_routes_js_1 = __importDefault(require("./modules/recruitment/recruitment.routes.js"));
const payroll_routes_js_1 = __importDefault(require("./modules/payroll/payroll.routes.js"));
const operations_routes_js_1 = __importDefault(require("./modules/operations/operations.routes.js"));
const platform_routes_js_1 = __importDefault(require("./modules/platform/platform.routes.js"));
const formbuilder_routes_js_1 = __importDefault(require("./modules/formbuilder/formbuilder.routes.js"));
const performance_routes_js_1 = __importDefault(require("./modules/performance/performance.routes.js"));
const travel_routes_js_1 = __importDefault(require("./modules/travel/travel.routes.js"));
const compliance_routes_js_1 = __importDefault(require("./modules/compliance/compliance.routes.js"));
const compensation_routes_js_1 = __importDefault(require("./modules/compensation/compensation.routes.js"));
const app = (0, express_1.default)();
// ─── Global Middleware ──────────────────────────────────────────
// Request ID
app.use(errorHandler_js_1.requestId);
// Security
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || index_js_1.config.corsOrigin.includes('*') || index_js_1.config.corsOrigin.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('CORS policy violation'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Id', 'X-Request-ID'],
}));
// Compression
app.use((0, compression_1.default)());
// Body parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Logging
app.use((0, morgan_1.default)('short'));
// Rate limiting
app.use((0, express_rate_limit_1.default)({
    windowMs: index_js_1.config.rateLimit.windowMs,
    max: index_js_1.config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: {
            code: 'RATE_LIMIT_ERROR',
            message: 'Too many requests, please try again later.',
        },
    },
}));
// Tenant context
app.use(tenant_js_1.tenantResolver);
// ─── Health Check ──────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({
        success: true,
        data: {
            status: 'healthy',
            version: '1.0.0',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
        },
    });
});
// ─── API Routes ────────────────────────────────────────────────
app.use('/api/v1/auth', auth_routes_js_1.default);
app.use('/api/v1/organization', organization_routes_js_1.default);
app.use('/api/v1/employees', employee_routes_js_1.default);
app.use('/api/v1/attendance', attendance_routes_js_1.default);
app.use('/api/v1/leaves', leave_routes_js_1.default);
app.use('/api/v1/shifts', shift_routes_js_1.default);
app.use('/api/v1/policies', policy_routes_js_1.default);
app.use('/api/v1/recruitment', recruitment_routes_js_1.default);
app.use('/api/v1/payroll', payroll_routes_js_1.default);
app.use('/api/v1/operations', operations_routes_js_1.default);
app.use('/api/v1/platform', platform_routes_js_1.default);
app.use('/api/v1/extended', formbuilder_routes_js_1.default);
app.use('/api/v1/performance', performance_routes_js_1.default);
app.use('/api/v1/travel', travel_routes_js_1.default);
app.use('/api/v1/compliance', compliance_routes_js_1.default);
app.use('/api/v1/compensation', compensation_routes_js_1.default);
// ─── 404 Handler ───────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: 'The requested resource was not found',
        },
    });
});
// ─── Global Error Handler ───────────────────────────────────────
app.use(errorHandler_js_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map