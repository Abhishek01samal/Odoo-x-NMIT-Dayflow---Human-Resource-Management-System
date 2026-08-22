import express from "express";
import { authMiddleware, authorizeStaff } from "../middlewares/auth-middleware.js";
import { validateData } from "../middlewares/zod-validation.js";
import { applyLeaveSchema, reviewLeaveSchema } from "../validators/leave-schema.js";
import {
  applyLeave,
  getMyLeaves,
  getMyLeaveBalance,
  listAllLeaves,
  reviewLeave,
} from "../controllers/leave.controller.js";

const router = express.Router();

// Self-service (any authenticated user)
router.post("/", authMiddleware, validateData(applyLeaveSchema), applyLeave);
router.get("/me", authMiddleware, getMyLeaves);
router.get("/balance", authMiddleware, getMyLeaveBalance);

// Admin / HR
router.get("/", authMiddleware, authorizeStaff, listAllLeaves);
router.patch(
  "/:id/review",
  authMiddleware,
  authorizeStaff,
  validateData(reviewLeaveSchema),
  reviewLeave
);

export { router as leaveRouter };