import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessage } from "@/lib/apiError";
import { leaveApi } from "@/services/leave.api";
import type { LeaveRequest, LeaveStatus } from "@/types";

export const useLeaveQueue = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setLeaves(await leaveApi.getOrgLeaves());
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to load leave requests"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const review = useCallback(
    async (id: string, status: Exclude<LeaveStatus, "PENDING">, comment?: string) => {
      try {
        await leaveApi.reviewLeave(id, status, comment);
        setLeaves((prev) =>
          prev.map((l) =>
            l.id === id
              ? { ...l, status, reviewComment: comment ?? null }
              : l
          )
        );
      } catch (err: unknown) {
        throw new Error(getApiErrorMessage(err, "Failed to record decision"));
      }
    },
    []
  );

  const queue = leaves.filter((l) => l.status === "PENDING");
  const history = leaves.filter((l) => l.status !== "PENDING");

  return { queue, history, isLoading, error, refetch: fetchAll, review };
};


