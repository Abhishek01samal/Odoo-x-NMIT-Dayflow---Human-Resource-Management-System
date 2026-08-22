import type { AttendanceRecord, AttendanceMonthSummary } from "@/types";
import { EMPLOYEE_SEED } from "./employees.mock";

const delay = (ms: number = 400) => new Promise((r) => setTimeout(r, ms));

const pad = (n: number) => String(n).padStart(2, "0");

function seededStatus(day: number, seed: number): AttendanceRecord["status"] {
  const x = (day * 7 + seed * 13) % 20;
  if (x < 14) return "PRESENT";
  if (x < 16) return "HALF_DAY";
  if (x < 18) return "LEAVE";
  return "ABSENT";
}

function buildMonth(
  year: number,
  month: number,
  userId: string,
  seed: number
): AttendanceRecord[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const records: AttendanceRecord[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    const status = seededStatus(d, seed);
    const inH = status === "HALF_DAY" ? 10 : 9 + (seed % 2);
    records.push({
      id: `att-${userId}-${year}${pad(month)}${pad(d)}`,
      userId,
      date: `${year}-${pad(month)}-${pad(d)}`,
      checkInAt:
        status === "ABSENT" || status === "LEAVE"
          ? null
          : `${year}-${pad(month)}-${pad(d)}T${pad(inH)}:${seed % 2 ? "12" : "04"}:00`,
      checkOutAt:
        status === "PRESENT"
          ? `${year}-${pad(month)}-${pad(d)}T18:${seed % 2 ? "30" : "05"}:00`
          : null,
      workedHours:
        status === "PRESENT" ? 8 + ((d + seed) % 3) * 0.5 : status === "HALF_DAY" ? 4 : 0,
      status,
      note: null,
    });
  }
  return records;
}

const MY_RECORDS = buildMonth(2026, 8, "demo-user-001", 1);

export const attendanceMock = {
  async getMyAttendance(): Promise<{
    summary: AttendanceMonthSummary;
    records: AttendanceRecord[];
  }> {
    await delay();
    const summary: AttendanceMonthSummary = {
      presentDays: MY_RECORDS.filter((r) => r.status === "PRESENT").length,
      absentDays: MY_RECORDS.filter((r) => r.status === "ABSENT").length,
      halfDays: MY_RECORDS.filter((r) => r.status === "HALF_DAY").length,
      leaveDays: MY_RECORDS.filter((r) => r.status === "LEAVE").length,
      totalHours: Number(
        MY_RECORDS.reduce((sum, r) => sum + r.workedHours, 0).toFixed(1)
      ),
    };
    return { summary, records: [...MY_RECORDS] };
  },

  async getOrgAttendance(date: string): Promise<AttendanceRecord[]> {
    await delay();
    return EMPLOYEE_SEED.map((e, i) => {
      const status =
        i === 4 ? "LEAVE" : i === 8 ? ("ABSENT" as const) : seededStatus(Number(date.slice(-2)), i);
      return {
        id: `org-${e.userId}-${date}`,
        userId: e.userId,
        employeeName: e.name,
        date,
        checkInAt: status === "PRESENT" || status === "HALF_DAY" ? `${date}T09:${pad(10 + i)}:00` : null,
        checkOutAt: status === "PRESENT" ? `${date}T18:${pad(10 + i)}:00` : null,
        workedHours: status === "PRESENT" ? 8 : status === "HALF_DAY" ? 4 : 0,
        status,
        note: null,
      };
    });
  },

  async correctAttendance(
    id: string,
    patch: Partial<AttendanceRecord>
  ): Promise<AttendanceRecord> {
    await delay(600);
    const idx = MY_RECORDS.findIndex((r) => r.id === id);
    if (idx >= 0 && MY_RECORDS[idx]) {
      MY_RECORDS[idx] = { ...MY_RECORDS[idx], ...patch };
      return { ...MY_RECORDS[idx] };
    }
    throw new Error("Record not found");
  },
};


