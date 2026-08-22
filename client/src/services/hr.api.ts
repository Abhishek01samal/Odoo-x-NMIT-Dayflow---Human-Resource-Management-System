import api from "./api";
import { EMPLOYEE_SEED } from "./mocks/employees.mock";
import { miscMock } from "./mocks/org.mock";
import type {
  EmployeeListItem,
  HrDashboardData,
  PayrollRecord,
} from "@/types";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

let ROSTER: EmployeeListItem[] = [...EMPLOYEE_SEED];

export const hrApi = {
  getDashboard: async (): Promise<HrDashboardData> => {
    if (USE_MOCKS) return miscMock.getHrDashboard();
    const res = await api.get("/dashboard/hr");
    return res.data?.data;
  },

  getEmployees: async (): Promise<EmployeeListItem[]> => {
    if (USE_MOCKS) return [...ROSTER];
    const res = await api.get("/employees");
    return res.data?.data;
  },

  createEmployee: async (
    payload: Omit<
      EmployeeListItem,
      "userId" | "isActive" | "employeeId" | "joinedAt"
    >
  ): Promise<EmployeeListItem> => {
    if (USE_MOCKS) {
      const nextNum =
        ROSTER.reduce(
          (max, r) => Math.max(max, Number(r.employeeId.split("-")[1]) || 0),
          0
        ) + 1;
      const row: EmployeeListItem = {
        ...payload,
        employeeId: `DF-${String(nextNum).padStart(4, "0")}`,
        joinedAt: new Date().toISOString(),
        userId: `u-${Date.now()}`,
        isActive: true,
      };
      ROSTER = [row, ...ROSTER];
      return row;
    }
    const res = await api.post("/employees", payload);
    return res.data?.data;
  },

  updateEmployee: async (
    userId: string,
    patch: Partial<EmployeeListItem>
  ): Promise<void> => {
    if (USE_MOCKS) {
      ROSTER = ROSTER.map((r) =>
        r.userId === userId ? { ...r, ...patch } : r
      );
      return;
    }
    await api.patch(`/employees/${userId}`, patch);
  },

  setActive: async (userId: string, isActive: boolean): Promise<void> => {
    if (USE_MOCKS) {
      ROSTER = ROSTER.map((r) =>
        r.userId === userId ? { ...r, isActive } : r
      );
      return;
    }
    await api.patch(`/employees/${userId}/status`, { isActive });
  },

  getOrgPayrolls: async (): Promise<PayrollRecord[]> => {
    if (USE_MOCKS) return miscMock.getOrgPayrolls();
    const res = await api.get("/payroll");
    return res.data?.data;
  },
};
