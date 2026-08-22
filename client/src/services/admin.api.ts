import api from "./api";
import {
  DEPARTMENTS_MOCK,
  DESIGNATIONS_MOCK,
  USERS_MOCK,
} from "./mocks/employees.mock";
import type { AdminUser, Department, Designation } from "@/types";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

let USERS: AdminUser[] = [...USERS_MOCK];
let DEPTS: Department[] = [...DEPARTMENTS_MOCK];
let DESIGS: Designation[] = [...DESIGNATIONS_MOCK];

export const adminApi = {
  getUsers: async (): Promise<AdminUser[]> => {
    if (USE_MOCKS) return [...USERS];
    const res = await api.get("/users");
    return res.data?.data;
  },

  updateUserRole: async (id: string, role: AdminUser["role"]): Promise<void> => {
    if (USE_MOCKS) {
      USERS = USERS.map((u) => (u.id === id ? { ...u, role } : u));
      return;
    }
    await api.patch(`/users/${id}/role`, { role });
  },

  setUserActive: async (id: string, isActive: boolean): Promise<void> => {
    if (USE_MOCKS) {
      USERS = USERS.map((u) => (u.id === id ? { ...u, isActive } : u));
      return;
    }
    await api.patch(`/users/${id}/status`, { isActive });
  },

  getDepartments: async (): Promise<Department[]> => {
    if (USE_MOCKS) return [...DEPTS];
    const res = await api.get("/departments");
    return res.data?.data;
  },

  createDepartment: async (name: string): Promise<Department> => {
    if (USE_MOCKS) {
      const row: Department = {
        id: `d-${Date.now()}`,
        name,
        headCount: 0,
      };
      DEPTS = [...DEPTS, row];
      return row;
    }
    const res = await api.post("/departments", { name });
    return res.data?.data;
  },

  getDesignations: async (): Promise<Designation[]> => {
    if (USE_MOCKS) return [...DESIGS];
    const res = await api.get("/designations");
    return res.data?.data;
  },

  createDesignation: async (name: string, level: string): Promise<Designation> => {
    if (USE_MOCKS) {
      const row: Designation = { id: `g-${Date.now()}`, name, level };
      DESIGS = [...DESIGS, row];
      return row;
    }
    const res = await api.post("/designations", { name, level });
    return res.data?.data;
  },
};
