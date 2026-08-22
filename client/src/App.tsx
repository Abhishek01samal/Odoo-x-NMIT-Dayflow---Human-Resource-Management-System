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
import EmployeeProfile from "./pages/employee/Profile";
import EmployeeAttendance from "./pages/employee/Attendance";
import EmployeeLeave from "./pages/employee/Leave";
import Notifications from "./pages/Notifications";
import HrDashboard from "./pages/hr/Dashboard";
import HrEmployees from "./pages/hr/Employees";
import HrAttendance from "./pages/hr/Attendance";
import HrLeaves from "./pages/hr/Leaves";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminDepartments from "./pages/admin/Departments";
import AdminReports from "./pages/admin/Reports";
import Settings from "./pages/Settings";

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
        <Route path="/employee/profile" element={<EmployeeProfile />} />
        <Route path="/employee/attendance" element={<EmployeeAttendance />} />
        <Route path="/employee/leave" element={<EmployeeLeave />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route element={<Protected allowedRoles={["HR", "ADMIN"]} />}>
        <Route path="/hr/dashboard" element={<HrDashboard />} />
        <Route path="/hr/employees" element={<HrEmployees />} />
        <Route path="/hr/attendance" element={<HrAttendance />} />
        <Route path="/hr/leaves" element={<HrLeaves />} />
      </Route>

      <Route element={<Protected allowedRoles={["ADMIN"]} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/departments" element={<AdminDepartments />} />
        <Route path="/admin/reports" element={<AdminReports />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
