import api from "./api";
import { attendanceMock } from "./mocks/attendance.mock";
import type {
  AttendanceMonthSummary,
  AttendanceRecord,
} from "@/types";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

export const attendanceApi = {
  getMyAttendance: async (): Promise<{
    summary: AttendanceMonthSummary;
    records: AttendanceRecord[];
  }> => {
    if (USE_MOCKS) return attendanceMock.getMyAttendance();
    const res = await api.get("/attendance/my");
    return res.data?.data;
  },

  getOrgAttendance: async (date: string): Promise<AttendanceRecord[]> => {
    if (USE_MOCKS) return attendanceMock.getOrgAttendance(date);
    const res = await api.get("/attendance", { params: { date } });
    return res.data?.data;
  },

  correctAttendance: async (
    id: string,
    patch: Partial<AttendanceRecord>
  ): Promise<AttendanceRecord> => {
    if (USE_MOCKS) return attendanceMock.correctAttendance(id, patch);
    const res = await api.patch(`/attendance/${id}`, patch);
    return res.data?.data;
  },
};
