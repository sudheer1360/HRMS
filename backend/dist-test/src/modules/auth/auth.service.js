"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const database_js_1 = require("../../config/database.js");
const redis_js_1 = require("../../config/redis.js");
const index_js_1 = require("../../config/index.js");
const index_js_2 = require("../../common/errors/index.js");
const index_js_3 = require("../../common/base/index.js");
const logger_js_1 = __importDefault(require("../../config/logger.js"));
class AuthService extends index_js_3.BaseService {
    // ── Login ─────────────────────────────────────────────────────────────────
    async login(input, ipAddress, userAgent) {
        const user = await (0, database_js_1.queryOne)('SELECT * FROM users WHERE email = ? AND deleted_at IS NULL', [input.email]);
        if (!user) {
            await this.logLogin(null, input.email, 'FAILED', ipAddress, userAgent);
            throw new index_js_2.AuthenticationError('Invalid email or password');
        }
        if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
            throw new index_js_2.BusinessRuleError('Account locked. Try again later.', 'ACCOUNT_LOCKED');
        }
        const valid = await bcrypt_1.default.compare(input.password, user.passwordHash);
        if (!valid) {
            await this.handleFailedLogin(user.id, user.email, ipAddress, userAgent);
            throw new index_js_2.AuthenticationError('Invalid email or password');
        }
        // MFA gate
        if (user.mfaEnabled) {
            const sessionToken = crypto_1.default.randomBytes(32).toString('hex');
            try {
                await redis_js_1.redis.setex(`mfa:${sessionToken}`, 300, JSON.stringify({ userId: user.id, tenantId: user.tenantId }));
            }
            catch { /* non-fatal — MFA session stored in-process if Redis down */ }
            return { mfaRequired: true, sessionToken, message: 'MFA verification required' };
        }
        // Successful login
        await (0, database_js_1.query)('UPDATE users SET failed_login_attempts = 0, last_login_at = NOW(), last_login_ip = ? WHERE id = ?', [ipAddress, user.id]);
        await this.logLogin(user.id, user.email, 'SUCCESS', ipAddress, userAgent);
        const roles = await this.getUserRoles(user.id);
        const tokens = await this.generateTokens(user, roles);
        try {
            await redis_js_1.redis.del(`rbac:${user.tenantId}:${user.id}`);
        }
        catch { /* non-fatal */ }
        return {
            mfaRequired: false,
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                tenantId: user.tenantId,
                employeeId: user.employeeId,
                roles,
            },
        };
    }
    // ── Refresh ───────────────────────────────────────────────────────────────
    async refresh(refreshTokenValue) {
        const stored = await (0, database_js_1.queryOne)('SELECT * FROM refresh_tokens WHERE token = ?', [refreshTokenValue]);
        if (!stored || stored.revokedAt || new Date(stored.expiresAt) < new Date()) {
            throw new index_js_2.AuthenticationError('Invalid or expired refresh token');
        }
        const user = await (0, database_js_1.queryOne)('SELECT * FROM users WHERE id = ?', [stored.userId]);
        if (!user)
            throw new index_js_2.AuthenticationError('User not found');
        const roles = await this.getUserRoles(user.id);
        await (0, database_js_1.query)('UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = ?', [stored.id]);
        const tokens = await this.generateTokens(user, roles);
        return {
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                tenantId: user.tenantId,
                roles,
            },
        };
    }
    // ── Logout ────────────────────────────────────────────────────────────────
    async logout(refreshTokenValue, accessToken) {
        if (refreshTokenValue) {
            await (0, database_js_1.query)('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token = ? AND revoked_at IS NULL', [refreshTokenValue]);
        }
        if (accessToken) {
            const decoded = jsonwebtoken_1.default.decode(accessToken);
            if (decoded?.exp) {
                const ttl = decoded.exp - Math.floor(Date.now() / 1000);
                if (ttl > 0) {
                    try {
                        await redis_js_1.redis.setex(`revoked:${accessToken}`, ttl, '1');
                    }
                    catch { /* non-fatal */ }
                }
            }
        }
        return { message: 'Logged out successfully' };
    }
    // ── Private helpers ───────────────────────────────────────────────────────
    async getUserRoles(userId) {
        const rows = await (0, database_js_1.query)(`SELECT r.name FROM user_roles ur
       JOIN roles r ON ur.role_id = r.id
       WHERE ur.user_id = ? AND (ur.valid_to IS NULL OR ur.valid_to >= NOW())`, [userId]);
        return rows.map((r) => r.name);
    }
    async generateTokens(user, roles) {
        const payload = {
            sub: user.id,
            tenantId: user.tenantId,
            email: user.email,
            roles,
        };
        const accessToken = jsonwebtoken_1.default.sign(payload, index_js_1.config.jwt.privateKey, {
            algorithm: 'HS256',
            expiresIn: index_js_1.config.jwt.accessExpiry,
        });
        const refreshToken = crypto_1.default.randomBytes(64).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await (0, database_js_1.insert)('INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (UUID(), ?, ?, ?)', [user.id, refreshToken, expiresAt]);
        return { accessToken, refreshToken };
    }
    async handleFailedLogin(userId, email, ipAddress, userAgent) {
        await (0, database_js_1.query)('UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = ?', [userId]);
        const user = await (0, database_js_1.queryOne)('SELECT failed_login_attempts FROM users WHERE id = ?', [userId]);
        if (user && user.failedLoginAttempts >= 5) {
            const lockUntil = new Date();
            lockUntil.setMinutes(lockUntil.getMinutes() + 30);
            await (0, database_js_1.query)('UPDATE users SET locked_until = ? WHERE id = ?', [lockUntil, userId]);
        }
        await this.logLogin(userId, email, 'FAILED', ipAddress, userAgent);
    }
    async logLogin(userId, email, status, ip, ua) {
        try {
            await (0, database_js_1.insert)('INSERT INTO login_logs (id, user_id, email, status, ip_address, user_agent) VALUES (UUID(), ?, ?, ?, ?, ?)', [userId, email, status, ip, ua]);
        }
        catch (err) {
            // Non-fatal — log audit failure but don't break the login flow
            logger_js_1.default.warn({ err, userId, email }, 'Failed to write login_log');
        }
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.js.map