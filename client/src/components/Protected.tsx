import { useAuth } from "@/hooks/useAuth";
import { Navigate, Outlet } from "react-router";
import { Spinner } from "./ui/spinner";

const Protected = () => {
  const { user, isInitialized } = useAuth();

  // Don't render until initialization is complete
  if (!isInitialized) {
    return <Spinner />;
  }

  // If user is not authenticated after initialization, redirect to sign-in
  if (!user) {
    return <Navigate to={"/sign-in"} replace />;
  }

  // User is authenticated, render protected routes
  return (
    <>
      <Outlet />
    </>
  );
};

export default Protected;
