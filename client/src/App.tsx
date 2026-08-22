import { Navigate, Route, Routes, useLocation } from "react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAuthContext } from "@/context/AuthContext";
import Protected from "@/components/Protected";
import Layout from "@/components/shared/Layout";
import { Spinner } from "@/components/ui/spinner";

// Pages – Auth
import SignIn from "@/pages/SignIn";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import NotFound from "@/pages/NotFound";

// Pages – Shared
import Dashboard from "@/pages/Dashboard";

// Pages – Employee
import EmployeeDashboard from "@/pages/employee/Dashboard";
import EmployeeProfile from "@/pages/employee/Profile";
import EmployeeAttendance from "@/pages/employee/Attendance";
import EmployeeLeave from "@/pages/employee/Leave";

// Pages – HR
import HrDashboard from "@/pages/hr/Dashboard";
import HrEmployees from "@/pages/hr/Employees";
import HrAttendance from "@/pages/hr/Attendance";
import HrLeaves from "@/pages/hr/Leaves";

// Pages – Admin
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminUsers from "@/pages/admin/Users";
import AdminDepartments from "@/pages/admin/Departments";
import AdminReports from "@/pages/admin/Reports";

const homeFor = (role?: string) => {
  if (role === "ADMIN") return "/admin/dashboard";
  if (role === "HR") return "/hr/dashboard";
  return "/employee/dashboard";
};

const App = () => {
  const { getUser, isInitialized } = useAuth();
  const { user } = useAuthContext();
  const location = useLocation();

  useEffect(() => {
    if (!isInitialized) {
      getUser();
    }
  }, [isInitialized, location.pathname]);

  // Show a global spinner until the session is resolved — prevents the
  // sign-in page from flashing before we know if the user is logged in
  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="xl" />
      </div>
    );
  }

  const dashboard = homeFor(user?.role);

  return (
    <Layout>
      <Routes>
        {/* Root: redirect to dashboard or sign-in based on auth */}
        <Route
          path="/"
          element={<Navigate to={user ? dashboard : "/sign-in"} replace />}
        />

        {/* Auth pages — redirect away if already logged in */}
        <Route
          path="/sign-in"
          element={user ? <Navigate to={dashboard} replace /> : <SignIn />}
        />
        <Route
          path="/forgot-password"
          element={user ? <Navigate to={dashboard} replace /> : <ForgotPassword />}
        />
        <Route
          path="/reset-password"
          element={user ? <Navigate to={dashboard} replace /> : <ResetPassword />}
        />

        {/* Shared protected */}
        <Route element={<Protected />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        {/* Employee routes */}
        <Route element={<Protected allowedRoles={["EMPLOYEE", "HR", "ADMIN"]} />}>
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
          <Route path="/employee/profile" element={<EmployeeProfile />} />
          <Route path="/employee/attendance" element={<EmployeeAttendance />} />
          <Route path="/employee/leave" element={<EmployeeLeave />} />
        </Route>

        {/* HR routes */}
        <Route element={<Protected allowedRoles={["HR", "ADMIN"]} />}>
          <Route path="/hr/dashboard" element={<HrDashboard />} />
          <Route path="/hr/employees" element={<HrEmployees />} />
          <Route path="/hr/attendance" element={<HrAttendance />} />
          <Route path="/hr/leaves" element={<HrLeaves />} />
        </Route>

        {/* Admin routes */}
        <Route element={<Protected allowedRoles={["ADMIN"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/departments" element={<AdminDepartments />} />
          <Route path="/admin/reports" element={<AdminReports />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

export default App;
