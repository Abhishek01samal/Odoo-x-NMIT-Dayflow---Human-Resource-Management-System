import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessage } from "@/lib/apiError";
import { leaveApi } from "@/services/leave.api";
import type {
  LeaveBalanceSummary,
  LeaveRequest,
  LeaveType,
} from "@/types";

export const useLeaves = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [balances, setBalances] = useState<LeaveBalanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [lv, bal] = await Promise.all([
        leaveApi.getMyLeaves(),
        leaveApi.getBalances(),
      ]);
      setLeaves(lv);
      setBalances(bal);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to load leave data"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const apply = useCallback(
    async (payload: {
      type: LeaveType;
      startDate: string;
      endDate: string;
      days: number;
      reason: string;
    }) => {
      try {
        await leaveApi.applyLeave(payload);
        const lv = await leaveApi.getMyLeaves();
        setLeaves(lv);
        return true;
      } catch (err: unknown) {
        throw new Error(getApiErrorMessage(err, "Failed to apply"));
      }
    },
    []
  );

  const cancel = useCallback(async (id: string) => {
    try {
      await leaveApi.cancelLeave(id);
      setLeaves((prev) => prev.filter((l) => l.id !== id));
      return true;
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err, "Failed to cancel"));
    }
  }, []);

  return { leaves, balances, isLoading, error, refetch: fetchAll, apply, cancel };
};
