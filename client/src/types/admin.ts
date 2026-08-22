import type { LeaveRequest } from "./leave";

export interface AdminDashboardData {
  totalEmployees: number;
  activeEmployees: number;
  attendanceToday: {
    present: number;
    absent: number;
    halfDay: number;
    leave: number;
    notMarked: number;
  };
  pendingLeaves: number;
  recentPendingLeaves: LeaveRequest[];
  draftPayrollCount: number;
}

export interface EmployeeSummary {
  id: string;
  name: string;
  email: string;
  role: "EMPLOYEE" | "HR" | "ADMIN";
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  profile: {
    id: string;
    employeeId: string;
    department: string;
    designation: string;
    phone: string | null;
    joinedAt: string;
  } | null;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  workedHours: number | null;
  status: "PRESENT" | "ABSENT" | "HALF_DAY" | "LEAVE";
  note: string | null;
  user?: { id: string; name: string; email: string };
}