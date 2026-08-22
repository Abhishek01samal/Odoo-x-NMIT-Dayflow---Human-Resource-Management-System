import api from "./api";
import type { PayrollRecord, SalaryStructure } from "@/types/payroll";

export const payrollApi = {
  getMine: async (): Promise<PayrollRecord[]> => {
    const res = await api.get("/payroll/me");
    return res.data?.data ?? [];
  },

  getMySalaryStructure: async (): Promise<SalaryStructure | null> => {
    const res = await api.get("/payroll/me/salary-structure");
    return res.data?.data ?? null;
  },

  // Admin
  getAll: async (params?: {
    userId?: string;
    month?: number;
    year?: number;
    status?: string;
  }): Promise<PayrollRecord[]> => {
    const res = await api.get("/payroll", { params });
    return res.data?.data ?? [];
  },

  getSalaryStructure: async (userId: string): Promise<SalaryStructure | null> => {
    const res = await api.get(`/payroll/salary-structure/${userId}`);
    return res.data?.data ?? null;
  },

  setSalaryStructure: async (payload: {
    userId: string;
    basic: number;
    hra: number;
    allowances: number;
    deductions: number;
  }): Promise<SalaryStructure> => {
    const res = await api.post("/payroll/salary-structure", payload);
    return res.data?.data;
  },

  generate: async (payload: {
    userId: string;
    month: number;
    year: number;
  }): Promise<PayrollRecord> => {
    const res = await api.post("/payroll/generate", payload);
    return res.data?.data;
  },

  updateStatus: async (
    id: string,
    status: "DRAFT" | "PROCESSED" | "PAID"
  ): Promise<PayrollRecord> => {
    const res = await api.patch(`/payroll/${id}/status`, { status });
    return res.data?.data;
  },
};