import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../../common/base/index.js';
import { AuthenticatedRequest } from '../../common/types/index.js';
export declare class AuthController extends BaseController {
    login(req: Request, res: Response, next: NextFunction): Promise<void>;
    refresh(req: Request, res: Response, next: NextFunction): Promise<void>;
    logout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    me(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const authController: AuthController;
//# sourceMappingURL=auth.controller.d.ts.map