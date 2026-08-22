import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { dashboardApi } from "@/services/dashboard.api";
import type {
  ActivityItem,
  DashboardStats,
  TodayAttendance,
} from "@/types/dashboard";

export const useDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [today, setToday] = useState<TodayAttendance | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await dashboardApi.getDashboard();
      setStats(data.stats);
      setToday(data.today);
      setRecentActivity(data.recentActivity);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load dashboard");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const checkIn = async () => {
    try {
      const updated = await dashboardApi.checkIn();
      setToday(updated);
      if (updated.checkInTime) {
        toast.success(
          `Checked in at ${new Date(updated.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
        );
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Check-in failed");
    }
  };

  const checkOut = async () => {
    try {
      const updated = await dashboardApi.checkOut();
      setToday(updated);
      toast.success(`Checked out · ${updated.workedHours}h logged today`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Check-out failed");
    }
  };

  return {
    user,
    stats,
    today,
    recentActivity,
    isLoading,
    error,
    refetch: fetchDashboard,
    checkIn,
    checkOut,
  };
};
