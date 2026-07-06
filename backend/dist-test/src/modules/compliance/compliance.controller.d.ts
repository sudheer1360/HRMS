import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common/types/index.js';
export declare class ComplianceController {
    listCalendar(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createCalendarEvent(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listFilings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createFiling(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listReports(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listChecklist(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateChecklistItem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listDocuments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createDocument(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const complianceController: ComplianceController;
//# sourceMappingURL=compliance.controller.d.ts.map