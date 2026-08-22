export type SystemRole = "EMPLOYEE" | "HR" | "ADMIN";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: SystemRole;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
}

export interface EmployeeListItem {
  userId: string;
  name: string;
  email: string;
  employeeId: string;
  department: string;
  designation: string;
  phone: string;
  joinedAt: string;
  isActive: boolean;
}

export interface Department {
  id: string;
  name: string;
  headCount: number;
}

export interface Designation {
  id: string;
  name: string;
  level: string;
}

export interface HrDashboardData {
  totalEmployees: number;
  activeToday: number;
  onLeaveToday: number;
  pendingLeaveRequests: number;
  monthlyPayrollCost: number;
  attendanceTrend: { date: string; presentRate: number }[];
}
