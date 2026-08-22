import { useAuthContext } from "@/context/AuthContext";
import apiInstance from "@/services/api";
import {
  loginRequest,
  registerRequest,
  logoutRequest,
  getProfileRequest,
} from "@/services/auth.api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

export const useAuth = () => {
  const {
    user,
    setUser,
    isLoading,
    setIsLoading,
    isInitialized,
    setIsInitialized,
  } = useAuthContext();

  type RegisterData = {
    name: string;
    email: string;
    password: string;
  };

  type LoginData = {
    email: string;
    password: string;
  };

  const navigate = useNavigate();

  // Role-based landing route — decided by the account's role, never by the user
  const dashboardRouteFor = (role?: string) => {
    if (role === "ADMIN") return "/admin/dashboard";
    if (role === "HR") return "/hr/dashboard";
    return "/employee/dashboard";
  };

  const register = async ({ name, email, password }: RegisterData) => {
    try {
      setIsLoading(true);
      const res = await registerRequest({ name, email, password });
      const user = res?.data?.user;
      toast.success(res?.message || "Register successfully");
      setUser(user);
      navigate(dashboardRouteFor(user?.role));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Register failed");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async ({ email, password }: LoginData) => {
    try {
      setIsLoading(true);
      const res = await loginRequest({ email, password });
      const user = res?.data?.user;
      toast.success(res?.message || "Login successfully");
      setUser(user);
      navigate(dashboardRouteFor(user?.role));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      const res = await logoutRequest();
      toast.success(res?.message || "Logout successfully");
      navigate("/");
      // Defer clearing the user state so the Protected component doesn't
      // immediately redirect us to /sign-in before the router can process navigate("/")
      setTimeout(() => {
        setUser(null);
      }, 0);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Logout failed");
    } finally {
      setIsLoading(false);
    }
  };

  const getUser = async () => {
    try {
      setIsLoading(true);
      const res = await getProfileRequest();
      setUser(res?.data ?? null);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        setUser(null);
        return;
      }
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  };

  const verifyEmail = async () => {
    try {
      const res = await apiInstance.post("/users/verify-email");
      toast.success(res.data?.message || "Verified successfully");
      // console.log(res);
    } catch (error: any) {
      // console.log(error?.response?.data || error);
      toast.error(
        error?.response?.data?.message || "Failed to fetch user data"
      );
    }
  };

  return {
    user,
    isLoading,
    isInitialized,
    register,
    login,
    logout,
    getUser,
    verifyEmail,
  };
};
