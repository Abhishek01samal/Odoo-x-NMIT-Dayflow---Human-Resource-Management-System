import express from "express";
import { authMiddleware, authorizeStaff } from "../middlewares/auth-middleware.js";
import { getAdminDashboard } from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/dashboard", authMiddleware, authorizeStaff, getAdminDashboard);

export { router as adminRouter };