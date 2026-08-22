import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessage } from "@/lib/apiError";
import { adminApi } from "@/services/admin.api";
import type { Department, Designation } from "@/types";

export const useOrgStructure = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [d, des] = await Promise.all([
        adminApi.getDepartments(),
        adminApi.getDesignations(),
      ]);
      setDepartments(d);
      setDesignations(des);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to load org structure"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const addDepartment = useCallback(async (name: string) => {
    try {
      await adminApi.createDepartment(name);
      setDepartments(await adminApi.getDepartments());
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err, "Failed to create department"));
    }
  }, []);

  const addDesignation = useCallback(async (name: string, level: string) => {
    try {
      await adminApi.createDesignation(name, level);
      setDesignations(await adminApi.getDesignations());
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err, "Failed to create designation"));
    }
  }, []);

  return {
    departments,
    designations,
    isLoading,
    error,
    refetch: fetchAll,
    addDepartment,
    addDesignation,
  };
};


