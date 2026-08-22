import api from "./api";
import type { AdminDashboardData, AttendanceRecord, EmployeeSummary } from "@/types/admin";

export const adminApi = {
  getDashboard: async (): Promise<AdminDashboardData> => {
    const res = await api.get("/admin/dashboard");
    return res.data?.data;
  },

  getEmployees: async (params?: { search?: string; department?: string; role?: string }): Promise<EmployeeSummary[]> => {
    const res = await api.get("/employees", { params });
    return res.data?.data ?? [];
  },

  updateEmployee: async (
    userId: string,
    payload: Record<string, unknown>
  ): Promise<unknown> => {
    const res = await api.patch(`/employees/${userId}`, payload);
    return res.data?.data;
  },

  getAttendance: async (params?: {
    userId?: string;
    from?: string;
    to?: string;
    status?: string;
  }): Promise<AttendanceRecord[]> => {
    const res = await api.get("/attendance", { params });
    return res.data?.data ?? [];
  },

  regularizeAttendance: async (
    id: string,
    payload: { status: string; note?: string }
  ): Promise<AttendanceRecord> => {
    const res = await api.patch(`/attendance/${id}/regularize`, payload);
    return res.data?.data;
  },
};