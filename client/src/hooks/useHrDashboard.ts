import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessage } from "@/lib/apiError";
import { hrApi } from "@/services/hr.api";
import { leaveApi } from "@/services/leave.api";
import type { HrDashboardData, LeaveRequest } from "@/types";

export const useHrDashboard = () => {
  const [data, setData] = useState<HrDashboardData | null>(null);
  const [queue, setQueue] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [dash, pending] = await Promise.all([
        hrApi.getDashboard(),
        leaveApi.getPendingQueue(),
      ]);
      setData(dash);
      setQueue(pending.slice(0, 5));
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to load HR dashboard"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { data, queue, isLoading, error, refetch: fetchAll };
};
