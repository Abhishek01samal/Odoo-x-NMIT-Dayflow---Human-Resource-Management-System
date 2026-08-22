export interface DashboardStats {
  presentDays: number;
  workingDays: number;
  attendanceRate: number;
  leaveBalance: number;
  netSalary: number;
  pendingRequests: number;
}

export type TodayStatus = "NOT_CHECKED_IN" | "CHECKED_IN" | "CHECKED_OUT";

export interface TodayAttendance {
  status: TodayStatus;
  checkInTime: string | null;
  checkOutTime: string | null;
  workedHours: number;
}

export type ActivityType = "LEAVE" | "ATTENDANCE" | "PAYROLL" | "PROFILE";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  createdAt: string;
}

export interface EmployeeDashboardData {
  stats: DashboardStats;
  today: TodayAttendance;
  recentActivity: ActivityItem[];
}
