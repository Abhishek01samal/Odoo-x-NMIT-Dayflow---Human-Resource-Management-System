import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/apiError";
import { profileApi } from "@/services/profile.api";
import type { EmployeeProfile } from "@/types";

export const useProfile = () => {
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await profileApi.getMyProfile();
      setProfile(data);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to load profile"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(
    async (patch: Partial<EmployeeProfile>) => {
      try {
        const updated = await profileApi.updateMyProfile(patch);
        setProfile(updated);
        toast.success("Profile updated successfully");
        return true;
      } catch (err: unknown) {
        toast.error(
          getApiErrorMessage(err, "Failed to update profile")
        );
        return false;
      }
    },
    []
  );

  return { profile, isLoading, error, refetch: fetchProfile, updateProfile };
};


