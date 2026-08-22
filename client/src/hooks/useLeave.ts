import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { leaveApi } from "@/services/leave.api";
import type { ApplyLeavePayload, LeaveBalance, LeaveRequest } from "@/types/leave";

export const useLeave = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [leavesData, balanceData] = await Promise.all([
        leaveApi.getMine(),
        leaveApi.getMyBalance(),
      ]);
      setLeaves(leavesData);
      setBalance(balanceData);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load leave data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const applyLeave = useCallback(
    async (payload: ApplyLeavePayload) => {
      try {
        setIsApplying(true);
        await leaveApi.apply(payload);
        toast.success("Leave request submitted");
        await fetchAll();
        return true;
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to submit leave request");
        return false;
      } finally {
        setIsApplying(false);
      }
    },
    [fetchAll]
  );

  return { leaves, balance, isLoading, error, isApplying, refetch: fetchAll, applyLeave };
};