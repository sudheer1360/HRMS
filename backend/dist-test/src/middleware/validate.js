"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
const index_js_1 = require("../common/errors/index.js");
const zod_1 = require("zod");
/**
 * Request validation middleware using Zod schemas.
 * Validates body, query, and params.
 */
function validate(schemas) {
    return (req, _res, next) => {
        try {
            if (schemas.body) {
                req.body = schemas.body.parse(req.body);
            }
            if (schemas.query) {
                req.query = schemas.query.parse(req.query);
            }
            if (schemas.params) {
                req.params = schemas.params.parse(req.params);
            }
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const details = error.errors.map((e) => ({
                    field: e.path.join('.'),
                    message: e.message,
                }));
                next(new index_js_1.ValidationError('Validation failed', details));
            }
            else {
                next(error);
            }
        }
    };
}
//# sourceMappingURL=validate.js.map