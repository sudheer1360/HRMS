"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExitSchema = exports.createDisciplinarySchema = exports.createGrievanceSchema = exports.allocateAssetSchema = exports.createAssetSchema = exports.submitReviewSchema = exports.createCycleSchema = void 0;
const zod_1 = require("zod");
exports.createCycleSchema = zod_1.z.object({
    companyId: zod_1.z.string().min(1),
    cycleName: zod_1.z.string().min(2),
    cycleType: zod_1.z.enum(['Monthly', 'Quarterly', 'Half-yearly', 'Yearly']),
    reviewPeriodStart: zod_1.z.coerce.date(),
    reviewPeriodEnd: zod_1.z.coerce.date(),
});
exports.submitReviewSchema = zod_1.z.object({
    selfRating: zod_1.z.number().min(1).max(10).optional(),
    selfComments: zod_1.z.string().optional(),
    managerRating: zod_1.z.number().min(1).max(10).optional(),
    managerComments: zod_1.z.string().optional(),
});
exports.createAssetSchema = zod_1.z.object({
    companyId: zod_1.z.string().min(1),
    assetName: zod_1.z.string().min(2),
    assetCode: zod_1.z.string().min(2),
    category: zod_1.z.enum(['Laptop', 'Monitor', 'Phone', 'Vehicle', 'Furniture', 'Other']),
    serialNumber: zod_1.z.string().optional(),
    purchaseValue: zod_1.z.number().positive().optional(),
    location: zod_1.z.string().optional(),
});
exports.allocateAssetSchema = zod_1.z.object({
    assignedTo: zod_1.z.string().min(1),
    assignedDate: zod_1.z.coerce.date().optional(),
});
exports.createGrievanceSchema = zod_1.z.object({
    complaintType: zod_1.z.enum(['Harassment', 'Discrimination', 'Unfair Treatment', 'POSH', 'Other']),
    respondentId: zod_1.z.string().min(1).optional(),
    isAnonymous: zod_1.z.boolean().default(false),
    description: zod_1.z.string().min(10),
});
exports.createDisciplinarySchema = zod_1.z.object({
    employeeId: zod_1.z.string().min(1),
    incidentDate: zod_1.z.coerce.date(),
    incidentDesc: zod_1.z.string().min(10),
    actionType: zod_1.z.enum(['Warning', 'Written Warning', 'Final Warning', 'Suspension', 'Termination']).optional(),
});
exports.createExitSchema = zod_1.z.object({
    employeeId: zod_1.z.string().min(1),
    exitType: zod_1.z.enum(['Resignation', 'Termination', 'Retirement']),
    resignationDate: zod_1.z.coerce.date(),
    lastWorkingDay: zod_1.z.coerce.date(),
    reason: zod_1.z.string().optional(),
});
//# sourceMappingURL=operations.schema.js.map