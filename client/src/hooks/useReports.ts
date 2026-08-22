import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessage } from "@/lib/apiError";
import { hrApi } from "@/services/hr.api";
import type { HrDashboardData, PayrollRecord } from "@/types";

export const useReports = () => {
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [dash, setDash] = useState<HrDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [pr, d] = await Promise.all([
        hrApi.getOrgPayrolls(),
        hrApi.getDashboard(),
      ]);
      setPayrolls(pr);
      setDash(d);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to load reports"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { payrolls, dash, isLoading, error, refetch: fetchAll };
};
