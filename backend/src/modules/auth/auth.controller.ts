import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import { loginSchema, refreshSchema, resetPasswordSchema } from './auth.schema.js';
import { ValidationError } from '../../common/errors/index.js';
import { BaseController } from '../../common/base/index.js';
import { AuthenticatedRequest } from '../../common/types/index.js';
import { queryOne } from '../../config/database.js';

export class AuthController extends BaseController {
  // ── POST /auth/login ──────────────────────────────────────────────────────

  async login(req: Request, res: Response, next: NextFunction) {
    await this.handle(next, async () => {
      const input = loginSchema.parse(req.body);
      const result = await authService.login(input, req.ip, req.headers['user-agent'] || undefined);

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

  async refresh(req: Request, res: Response, next: NextFunction) {
    await this.handle(next, async () => {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
      if (!refreshToken) throw new ValidationError('Refresh token required');

      const result = await authService.refresh(refreshToken);

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

  async logout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    await this.handle(next, async () => {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
      const authHeader = req.headers.authorization;
      const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : '';

      await authService.logout(refreshToken, accessToken);
      res.clearCookie('refreshToken', { path: '/' });
      this.ok(res, { message: 'Logged out successfully' });
    });
  }

  // ── GET /auth/me ──────────────────────────────────────────────────────────

  async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    await this.handle(next, async () => {
      // Look up the user's company (first company for the tenant)
      const company = await queryOne<any>('SELECT id FROM companies WHERE tenant_id = ? LIMIT 1', [req.user?.tenantId]);
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

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    await this.handle(next, async () => {
      // TODO: implement email-based reset flow
      this.ok(res, { message: 'If the email exists, a reset link has been sent.' });
    });
  }
}

export const authController = new AuthController();
