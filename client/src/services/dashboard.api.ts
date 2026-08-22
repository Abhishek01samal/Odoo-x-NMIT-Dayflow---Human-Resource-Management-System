import api from "./api";
import { dashboardMock } from "./mocks/dashboard.mock";
import type { EmployeeDashboardData, TodayAttendance } from "@/types/dashboard";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

export const dashboardApi = {
  getDashboard: async (): Promise<EmployeeDashboardData> => {
    if (USE_MOCKS) return dashboardMock.getDashboard();
    const res = await api.get("/attendance/my-dashboard");
    return res.data?.data;
  },

  checkIn: async (): Promise<TodayAttendance> => {
    if (USE_MOCKS) return dashboardMock.checkIn();
    const res = await api.post("/attendance/check-in");
    return res.data?.data;
  },

  checkOut: async (): Promise<TodayAttendance> => {
    if (USE_MOCKS) return dashboardMock.checkOut();
    const res = await api.post("/attendance/check-out");
    return res.data?.data;
  },
};


