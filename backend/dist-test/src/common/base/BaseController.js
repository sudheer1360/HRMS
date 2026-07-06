"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseController = void 0;
class BaseController {
    // ── Response helpers ──────────────────────────────────────────────────────
    ok(res, data) {
        const body = { success: true, data };
        res.json(body);
    }
    created(res, data) {
        res.status(201).json({ success: true, data });
    }
    paginated(res, data, meta) {
        res.json({ success: true, data, meta });
    }
    noContent(res) {
        res.status(204).send();
    }
    // ── Error forwarding ──────────────────────────────────────────────────────
    /**
     * Wraps an async controller body and automatically forwards any thrown error
     * to Express's next() error handler.  Eliminates boilerplate try/catch.
     *
     * @example
     * async getEmployee(req, res, next) {
     *   await this.handle(next, async () => {
     *     const emp = await employeeService.getById(req.params.id, req.tenantId!);
     *     this.ok(res, emp);
     *   });
     * }
     */
    async handle(next, fn) {
        try {
            await fn();
        }
        catch (err) {
            next(err);
        }
    }
}
exports.BaseController = BaseController;
//# sourceMappingURL=BaseController.js.map