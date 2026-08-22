import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessage } from "@/lib/apiError";
import { attendanceApi } from "@/services/attendance.api";
import type { AttendanceRecord } from "@/types";

export const useOrgAttendance = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [date, setDate] = useState(() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFor = useCallback(async (d: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setRecords(await attendanceApi.getOrgAttendance(d));
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to load org attendance"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFor(date);
  }, [date, fetchFor]);

  const correct = useCallback(
    async (
      id: string,
      patch: { checkInAt: string | null; checkOutAt: string | null; note: string }
    ) => {
      try {
        await attendanceApi.correctAttendance(id, patch);
        setRecords((prev) =>
          prev.map((r) =>
            r.id === id
              ? {
                  ...r,
                  ...patch,
                  workedHours: computeHours(patch.checkInAt, patch.checkOutAt),
                }
              : r
          )
        );
      } catch (err: unknown) {
        throw new Error(getApiErrorMessage(err, "Failed to save correction"));
      }
    },
    []
  );

  return { records, date, setDate, isLoading, error, refetch: () => fetchFor(date), correct };
};

function computeHours(checkIn: string | null, checkOut: string | null): number {
  if (!checkIn || !checkOut) return 0;
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  if (Number.isNaN(diff) || diff <= 0) return 0;
  return Math.round((diff / 3_600_000) * 10) / 10;
}
