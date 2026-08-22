import { Link } from "react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  Banknote,
  CalendarClock,
  Hourglass,
  UserCheck,
  Users,
} from "lucide-react";
import { useHrDashboard } from "@/hooks/useHrDashboard";
import { StatCard, TONES } from "@/components/shared/StatCard";
import { ErrorState } from "@/components/shared/ErrorState";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { HrDashboardData, LeaveRequest, LeaveType } from "@/types";

const TYPE_LABEL: Record<LeaveType, string> = {
  PAID: "Paid",
  SICK: "Sick",
  UNPAID: "Unpaid",
};

function TrendChart({
  data,
}: {
  data: HrDashboardData["attendanceTrend"];
}) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="presentFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11 }}
            tickFormatter={(v: string) =>
              new Date(v).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              })
            }
          />
          <YAxis
            domain={[60, 100]}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            formatter={(v) => [`${v}%`, "Present"]}
            labelFormatter={(l) =>
              new Date(String(l)).toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })
            }
            contentStyle={{
              borderRadius: 10,
              border: "1px solid var(--border)",
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="presentRate"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#presentFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function HrDashboard() {
  const { data, queue, isLoading, error, refetch } = useHrDashboard();

  if (error)
    return (
      <ErrorState
        title="Couldn't load HR dashboard"
        description={error}
        onRetry={refetch}
      />
    );

  const fmtINR = (n: number) =>
    `₹${n.toLocaleString("en-IN")}`;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">HR Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Organization pulse · people, attendance and payroll
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          title="Total Employees"
          value={data?.totalEmployees ?? "—"}
          icon={Users}
        />
        <StatCard
          title="Active Today"
          value={data?.activeToday ?? "—"}
          icon={UserCheck}
          iconClassName={TONES.success}
        />
        <StatCard
          title="On Leave Today"
          value={data?.onLeaveToday ?? "—"}
          icon={CalendarClock}
          iconClassName={TONES.info}
        />
        <StatCard
          title="Pending Requests"
          value={data?.pendingLeaveRequests ?? "—"}
          icon={Hourglass}
          iconClassName={TONES.warning}
        />
        <StatCard
          title="Monthly Payroll"
          value={data ? fmtINR(data.monthlyPayrollCost) : "—"}
          icon={Banknote}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Trend</CardTitle>
          <CardDescription>Org-wide present % over recent days</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading || !data ? (
            <div className="h-64 w-full animate-pulse rounded-lg bg-muted" />
          ) : (
            <TrendChart data={data.attendanceTrend} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Approval Queue</CardTitle>
            <CardDescription>
              Oldest pending requests first
            </CardDescription>
          </div>
          <Link
            to="/hr/leaves"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all <ArrowRight className="size-4" />
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-muted/50" />
              ))}
            </div>
          ) : queue.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Queue is clear — no pending requests.
            </p>
          ) : (
            <ul className="divide-y">
              {queue.map((q: LeaveRequest) => (
                <li
                  key={q.id}
                  className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{q.employeeName}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {TYPE_LABEL[q.type]} ·{" "}
                      {new Date(q.startDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                      {q.endDate !== q.startDate &&
                        ` → ${new Date(q.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}{" "}
                      · {q.days}d
                    </p>
                  </div>
                  <Badge variant="secondary">Pending</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
