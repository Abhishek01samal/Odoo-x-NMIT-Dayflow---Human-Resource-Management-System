export type LeaveType = "PAID" | "SICK" | "UNPAID";
export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface LeaveRequest {
  id: string;
  userId: string;
  employeeName?: string;
  department?: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  reviewComment?: string | null;
  reviewedBy?: string | null;
  createdAt: string;
}

export interface LeaveBalanceSummary {
  paidTotal: number;
  paidUsed: number;
  sickTotal: number;
  sickUsed: number;
  unpaidUsed: number;
}


