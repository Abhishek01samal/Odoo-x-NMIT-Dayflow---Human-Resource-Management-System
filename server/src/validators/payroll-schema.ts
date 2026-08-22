import { z } from "zod";

const upsertSalaryStructureSchema = z.object({
  userId: z.string().min(1, { message: "userId is required" }),
  basic: z.number().nonnegative(),
  hra: z.number().nonnegative(),
  allowances: z.number().nonnegative(),
  deductions: z.number().nonnegative(),
  effectiveFrom: z.string().datetime().optional(),
});

const generatePayrollSchema = z.object({
  userId: z.string().min(1, { message: "userId is required" }),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
});

const updatePayrollStatusSchema = z.object({
  status: z.enum(["DRAFT", "PROCESSED", "PAID"]),
});

export {
  upsertSalaryStructureSchema,
  generatePayrollSchema,
  updatePayrollStatusSchema,
};