import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminApi } from "@/services/admin.api";
import { leaveApi } from "@/services/leave.api";
import { payrollApi } from "@/services/payroll.api";
import type { AdminDashboardData, AttendanceRecord, EmployeeSummary } from "@/types/admin";
import type { LeaveRequest } from "@/types/leave";
import type { PayrollRecord } from "@/types/payroll";

export const useAdminDashboard = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setData(await adminApi.getDashboard());
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load dashboard");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { data, isLoading, error, refetch: fetchDashboard };
};

export const useAdminEmployees = () => {
  const [employees, setEmployees] = useState<EmployeeSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = useCallback(async (search?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setEmployees(await adminApi.getEmployees(search ? { search } : undefined));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load employees");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return { employees, isLoading, error, refetch: fetchEmployees };
};

export const useAdminAttendance = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendance = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setRecords(await adminApi.getAttendance());
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load attendance");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  return { records, isLoading, error, refetch: fetchAttendance };
};

export const useAdminLeaves = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaves = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setLeaves(await leaveApi.getAll());
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load leave requests");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const review = useCallback(
    async (id: string, status: "APPROVED" | "REJECTED", reviewComment?: string) => {
      try {
        await leaveApi.review(id, { status, reviewComment });
        toast.success(`Leave request ${status.toLowerCase()}`);
        await fetchLeaves();
        return true;
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to review leave request");
        return false;
      }
    },
    [fetchLeaves]
  );

  return { leaves, isLoading, error, refetch: fetchLeaves, review };
};

export const useAdminPayroll = () => {
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayroll = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setRecords(await payrollApi.getAll());
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load payroll records");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayroll();
  }, [fetchPayroll]);

  const setSalaryStructure = useCallback(
    async (payload: {
      userId: string;
      basic: number;
      hra: number;
      allowances: number;
      deductions: number;
    }) => {
      try {
        await payrollApi.setSalaryStructure(payload);
        toast.success("Salary structure saved");
        return true;
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to save salary structure");
        return false;
      }
    },
    []
  );

  const generatePayroll = useCallback(
    async (payload: { userId: string; month: number; year: number }) => {
      try {
        await payrollApi.generate(payload);
        toast.success("Payroll generated");
        await fetchPayroll();
        return true;
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to generate payroll");
        return false;
      }
    },
    [fetchPayroll]
  );

  const updateStatus = useCallback(
    async (id: string, status: "DRAFT" | "PROCESSED" | "PAID") => {
      try {
        await payrollApi.updateStatus(id, status);
        toast.success("Payroll status updated");
        await fetchPayroll();
        return true;
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to update payroll status");
        return false;
      }
    },
    [fetchPayroll]
  );

  return {
    records,
    isLoading,
    error,
    refetch: fetchPayroll,
    setSalaryStructure,
    generatePayroll,
    updateStatus,
  };
};