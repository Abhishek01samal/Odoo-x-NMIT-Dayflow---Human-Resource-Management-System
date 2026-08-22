import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessage } from "@/lib/apiError";
import { adminApi } from "@/services/admin.api";
import type { AdminUser, SystemRole } from "@/types";

export const useAdminUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setUsers(await adminApi.getUsers());
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to load users"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const changeRole = useCallback(async (id: string, role: SystemRole) => {
    try {
      await adminApi.updateUserRole(id, role);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err, "Failed to update role"));
    }
  }, []);

  const setActive = useCallback(async (id: string, isActive: boolean) => {
    try {
      await adminApi.setUserActive(id, isActive);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isActive } : u))
      );
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err, "Failed to update status"));
    }
  }, []);

  return { users, isLoading, error, refetch: fetchAll, changeRole, setActive };
};


