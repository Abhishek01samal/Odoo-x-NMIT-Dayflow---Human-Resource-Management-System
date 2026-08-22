export type PayrollStatus = "DRAFT" | "PROCESSED" | "PAID";

export interface PayrollRecord {
  id: string;
  userId: string;
  employeeName?: string;
  month: number;
  year: number;
  baseNet: number;
  lopDays: number;
  lopDeduction: number;
  finalPay: number;
  status: PayrollStatus;
  paidAt: string | null;
}


