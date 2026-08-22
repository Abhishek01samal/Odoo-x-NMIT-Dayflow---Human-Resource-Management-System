export type LeaveType = "PAID" | "SICK" | "UNPAID";
export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface LeaveRequest {
  id: string;
  userId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  reviewComment: string | null;
  reviewedAt: string | null;
  reviewedById: string | null;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; name: string; email: string };
}

export interface LeaveBalance {
  id: string;
  userId: string;
  year: number;
  paidTotal: number;
  paidUsed: number;
  sickTotal: number;
  sickUsed: number;
  unpaidUsed: number;
}

export interface ApplyLeavePayload {
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}