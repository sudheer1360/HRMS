"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const auth_service_js_1 = require("./auth.service.js");
const auth_schema_js_1 = require("./auth.schema.js");
const index_js_1 = require("../../common/errors/index.js");
const index_js_2 = require("../../common/base/index.js");
const database_js_1 = require("../../config/database.js");
class AuthController extends index_js_2.BaseController {
    // ── POST /auth/login ──────────────────────────────────────────────────────
    async login(req, res, next) {
        await this.handle(next, async () => {
            const input = auth_schema_js_1.loginSchema.parse(req.body);
            const result = await auth_service_js_1.authService.login(input, req.ip, req.headers['user-agent'] || undefined);
            if ('refreshToken' in result && result.refreshToken) {
                res.cookie('refreshToken', result.refreshToken, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'lax',
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                    path: '/',
                });
            }
            this.ok(res, result);
        });
    }
    // ── POST /auth/refresh ────────────────────────────────────────────────────
    async refresh(req, res, next) {
        await this.handle(next, async () => {
            const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
            if (!refreshToken)
                throw new index_js_1.ValidationError('Refresh token required');
            const result = await auth_service_js_1.authService.refresh(refreshToken);
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: '/',
            });
            this.ok(res, result);
        });
    }
    // ── POST /auth/logout ─────────────────────────────────────────────────────
    async logout(req, res, next) {
        await this.handle(next, async () => {
            const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
            const authHeader = req.headers.authorization;
            const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : '';
            await auth_service_js_1.authService.logout(refreshToken, accessToken);
            res.clearCookie('refreshToken', { path: '/' });
            this.ok(res, { message: 'Logged out successfully' });
        });
    }
    // ── GET /auth/me ──────────────────────────────────────────────────────────
    async me(req, res, next) {
        await this.handle(next, async () => {
            // Look up the user's company (first company for the tenant)
            const company = await (0, database_js_1.queryOne)('SELECT id FROM companies WHERE tenant_id = ? LIMIT 1', [req.user?.tenantId]);
            this.ok(res, {
                userId: req.user?.userId,
                email: req.user?.email,
                tenantId: req.user?.tenantId,
                companyId: company?.id ?? null,
                roles: req.user?.roles,
            });
        });
    }
    // ── POST /auth/forgot-password ────────────────────────────────────────────
    async forgotPassword(req, res, next) {
        await this.handle(next, async () => {
            // TODO: implement email-based reset flow
            this.ok(res, { message: 'If the email exists, a reset link has been sent.' });
        });
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
//# sourceMappingURL=auth.controller.js.map