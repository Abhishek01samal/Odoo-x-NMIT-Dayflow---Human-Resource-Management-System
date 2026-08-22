import React from "react";
import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarCheck,
  CreditCard,
  UserCircle,
  ClipboardList,
  BarChart2,
  Layers,
  UserCog,
} from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  roles: string[];
}

const navItems: NavItem[] = [
  // Employee nav
  {
    to: "/employee/dashboard",
    label: "My Dashboard",
    icon: <LayoutDashboard className="size-4" />,
    roles: ["EMPLOYEE", "HR", "ADMIN"],
  },
  {
    to: "/employee/profile",
    label: "My Profile",
    icon: <UserCircle className="size-4" />,
    roles: ["EMPLOYEE", "HR", "ADMIN"],
  },
  {
    to: "/employee/attendance",
    label: "Attendance",
    icon: <Clock className="size-4" />,
    roles: ["EMPLOYEE", "HR", "ADMIN"],
  },
  {
    to: "/employee/leave",
    label: "Leave",
    icon: <CalendarCheck className="size-4" />,
    roles: ["EMPLOYEE", "HR", "ADMIN"],
  },
  // HR nav
  {
    to: "/hr/dashboard",
    label: "HR Dashboard",
    icon: <LayoutDashboard className="size-4" />,
    roles: ["HR", "ADMIN"],
  },
  {
    to: "/hr/employees",
    label: "Employees",
    icon: <Users className="size-4" />,
    roles: ["HR", "ADMIN"],
  },
  {
    to: "/hr/attendance",
    label: "Attendance Mgmt",
    icon: <ClipboardList className="size-4" />,
    roles: ["HR", "ADMIN"],
  },
  {
    to: "/hr/leaves",
    label: "Leave Approvals",
    icon: <CalendarCheck className="size-4" />,
    roles: ["HR", "ADMIN"],
  },
  // Admin nav
  {
    to: "/admin/dashboard",
    label: "Admin Dashboard",
    icon: <LayoutDashboard className="size-4" />,
    roles: ["ADMIN"],
  },
  {
    to: "/admin/users",
    label: "User Management",
    icon: <UserCog className="size-4" />,
    roles: ["ADMIN"],
  },
  {
    to: "/admin/departments",
    label: "Departments",
    icon: <Layers className="size-4" />,
    roles: ["ADMIN"],
  },
  {
    to: "/admin/reports",
    label: "Reports",
    icon: <BarChart2 className="size-4" />,
    roles: ["ADMIN"],
  },
];

export default function Sidebar() {
  const { user } = useAuthContext();
  const location = useLocation();

  if (!user) return null;

  const role = user.role as string;
  const filtered = navItems.filter((item) => item.roles.includes(role));

  // Group items by role section
  const groups: { label: string; items: NavItem[] }[] = [];
  if (["EMPLOYEE", "HR", "ADMIN"].includes(role)) {
    groups.push({
      label: "Self Service",
      items: filtered.filter((i) => i.to.startsWith("/employee")),
    });
  }
  if (["HR", "ADMIN"].includes(role)) {
    groups.push({
      label: "HR Management",
      items: filtered.filter((i) => i.to.startsWith("/hr")),
    });
  }
  if (role === "ADMIN") {
    groups.push({
      label: "Administration",
      items: filtered.filter((i) => i.to.startsWith("/admin")),
    });
  }

  return (
    <aside className="hidden w-60 flex-col border-r border-border bg-background md:flex sticky top-0 h-[calc(100vh-3.5rem)] overflow-y-auto">
      <nav className="flex-1 px-3 py-4 space-y-6">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}


