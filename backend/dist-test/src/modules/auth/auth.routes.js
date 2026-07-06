"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_js_1 = require("./auth.controller.js");
const auth_js_1 = require("../../middleware/auth.js");
const router = (0, express_1.Router)();
// Public routes
router.post('/login', (req, res, next) => auth_controller_js_1.authController.login(req, res, next));
router.post('/refresh', (req, res, next) => auth_controller_js_1.authController.refresh(req, res, next));
router.post('/forgot-password', (req, res, next) => auth_controller_js_1.authController.forgotPassword(req, res, next));
// Protected routes
router.post('/logout', auth_js_1.authenticate, (req, res, next) => auth_controller_js_1.authController.logout(req, res, next));
router.get('/me', auth_js_1.authenticate, (req, res, next) => auth_controller_js_1.authController.me(req, res, next));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map