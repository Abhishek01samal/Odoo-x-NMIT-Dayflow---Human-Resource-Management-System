export type AttendanceStatus = "PRESENT" | "ABSENT" | "HALF_DAY" | "LEAVE";

export interface AttendanceRecord {
  id: string;
  userId: string;
  employeeName?: string;
  date: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  workedHours: number;
  status: AttendanceStatus;
  note?: string | null;
}

export interface AttendanceMonthSummary {
  presentDays: number;
  absentDays: number;
  halfDays: number;
  leaveDays: number;
  totalHours: number;
}

export interface OrgAttendanceTrendPoint {
  date: string;
  presentRate: number;
}
