import { useAuthContext, type User } from "@/context/AuthContext";
import apiInstance from "@/services/api";
import {
  loginRequest,
  registerRequest,
  logoutRequest,
  getProfileRequest,
} from "@/services/auth.api";
import toast from "react-hot-toast";

// Guarantee every user entering the context has the fields the UI renders —
// a malformed backend/HMR payload must never crash a page again.
const sanitizeUser = (raw: unknown): User | null => {
  if (!raw || typeof raw !== "object") return null;
  const u = raw as Partial<User> & Record<string, unknown>;
  if (!u.email && !u.name) return null;
  const name =
    typeof u.name === "string" && u.name.trim()
      ? u.name
      : typeof u.email === "string"
        ? u.email.split("@")[0]
        : "User";
  if (!(u.name && u.id)) {
    console.warn("[Dayflow] sanitized malformed user object:", raw);
  }
  return {
    id: typeof u.id === "string" ? u.id : `usr-${Date.now()}`,
    name,
    email: typeof u.email === "string" ? u.email : "",
    role: typeof u.role === "string" ? u.role : "EMPLOYEE",
    isVerified: u.isVerified ?? true,
    createdAt:
      typeof u.createdAt === "string"
        ? u.createdAt
        : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

// Extract a friendly message from an unknown error (axios or mock)
const errMessage = (error: unknown, fallback: string): string => {
  const e = error as { response?: { data?: { message?: string } } };
  return e?.response?.data?.message ?? fallback;
};

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
      const rawUser = res?.data?.user;
      const safeUser = sanitizeUser(rawUser);
      toast.success(res?.message || "Registered successfully");
      setUser(safeUser);
      // Use replace so the router re-evaluates after user state is committed
      window.location.replace(dashboardRouteFor(rawUser?.role));
    } catch (error) {
      toast.error(errMessage(error, "Register failed"));
    } finally {
      setIsLoading(false);
    }
  };

  const login = async ({ email, password }: LoginData) => {
    try {
      setIsLoading(true);
      const res = await loginRequest({ email, password });
      const rawUser = res?.data?.user;
      const safeUser = sanitizeUser(rawUser);
      toast.success(res?.message || "Login successfully");
      setUser(safeUser);
      // Hard redirect ensures App re-mounts with the new auth state,
      // avoiding the race condition where navigate() fires before user state commits
      window.location.replace(dashboardRouteFor(rawUser?.role));
    } catch (error) {
      toast.error(errMessage(error, "Login failed"));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      localStorage.removeItem("mock_user");
      try {
        await logoutRequest();
      } catch(err) {
        // Ignore backend errors in dev mode if it's down
      }
      toast.success("Logout successfully");
      setUser(null);
      window.location.replace("/sign-in");
    } catch (error) {
      toast.error(errMessage(error, "Logout failed"));
    } finally {
      setIsLoading(false);
    }
  };


  const getUser = async () => {
    try {
      setIsLoading(true);
      
      const mockUser = localStorage.getItem("mock_user");
      if (mockUser) {
        setUser(JSON.parse(mockUser));
        return;
      }
      
      const res = await getProfileRequest();
      setUser(sanitizeUser(res?.data));
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status === 401) {
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
    } catch (error) {
      toast.error(errMessage(error, "Failed to verify email"));
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


