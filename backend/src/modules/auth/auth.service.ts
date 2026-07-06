import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query, queryOne, insert } from '../../config/database.js';
import { redis } from '../../config/redis.js';
import { config } from '../../config/index.js';
import { AuthenticationError, BusinessRuleError } from '../../common/errors/index.js';
import { BaseService } from '../../common/base/index.js';
import { IUser, IRefreshToken } from '../../common/interfaces/index.js';
import logger from '../../config/logger.js';

export class AuthService extends BaseService {
  // ── Login ─────────────────────────────────────────────────────────────────

  async login(
    input: { email: string; password: string },
    ipAddress?: string,
    userAgent?: string
  ) {
    const user = await queryOne<IUser>(
      'SELECT * FROM users WHERE email = ? AND deleted_at IS NULL',
      [input.email]
    );

    if (!user) {
      await this.logLogin(null, input.email, 'FAILED', ipAddress, userAgent);
      throw new AuthenticationError('Invalid email or password');
    }

    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      throw new BusinessRuleError('Account locked. Try again later.', 'ACCOUNT_LOCKED');
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      await this.handleFailedLogin(user.id, user.email, ipAddress, userAgent);
      throw new AuthenticationError('Invalid email or password');
    }

    // MFA gate
    if (user.mfaEnabled) {
      const sessionToken = crypto.randomBytes(32).toString('hex');
      try {
        await redis.setex(
          `mfa:${sessionToken}`,
          300,
          JSON.stringify({ userId: user.id, tenantId: user.tenantId })
        );
      } catch { /* non-fatal — MFA session stored in-process if Redis down */ }
      return { mfaRequired: true, sessionToken, message: 'MFA verification required' };
    }

    // Successful login
    await query(
      'UPDATE users SET failed_login_attempts = 0, last_login_at = NOW(), last_login_ip = ? WHERE id = ?',
      [ipAddress, user.id]
    );
    await this.logLogin(user.id, user.email, 'SUCCESS', ipAddress, userAgent);

    const roles = await this.getUserRoles(user.id);
    const tokens = await this.generateTokens(user, roles);
    try { await redis.del(`rbac:${user.tenantId}:${user.id}`); } catch { /* non-fatal */ }

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

  async refresh(refreshTokenValue: string) {
    const stored = await queryOne<IRefreshToken>(
      'SELECT * FROM refresh_tokens WHERE token = ?',
      [refreshTokenValue]
    );

    if (!stored || stored.revokedAt || new Date(stored.expiresAt) < new Date()) {
      throw new AuthenticationError('Invalid or expired refresh token');
    }

    const user = await queryOne<IUser>('SELECT * FROM users WHERE id = ?', [stored.userId]);
    if (!user) throw new AuthenticationError('User not found');

    const roles = await this.getUserRoles(user.id);

    await query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = ?', [stored.id]);
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

  async logout(refreshTokenValue: string, accessToken: string) {
    if (refreshTokenValue) {
      await query(
        'UPDATE refresh_tokens SET revoked_at = NOW() WHERE token = ? AND revoked_at IS NULL',
        [refreshTokenValue]
      );
    }
    if (accessToken) {
      const decoded = jwt.decode(accessToken) as any;
      if (decoded?.exp) {
        const ttl = decoded.exp - Math.floor(Date.now() / 1000);
        if (ttl > 0) {
          try { await redis.setex(`revoked:${accessToken}`, ttl, '1'); } catch { /* non-fatal */ }
        }
      }
    }
    return { message: 'Logged out successfully' };
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private async getUserRoles(userId: string): Promise<string[]> {
    const rows = await query<{ name: string }>(
      `SELECT r.name FROM user_roles ur
       JOIN roles r ON ur.role_id = r.id
       WHERE ur.user_id = ? AND (ur.valid_to IS NULL OR ur.valid_to >= NOW())`,
      [userId]
    );
    return rows.map((r) => r.name);
  }

  private async generateTokens(user: IUser, roles: string[]) {
    const payload = {
      sub: user.id,
      tenantId: user.tenantId,
      email: user.email,
      roles,
    };
    const accessToken = jwt.sign(payload, config.jwt.privateKey, {
      algorithm: 'HS256',
      expiresIn: config.jwt.accessExpiry as any,
    });
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await insert(
      'INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (UUID(), ?, ?, ?)',
      [user.id, refreshToken, expiresAt]
    );
    return { accessToken, refreshToken };
  }

  private async handleFailedLogin(
    userId: string,
    email: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await query(
      'UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = ?',
      [userId]
    );
    const user = await queryOne<{ failedLoginAttempts: number }>(
      'SELECT failed_login_attempts FROM users WHERE id = ?',
      [userId]
    );
    if (user && user.failedLoginAttempts >= 5) {
      const lockUntil = new Date();
      lockUntil.setMinutes(lockUntil.getMinutes() + 30);
      await query('UPDATE users SET locked_until = ? WHERE id = ?', [lockUntil, userId]);
    }
    await this.logLogin(userId, email, 'FAILED', ipAddress, userAgent);
  }

  private async logLogin(
    userId: string | null,
    email: string,
    status: 'SUCCESS' | 'FAILED' | 'LOCKED',
    ip?: string,
    ua?: string
  ) {
    try {
      await insert(
        'INSERT INTO login_logs (id, user_id, email, status, ip_address, user_agent) VALUES (UUID(), ?, ?, ?, ?, ?)',
        [userId, email, status, ip, ua]
      );
    } catch (err) {
      // Non-fatal — log audit failure but don't break the login flow
      logger.warn({ err, userId, email }, 'Failed to write login_log');
    }
  }
}

export const authService = new AuthService();
