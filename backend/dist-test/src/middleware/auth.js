"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_js_1 = require("../config/index.js");
const index_js_2 = require("../common/errors/index.js");
const redis_js_1 = require("../config/redis.js");
async function authenticate(req, _res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            throw new index_js_2.AuthenticationError('Missing or invalid authorization header');
        }
        const token = authHeader.split(' ')[1];
        // Check if token is revoked (logout)
        const isRevoked = await redis_js_1.redis.get(`revoked:${token}`);
        if (isRevoked) {
            throw new index_js_2.AuthenticationError('Token has been revoked');
        }
        const decoded = jsonwebtoken_1.default.verify(token, index_js_1.config.jwt.privateKey, {
            algorithms: ['HS256'],
        });
        req.user = {
            userId: decoded.sub,
            tenantId: decoded.tenantId,
            email: decoded.email,
            roles: decoded.roles,
        };
        req.tenantId = decoded.tenantId;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            next(new index_js_2.AuthenticationError('Token expired'));
        }
        else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            next(new index_js_2.AuthenticationError('Invalid token'));
        }
        else {
            next(error);
        }
    }
}
//# sourceMappingURL=auth.js.map