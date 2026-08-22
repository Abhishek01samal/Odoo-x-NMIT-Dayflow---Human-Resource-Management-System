import { Link } from "react-router";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import {
  ArrowRight,
  Building2,
  FileBarChart2,
  ShieldCheck,
  UserCog,
  UserRound,
  Users,
} from "lucide-react";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { StatCard, TONES } from "@/components/shared/StatCard";
import { ErrorState } from "@/components/shared/ErrorState";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ROLE_COLORS: Record<string, string> = {
  EMPLOYEE: "#10b981",
  HR: "#6366f1",
  ADMIN: "#f59e0b",
};

const QUICK_LINKS = [
  {
    to: "/admin/users",
    title: "Users & Roles",
    desc: "Promote, demote and manage access",
    icon: UserCog,
    tone: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  },
  {
    to: "/admin/departments",
    title: "Departments",
    desc: "Org structure and designations",
    icon: Building2,
    tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    to: "/admin/reports",
    title: "Reports",
    desc: "Attendance and payroll analytics",
    icon: FileBarChart2,
    tone: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
];

export default function AdminDashboard() {
  const { users, isLoading, error, refetch } = useAdminUsers();

  if (error)
    return (
      <ErrorState
        title="Couldn't load admin dashboard"
        description={error}
        onRetry={refetch}
      />
    );

  const counts = users.reduce(
    (acc, u) => {
      acc[u.role] = (acc[u.role] ?? 0) + 1;
      if (!u.isActive) acc.inactive += 1;
      return acc;
    },
    { EMPLOYEE: 0, HR: 0, ADMIN: 0, inactive: 0 } as Record<string, number>
  );

  const pieData = (["EMPLOYEE", "HR", "ADMIN"] as const)
    .map((r) => ({ name: r, value: counts[r] }))
    .filter((d) => d.value > 0);

  const recent = [...users]
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <ShieldCheck className="size-6" />
          Admin Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          System overview · accounts, roles and org structure
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard
          title="Total Users"
          value={users.length || "—"}
          icon={Users}
        />
        <StatCard
          title="Employees"
          value={counts.EMPLOYEE || "—"}
          icon={UserRound}
          iconClassName={TONES.success}
        />
        <StatCard
          title="HR Managers"
          value={counts.HR || "—"}
          icon={UserCog}
          iconClassName={TONES.info}
        />
        <StatCard
          title="Admins"
          value={counts.ADMIN || "—"}
          icon={ShieldCheck}
          iconClassName={TONES.warning}
        />
        <StatCard
          title="Deactivated"
          value={counts.inactive || "—"}
          icon={Users}
          iconClassName={TONES.danger}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Role Distribution</CardTitle>
            <CardDescription>How access is split across the org</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="mx-auto h-56 w-56 animate-pulse rounded-full bg-muted" />
            ) : pieData.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">
                No users yet.
              </p>
            ) : (
              <>
                <div className="mx-auto h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        strokeWidth={0}
                      >
                        {pieData.map((d) => (
                          <Cell key={d.name} fill={ROLE_COLORS[d.name]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: 10,
                          border: "1px solid var(--border)",
                          fontSize: 12,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 text-xs">
                  {pieData.map((d) => (
                    <span key={d.name} className="inline-flex items-center gap-1.5">
                      <span
                        className="inline-block size-2.5 rounded-sm"
                        style={{ background: ROLE_COLORS[d.name] }}
                      />
                      {d.name} · {d.value}
                    </span>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Newest Accounts</CardTitle>
            <CardDescription>Latest people to join the system</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-11 animate-pulse rounded-lg bg-muted/50" />
                ))}
              </div>
            ) : (
              <ul className="divide-y">
                {recent.map((u) => (
                  <li
                    key={u.id}
                    className="flex items-center justify-between gap-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{u.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {u.email}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {new Date(u.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {QUICK_LINKS.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="group flex items-start gap-3 rounded-xl border p-4 transition-colors hover:border-primary/40 hover:bg-primary/[0.03]"
          >
            <span
              className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${l.tone}`}
            >
              <l.icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium group-hover:text-primary">
                {l.title}
              </p>
              <p className="text-xs text-muted-foreground">{l.desc}</p>
            </div>
            <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </div>
  );
}


