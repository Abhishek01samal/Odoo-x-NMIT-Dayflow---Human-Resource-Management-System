import { Navigate, Route, Routes, useLocation } from "react-router";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import { useAuth } from "./hooks/useAuth";
import Protected from "./components/Protected";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import EmployeeDashboard from "./pages/employee/Dashboard";

const App = () => {
  const { user, getUser, isInitialized } = useAuth();

  const location = useLocation();

  // TEMP: role-based home until HR/Admin dashboards exist
  const homeFor = user?.role === "EMPLOYEE" ? "/employee/dashboard" : "/dashboard";

  useEffect(() => {
    const publicRoutes = [
      "/sign-in",
      "/sign-up",
      "/forgot-password",
      "/reset-password",
    ];

    const isPublicRoute = publicRoutes.includes(location.pathname);

    if (!isInitialized && !isPublicRoute) {
      getUser();
    }
  }, [isInitialized, location.pathname]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route
        path="/sign-in"
        element={user ? <Navigate to={homeFor} replace /> : <SignIn />}
      />

      <Route
        path="/sign-up"
        element={user ? <Navigate to={homeFor} replace /> : <SignUp />}
      />

      <Route
        path="/forgot-password"
        element={
          user ? <Navigate to={homeFor} replace /> : <ForgotPassword />
        }
      />

      <Route
        path="/reset-password"
        element={
          user ? <Navigate to={homeFor} replace /> : <ResetPassword />
        }
      />

      <Route element={<Protected />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
