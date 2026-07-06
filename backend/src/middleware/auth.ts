import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { AuthenticatedRequest, JwtPayload } from '../common/types/index.js';
import { AuthenticationError } from '../common/errors/index.js';
import { redis } from '../config/redis.js';
import logger from '../config/logger.js';

export async function authenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing or invalid authorization header');
    }

    const token = authHeader.split(' ')[1];

    // Check if token is revoked (logout)
    const isRevoked = await redis.get(`revoked:${token}`);
    if (isRevoked) {
      throw new AuthenticationError('Token has been revoked');
    }

    const decoded = jwt.verify(token, config.jwt.privateKey, {
      algorithms: ['HS256'],
    }) as JwtPayload;

    req.user = {
      userId: decoded.sub,
      tenantId: decoded.tenantId,
      email: decoded.email,
      roles: decoded.roles,
    };
    req.tenantId = decoded.tenantId;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new AuthenticationError('Token expired'));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new AuthenticationError('Invalid token'));
    } else {
      next(error);
    }
  }
}
