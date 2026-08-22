import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessage } from "@/lib/apiError";
import { hrApi } from "@/services/hr.api";
import type { EmployeeListItem } from "@/types";

export type EmployeeInput = {
  name: string;
  email: string;
  department: string;
  designation: string;
  phone: string;
};

export const useEmployees = () => {
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setEmployees(await hrApi.getEmployees());
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to load employees"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const add = useCallback(async (payload: EmployeeInput) => {
    try {
      await hrApi.createEmployee(payload);
      setEmployees(await hrApi.getEmployees());
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err, "Failed to create employee"));
    }
  }, []);

  const edit = useCallback(async (userId: string, payload: EmployeeInput) => {
    try {
      await hrApi.updateEmployee(userId, payload);
      setEmployees(await hrApi.getEmployees());
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err, "Failed to update employee"));
    }
  }, []);

  const setActive = useCallback(async (userId: string, isActive: boolean) => {
    try {
      await hrApi.setActive(userId, isActive);
      setEmployees((prev) =>
        prev.map((e) => (e.userId === userId ? { ...e, isActive } : e))
      );
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err, "Failed to change status"));
    }
  }, []);

  return { employees, isLoading, error, refetch: fetchAll, add, edit, setActive };
};
