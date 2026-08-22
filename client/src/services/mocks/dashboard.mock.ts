import type { EmployeeDashboardData, TodayAttendance } from "@/types/dashboard";

const delay = (ms: number = 400) => new Promise((r) => setTimeout(r, ms));

let today: TodayAttendance = {
  status: "NOT_CHECKED_IN",
  checkInTime: null,
  checkOutTime: null,
  workedHours: 0,
};

const stats = {
  presentDays: 17,
  workingDays: 22,
  attendanceRate: 77,
  leaveBalance: 12,
  netSalary: 64500,
  pendingRequests: 1,
};

const recentActivity: EmployeeDashboardData["recentActivity"] = [
  {
    id: "act-1",
    type: "LEAVE",
    title: "Leave request approved",
    description: "Sick Leave · Aug 18 – Aug 19 · 2 days",
    createdAt: "2026-08-21T10:30:00Z",
  },
  {
    id: "act-2",
    type: "PAYROLL",
    title: "Salary credited",
    description: "July payroll processed · ₹64,500",
    createdAt: "2026-08-20T09:00:00Z",
  },
  {
    id: "act-3",
    type: "ATTENDANCE",
    title: "Attendance regularized",
    description: "Aug 15 marked as Half Day by HR",
    createdAt: "2026-08-19T16:45:00Z",
  },
  {
    id: "act-4",
    type: "PROFILE",
    title: "Profile updated",
    description: "Phone number changed successfully",
    createdAt: "2026-08-18T11:20:00Z",
  },
];

export const dashboardMock = {
  async getDashboard(): Promise<EmployeeDashboardData> {
    await delay();
    return { stats, today: { ...today }, recentActivity };
  },

  async checkIn(): Promise<TodayAttendance> {
    await delay(600);
    today = {
      status: "CHECKED_IN",
      checkInTime: new Date().toISOString(),
      checkOutTime: null,
      workedHours: 0,
    };
    return { ...today };
  },

  async checkOut(): Promise<TodayAttendance> {
    await delay(600);
    const hours = today.checkInTime
      ? Math.max(
          0.5,
          Number(
            (
              (Date.now() - new Date(today.checkInTime).getTime()) /
              3_600_000
            ).toFixed(1)
          )
        )
      : 8;
    today = {
      ...today,
      status: "CHECKED_OUT",
      checkOutTime: new Date().toISOString(),
      workedHours: hours,
    };
    return { ...today };
  },
};
