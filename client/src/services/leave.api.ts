import api from "./api";
import { leaveMock } from "./mocks/leave.mock";
import type { LeaveBalanceSummary, LeaveRequest } from "@/types";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

export const leaveApi = {
  getMyLeaves: async (): Promise<LeaveRequest[]> => {
    if (USE_MOCKS) return leaveMock.getMyLeaves();
    const res = await api.get("/leaves/my");
    return res.data?.data;
  },

  getBalances: async (): Promise<LeaveBalanceSummary> => {
    if (USE_MOCKS) return leaveMock.getBalances();
    const res = await api.get("/leaves/balances");
    return res.data?.data;
  },

  applyLeave: async (
    payload: Pick<LeaveRequest, "type" | "startDate" | "endDate" | "days" | "reason">
  ): Promise<LeaveRequest> => {
    if (USE_MOCKS) return leaveMock.applyLeave(payload);
    const res = await api.post("/leaves", payload);
    return res.data?.data;
  },

  cancelLeave: async (id: string): Promise<void> => {
    if (USE_MOCKS) return leaveMock.cancelLeave(id);
    await api.delete(`/leaves/${id}`);
  },

  getPendingQueue: async (): Promise<LeaveRequest[]> => {
    if (USE_MOCKS) return leaveMock.getPendingQueue();
    const res = await api.get("/leaves", { params: { status: "PENDING" } });
    return res.data?.data;
  },

  getOrgLeaves: async (): Promise<LeaveRequest[]> => {
    if (USE_MOCKS) return leaveMock.getOrgLeaves();
    const res = await api.get("/leaves/org");
    return res.data?.data;
  },

  reviewLeave: async (
    id: string,
    status: "APPROVED" | "REJECTED",
    comment?: string
  ): Promise<LeaveRequest> => {
    if (USE_MOCKS) return leaveMock.reviewLeave(id, status, comment);
    const res = await api.patch(`/leaves/${id}/review`, { status, comment });
    return res.data?.data;
  },
};


