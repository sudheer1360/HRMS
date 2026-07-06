"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.policyController = exports.PolicyController = void 0;
const platform_service_js_1 = require("../platform/platform.service.js");
const policy_schema_js_1 = require("./policy.schema.js");
class PolicyController {
    async list(req, res, next) {
        try {
            const r = await platform_service_js_1.policyService.list(req.tenantId, req.query);
            res.json({ success: true, ...r });
        }
        catch (e) {
            next(e);
        }
    }
    async create(req, res, next) {
        try {
            const i = policy_schema_js_1.createPolicySchema.parse(req.body);
            const r = await platform_service_js_1.policyService.create(req.tenantId, req.user.userId, i);
            res.status(201).json({ success: true, data: r });
        }
        catch (e) {
            next(e);
        }
    }
    async getById(req, res, next) {
        try {
            const r = await platform_service_js_1.policyService.getById(req.params.id, req.tenantId);
            res.json({ success: true, data: r });
        }
        catch (e) {
            next(e);
        }
    }
    async publish(req, res, next) {
        try {
            const r = await platform_service_js_1.policyService.publish(req.params.id, req.tenantId);
            res.json({ success: true, data: r });
        }
        catch (e) {
            next(e);
        }
    }
    async stats(req, res, next) {
        try {
            const r = await platform_service_js_1.policyService.stats(req.params.id, req.tenantId);
            res.json({ success: true, data: r });
        }
        catch (e) {
            next(e);
        }
    }
    async myPolicies(req, res, next) {
        try {
            const r = await platform_service_js_1.policyService.getMyPolicies(req.tenantId, req.user.userId);
            res.json({ success: true, data: r });
        }
        catch (e) {
            next(e);
        }
    }
    async acknowledge(req, res, next) {
        try {
            const i = policy_schema_js_1.acknowledgeSchema.parse(req.body);
            const r = await platform_service_js_1.policyService.acknowledge(req.tenantId, req.user.userId, i.policyId);
            res.json({ success: true, data: r });
        }
        catch (e) {
            next(e);
        }
    }
}
exports.PolicyController = PolicyController;
exports.policyController = new PolicyController();
//# sourceMappingURL=policy.controller.js.map