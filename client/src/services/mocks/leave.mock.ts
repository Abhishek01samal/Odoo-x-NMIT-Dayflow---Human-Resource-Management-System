import type { LeaveBalanceSummary, LeaveRequest } from "@/types";
import { EMPLOYEE_SEED } from "./employees.mock";

const delay = (ms: number = 400) => new Promise((r) => setTimeout(r, ms));

let MY_LEAVES: LeaveRequest[] = [
  { id: "lv-1", userId: "demo-user-001", type: "SICK", startDate: "2026-08-18", endDate: "2026-08-19", days: 2, reason: "Fever and cold", status: "APPROVED", reviewComment: "Get well soon", reviewedBy: "Meera Joshi", createdAt: "2026-08-16T10:00:00Z" },
  { id: "lv-2", userId: "demo-user-001", type: "PAID", startDate: "2026-09-07", endDate: "2026-09-09", days: 3, reason: "Family function out of town", status: "PENDING", reviewComment: null, reviewedBy: null, createdAt: "2026-08-20T14:30:00Z" },
  { id: "lv-3", userId: "demo-user-001", type: "UNPAID", startDate: "2026-07-02", endDate: "2026-07-02", days: 1, reason: "Personal errand", status: "REJECTED", reviewComment: "Peak sprint week, please reschedule", reviewedBy: "Meera Joshi", createdAt: "2026-06-28T11:15:00Z" },
];

const QUEUE: LeaveRequest[] = [
  { id: "lq-1", userId: "u-002", employeeName: "Priya Sharma", department: "Engineering", type: "PAID", startDate: "2026-08-27", endDate: "2026-08-28", days: 2, reason: "Sister's wedding", status: "PENDING", createdAt: "2026-08-21T09:00:00Z" },
  { id: "lq-2", userId: "u-008", employeeName: "Ananya Das", department: "Engineering", type: "SICK", startDate: "2026-08-24", endDate: "2026-08-24", days: 1, reason: "Dentist appointment complications", status: "PENDING", createdAt: "2026-08-22T08:12:00Z" },
  { id: "lq-3", userId: "u-005", employeeName: "Arjun Nair", department: "Sales", type: "PAID", startDate: "2026-09-01", endDate: "2026-09-05", days: 5, reason: "Vacation — pre-approved client coverage arranged", status: "PENDING", createdAt: "2026-08-19T16:45:00Z" },
  { id: "lq-4", userId: "u-011", employeeName: "Karan Mehta", department: "Sales", type: "UNPAID", startDate: "2026-08-26", endDate: "2026-08-26", days: 1, reason: "Moving apartments", status: "PENDING", createdAt: "2026-08-22T10:05:00Z" },
];

const REVIEWED: LeaveRequest[] = [
  { id: "lr-1", userId: "u-003", employeeName: "Rohan Gupta", department: "Marketing", type: "PAID", startDate: "2026-08-10", endDate: "2026-08-12", days: 3, reason: "Anniversary trip", status: "APPROVED", reviewComment: "Approved. Enjoy!", reviewedBy: "Abhishek Kumar", createdAt: "2026-08-05T12:00:00Z" },
  { id: "lr-2", userId: "u-007", employeeName: "Sneha Rao", department: "Engineering", type: "UNPAID", startDate: "2026-08-14", endDate: "2026-08-14", days: 1, reason: "Visa appointment", status: "REJECTED", reviewComment: "Client demo that day — please pick another date", reviewedBy: "Abhishek Kumar", createdAt: "2026-08-08T15:20:00Z" },
];

const BALANCES: LeaveBalanceSummary = {
  paidTotal: 12,
  paidUsed: 5,
  sickTotal: 6,
  sickUsed: 2,
  unpaidUsed: 0,
};

export const leaveMock = {
  async getMyLeaves(): Promise<LeaveRequest[]> {
    await delay();
    return [...MY_LEAVES];
  },

  async getBalances(): Promise<LeaveBalanceSummary> {
    await delay(250);
    return { ...BALANCES };
  },

  async applyLeave(
    payload: Pick<LeaveRequest, "type" | "startDate" | "endDate" | "days" | "reason">
  ): Promise<LeaveRequest> {
    await delay(600);
    const req: LeaveRequest = {
      id: `lv-${Date.now()}`,
      userId: "demo-user-001",
      status: "PENDING",
      reviewComment: null,
      reviewedBy: null,
      createdAt: new Date().toISOString(),
      ...payload,
    };
    MY_LEAVES = [req, ...MY_LEAVES];
    return { ...req };
  },

  async cancelLeave(id: string): Promise<void> {
    await delay(500);
    MY_LEAVES = MY_LEAVES.filter((l) => l.id !== id);
  },

  async getPendingQueue(): Promise<LeaveRequest[]> {
    await delay();
    return [...QUEUE].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  },

  async getOrgLeaves(): Promise<LeaveRequest[]> {
    await delay();
    return [...QUEUE, ...REVIEWED].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async reviewLeave(id: string, status: "APPROVED" | "REJECTED", comment?: string): Promise<LeaveRequest> {
    await delay(600);
    const idx = QUEUE.findIndex((l) => l.id === id);
    if (idx === -1) throw new Error("Request not found");
    const [found] = QUEUE.splice(idx, 1);
    found.status = status;
    found.reviewComment = comment ?? null;
    found.reviewedBy = "Abhishek Kumar";
    REVIEWED.unshift(found);
    return { ...found };
  },
};
