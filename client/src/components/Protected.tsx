import { useAuthContext } from "@/context/AuthContext";
import { Navigate, Outlet } from "react-router";
import { Spinner } from "./ui/spinner";

type ProtectedProps = {
  allowedRoles?: string[];
};

const homeFor = (role?: string) => {
  if (role === "ADMIN") return "/admin/dashboard";
  if (role === "HR") return "/hr/dashboard";
  return "/employee/dashboard";
};

const Protected = ({ allowedRoles }: ProtectedProps) => {
  const { user, isInitialized } = useAuthContext();

  // Still resolving the session — show a full-page spinner
  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  // Not logged in — send to sign-in
  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  // Wrong role — send to their own home
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={homeFor(user.role)} replace />;
  }

  // All good — render the child route
  return <Outlet />;
};

export default Protected;
