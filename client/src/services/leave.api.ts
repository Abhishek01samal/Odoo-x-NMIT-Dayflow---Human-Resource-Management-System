import api from "./api";
import type { ApplyLeavePayload, LeaveBalance, LeaveRequest } from "@/types/leave";

export const leaveApi = {
  apply: async (payload: ApplyLeavePayload): Promise<LeaveRequest> => {
    const res = await api.post("/leave", payload);
    return res.data?.data;
  },

  getMine: async (): Promise<LeaveRequest[]> => {
    const res = await api.get("/leave/me");
    return res.data?.data ?? [];
  },

  getMyBalance: async (): Promise<LeaveBalance> => {
    const res = await api.get("/leave/balance");
    return res.data?.data;
  },

  // Admin / HR
  getAll: async (params?: { status?: string; userId?: string }): Promise<LeaveRequest[]> => {
    const res = await api.get("/leave", { params });
    return res.data?.data ?? [];
  },

  review: async (
    id: string,
    payload: { status: "APPROVED" | "REJECTED"; reviewComment?: string }
  ): Promise<LeaveRequest> => {
    const res = await api.patch(`/leave/${id}/review`, payload);
    return res.data?.data;
  },
};