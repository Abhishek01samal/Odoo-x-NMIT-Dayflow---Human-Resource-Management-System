import express from "express";
import { authMiddleware, authorizeStaff } from "../middlewares/auth-middleware.js";
import { validateData } from "../middlewares/zod-validation.js";
import { regularizeAttendanceSchema } from "../validators/attendance-schema.js";
import {
  checkIn,
  checkOut,
  getMyDashboard,
  getMyAttendance,
  listAllAttendance,
  regularizeAttendance,
} from "../controllers/attendance.controller.js";

const router = express.Router();

// Self-service (any authenticated user)
router.post("/check-in", authMiddleware, checkIn);
router.post("/check-out", authMiddleware, checkOut);
router.get("/my-dashboard", authMiddleware, getMyDashboard);
router.get("/me", authMiddleware, getMyAttendance);

// Admin / HR
router.get("/", authMiddleware, authorizeStaff, listAllAttendance);
router.patch(
  "/:id/regularize",
  authMiddleware,
  authorizeStaff,
  validateData(regularizeAttendanceSchema),
  regularizeAttendance
);

export { router as attendanceRouter };