"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const router = (0, express_1.Router)();
const authController = new AuthController_1.AuthController();
// Login endpoint
router.post("/login", (req, res) => authController.login(req, res));
// Verify token endpoint
router.get("/verify", (req, res) => authController.verifyToken(req, res));
// Logout endpoint
router.post("/logout", (req, res) => authController.logout(req, res));
exports.default = router;
