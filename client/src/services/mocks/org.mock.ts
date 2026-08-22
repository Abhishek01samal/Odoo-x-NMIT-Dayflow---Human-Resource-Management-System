import type {
  HrDashboardData,
  NotificationItem,
  PayrollRecord,
} from "@/types";
import { EMPLOYEE_SEED } from "./employees.mock";

const delay = (ms: number = 400) => new Promise((r) => setTimeout(r, ms));

let NOTIFICATIONS: NotificationItem[] = [
  { id: "n-1", title: "Leave approved", message: "Your Sick Leave (Aug 18–19) was approved by Meera Joshi.", type: "LEAVE_UPDATE", isRead: false, link: "/employee/leave", createdAt: "2026-08-21T10:30:00Z" },
  { id: "n-2", title: "Salary credited", message: "July payroll of ₹64,500 has been credited to your HDFC account.", type: "PAYROLL", isRead: false, link: "/employee/payroll", createdAt: "2026-08-20T09:00:00Z" },
  { id: "n-3", title: "Regularization applied", message: "Aug 15 attendance marked as Half Day by HR.", type: "ATTENDANCE", isRead: true, link: "/employee/attendance", createdAt: "2026-08-19T16:45:00Z" },
  { id: "n-4", title: "Pending action", message: "You have 1 leave request awaiting review — no wait, that's HR's job. Enjoy your day!", type: "SYSTEM", isRead: true, link: null, createdAt: "2026-08-18T12:00:00Z" },
  { id: "n-5", title: "Welcome aboard!", message: "Divya Rao joined Engineering today. Say hi!", type: "INFO", isRead: true, link: null, createdAt: "2026-08-11T09:00:00Z" },
];

export const miscMock = {
  async getNotifications(): Promise<NotificationItem[]> {
    await delay();
    return [...NOTIFICATIONS];
  },
  async markRead(id: string): Promise<void> {
    await delay(300);
    NOTIFICATIONS = NOTIFICATIONS.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );
  },
  async markAllRead(): Promise<void> {
    await delay(400);
    NOTIFICATIONS = NOTIFICATIONS.map((n) => ({ ...n, isRead: true }));
  },

  async getMyPayrolls(): Promise<PayrollRecord[]> {
    await delay();
    const mk = (m: number, base: number, lop = 0): PayrollRecord => ({
      id: `pay-me-${m}`,
      userId: "demo-user-001",
      month: m,
      year: 2026,
      baseNet: base,
      lopDays: lop,
      lopDeduction: lop * 2500,
      finalPay: base - lop * 2500,
      status: m === 8 ? "PROCESSED" : "PAID",
      paidAt: m < 8 ? `2026-${String(m + 1).padStart(2, "0")}-01T10:00:00Z` : null,
    });
    return [mk(8, 64500), mk(7, 64500), mk(6, 64500, 1), mk(5, 62000)];
  },

  async getOrgPayrolls(): Promise<PayrollRecord[]> {
    await delay();
    return EMPLOYEE_SEED.filter((e) => e.isActive).map((e, i) => ({
      id: `pay-org-${e.userId}`,
      userId: e.userId,
      employeeName: e.name,
      month: 7,
      year: 2026,
      baseNet: 55000 + i * 3200,
      lopDays: i % 4 === 0 ? 1 : 0,
      lopDeduction: i % 4 === 0 ? 2200 : 0,
      finalPay: 55000 + i * 3200 - (i % 4 === 0 ? 2200 : 0),
      status: i % 3 === 0 ? "PAID" : "PROCESSED",
      paidAt: i % 3 === 0 ? "2026-08-01T10:00:00Z" : null,
    }));
  },

  async getHrDashboard(): Promise<HrDashboardData> {
    await delay();
    return {
      totalEmployees: EMPLOYEE_SEED.filter((e) => e.isActive).length,
      activeToday: 9,
      onLeaveToday: 2,
      pendingLeaveRequests: 4,
      monthlyPayrollCost: 738600,
      attendanceTrend: [
        { date: "Aug 17", presentRate: 92 },
        { date: "Aug 18", presentRate: 85 },
        { date: "Aug 19", presentRate: 88 },
        { date: "Aug 20", presentRate: 94 },
        { date: "Aug 21", presentRate: 90 },
        { date: "Aug 22", presentRate: 81 },
      ],
    };
  },
};
