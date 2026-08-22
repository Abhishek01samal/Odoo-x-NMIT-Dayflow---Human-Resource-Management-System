export type PayrollStatus = "DRAFT" | "PROCESSED" | "PAID";

export interface SalaryStructure {
  id: string;
  userId: string;
  basic: number;
  hra: number;
  allowances: number;
  deductions: number;
  effectiveFrom: string;
  isActive: boolean;
}

export interface PayrollRecord {
  id: string;
  userId: string;
  month: number;
  year: number;
  baseNet: number;
  lopDays: number;
  lopDeduction: number;
  finalPay: number;
  status: PayrollStatus;
  processedById: string | null;
  processedAt: string | null;
  payslipUrl: string | null;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; name: string; email: string };
}