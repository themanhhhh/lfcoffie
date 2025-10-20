import { Router } from "express";
import { AuthController } from "../controllers/AuthController";

const router = Router();
const authController = new AuthController();

// Login endpoint
router.post("/login", (req, res) => authController.login(req, res));

// Verify token endpoint
router.get("/verify", (req, res) => authController.verifyToken(req, res));

// Logout endpoint
router.post("/logout", (req, res) => authController.logout(req, res));

export default router;
