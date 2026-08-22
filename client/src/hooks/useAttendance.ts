import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessage } from "@/lib/apiError";
import { attendanceApi } from "@/services/attendance.api";
import type { AttendanceMonthSummary, AttendanceRecord } from "@/types";

export const useAttendance = () => {
  const [summary, setSummary] = useState<AttendanceMonthSummary | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await attendanceApi.getMyAttendance();
      setSummary(data.summary);
      setRecords(data.records);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to load attendance"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { summary, records, isLoading, error, refetch: fetchAll };
};


