import express from "express";
import { authMiddleware, authorizeAdmin } from "../middlewares/auth-middleware.js";
import { validateData } from "../middlewares/zod-validation.js";
import {
  upsertSalaryStructureSchema,
  generatePayrollSchema,
  updatePayrollStatusSchema,
} from "../validators/payroll-schema.js";
import {
  upsertSalaryStructure,
  getSalaryStructure,
  getMySalaryStructure,
  generatePayroll,
  listPayroll,
  updatePayrollStatus,
  getMyPayroll,
} from "../controllers/payroll.controller.js";

const router = express.Router();

// Self-service (read-only, spec 3.6.1)
router.get("/me", authMiddleware, getMyPayroll);
router.get("/me/salary-structure", authMiddleware, getMySalaryStructure);

// Admin (full read/write, spec 3.6.2)
router.post(
  "/salary-structure",
  authMiddleware,
  authorizeAdmin,
  validateData(upsertSalaryStructureSchema),
  upsertSalaryStructure
);
router.get(
  "/salary-structure/:userId",
  authMiddleware,
  authorizeAdmin,
  getSalaryStructure
);
router.post(
  "/generate",
  authMiddleware,
  authorizeAdmin,
  validateData(generatePayrollSchema),
  generatePayroll
);
router.get("/", authMiddleware, authorizeAdmin, listPayroll);
router.patch(
  "/:id/status",
  authMiddleware,
  authorizeAdmin,
  validateData(updatePayrollStatusSchema),
  updatePayrollStatus
);

export { router as payrollRouter };