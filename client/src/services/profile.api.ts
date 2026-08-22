import api from "./api";
import { profileMock } from "./mocks/profile.mock";
import type { EmployeeProfile } from "@/types";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

export const profileApi = {
  getMyProfile: async (): Promise<EmployeeProfile> => {
    if (USE_MOCKS) return profileMock.getMyProfile();
    const res = await api.get("/employees/me");
    return res.data?.data;
  },

  updateMyProfile: async (
    payload: Partial<EmployeeProfile>
  ): Promise<EmployeeProfile> => {
    if (USE_MOCKS) return profileMock.updateMyProfile(payload);
    const res = await api.patch("/employees/me", payload);
    return res.data?.data;
  },
};
