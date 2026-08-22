import express from "express";
import {
  authMiddleware,
  authorizeStaff,
} from "../middlewares/auth-middleware.js";
import { validateData } from "../middlewares/zod-validation.js";
import {
  updateMyProfileSchema,
  updateEmployeeSchema,
} from "../validators/employee-schema.js";
import {
  getMyProfile,
  updateMyProfile,
  listEmployees,
  getEmployeeById,
  updateEmployee,
} from "../controllers/employee.controller.js";

const router = express.Router();

// Self-service (any authenticated user)
router.get("/me", authMiddleware, getMyProfile);
router.patch(
  "/me",
  authMiddleware,
  validateData(updateMyProfileSchema),
  updateMyProfile
);

// Admin / HR management
router.get("/", authMiddleware, authorizeStaff, listEmployees);
router.get("/:userId", authMiddleware, authorizeStaff, getEmployeeById);
router.patch(
  "/:userId",
  authMiddleware,
  authorizeStaff,
  validateData(updateEmployeeSchema),
  updateEmployee
);

export { router as employeeRouter };
