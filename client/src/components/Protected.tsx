import { useEffect } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { Navigate, Outlet } from "react-router";
import { Spinner } from "./ui/spinner";

// TEMP: demo mode lets us preview pages without the backend running.
// Remove this block (and VITE_DEMO_MODE from .env) before production.
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

const DEMO_USER = {
  id: "demo-user-001",
  name: "Abhishek Kumar",
  email: "abhishek@dayflow.dev",
  role: "EMPLOYEE",
  isVerified: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

type ProtectedProps = {
  allowedRoles?: string[];
};

const Protected = ({ allowedRoles }: ProtectedProps) => {
  const { user, setUser, isInitialized } = useAuthContext();

  useEffect(() => {
    if (DEMO_MODE && isInitialized && !user) {
      setUser(DEMO_USER);
    }
  }, [isInitialized, user, setUser]);

  // Don't render until initialization is complete
  if (!isInitialized) {
    return <Spinner />;
  }

  // If user is not authenticated after initialization, redirect to sign-in
  if (!user) {
    return <Navigate to={"/sign-in"} replace />;
  }

  // Role gate — demo mode sees everything for preview purposes
  if (
    !DEMO_MODE &&
    allowedRoles &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    return <Navigate to={"/employee/dashboard"} replace />;
  }

  // User is authenticated, render protected routes
  return (
    <>
      <Outlet />
    </>
  );
};

export default Protected;
