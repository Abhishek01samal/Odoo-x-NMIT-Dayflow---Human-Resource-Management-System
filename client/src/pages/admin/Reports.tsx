import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FileBarChart2, IndianRupee, TrendingDown, Users } from "lucide-react";
import { useReports } from "@/hooks/useReports";
import { StatCard, TONES } from "@/components/shared/StatCard";
import { ErrorState } from "@/components/shared/ErrorState";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PayrollRecord } from "@/types";

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

const STATUS_BADGE: Record<PayrollRecord["status"], string> = {
  DRAFT: "border-zinc-500/30 bg-zinc-500/15 text-zinc-600 dark:text-zinc-400",
  PROCESSED: "border-sky-500/30 bg-sky-500/15 text-sky-700 dark:text-sky-400",
  PAID: "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
};

export default function AdminReports() {
  const { payrolls, dash, isLoading, error, refetch } = useReports();

  const totals = useMemo(() => {
    const cost = payrolls.reduce((s, p) => s + p.finalPay, 0);
    const lop = payrolls.reduce((s, p) => s + p.lopDays, 0);
    return {
      cost,
      avgLop: payrolls.length ? Math.round((lop / payrolls.length) * 10) / 10 : 0,
      count: payrolls.length,
    };
  }, [payrolls]);

  const topSalaries = useMemo(
    () =>
      [...payrolls]
        .sort((a, b) => b.finalPay - a.finalPay)
        .slice(0, 8)
        .map((p) => ({
          name: p.employeeName?.split(" ")[0] ?? "—",
          pay: p.finalPay,
        })),
    [payrolls]
  );

  if (error)
    return (
      <ErrorState
        title="Couldn't load reports"
        description={error}
        onRetry={refetch}
      />
    );

  const columns: DataTableColumn<PayrollRecord>[] = [
    {
      key: "employeeName",
      header: "Employee",
      sortable: true,
    },
    {
      key: "baseNet",
      header: "Base Net",
      sortable: true,
      render: (p) => <span className="tabular-nums">{inr(p.baseNet)}</span>,
    },
    {
      key: "lopDays",
      header: "LOP",
      sortable: true,
      render: (p) => (
        <span
          className={`tabular-nums text-sm ${
            p.lopDays > 0 ? "font-medium text-destructive" : "text-muted-foreground"
          }`}
        >
          {p.lopDays}d
        </span>
      ),
    },
    {
      key: "lopDeduction",
      header: "Deduction",
      sortable: true,
      render: (p) => (
        <span className="tabular-nums text-sm">
          {p.lopDeduction > 0 ? `−${inr(p.lopDeduction)}` : "—"}
        </span>
      ),
    },
    {
      key: "finalPay",
      header: "Final Pay",
      sortable: true,
      render: (p) => (
        <span className="font-semibold tabular-nums">{inr(p.finalPay)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (p) => (
        <Badge variant="outline" className={`${STATUS_BADGE[p.status]} border`}>
          {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <FileBarChart2 className="size-6" />
          Reports & Analytics
        </h1>
        <p className="text-sm text-muted-foreground">
          Payroll and attendance insights across the organization
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          title="Payroll Cost (July)"
          value={isLoading ? "—" : inr(totals.cost)}
          icon={IndianRupee}
        />
        <StatCard
          title="Avg LOP / Employee"
          value={isLoading ? "—" : `${totals.avgLop}d`}
          icon={TrendingDown}
          iconClassName={TONES.warning}
        />
        <StatCard
          title="Employees Paid"
          value={isLoading ? "—" : totals.count}
          icon={Users}
          iconClassName={TONES.success}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Salaries</CardTitle>
            <CardDescription>Final pay, July run</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 animate-pulse rounded-lg bg-muted" />
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topSalaries} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `₹${Math.round(Number(v) / 1000)}k`}
                    />
                    <Tooltip
                      formatter={(v) => [inr(Number(v)), "Final Pay"]}
                      contentStyle={{
                        borderRadius: 10,
                        border: "1px solid var(--border)",
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="pay" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={38} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Trend</CardTitle>
            <CardDescription>Org present % over recent days</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading || !dash ? (
              <div className="h-64 animate-pulse rounded-lg bg-muted" />
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dash.attendanceTrend} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                    <defs>
                      <linearGradient id="repFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <YAxis domain={[60, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                    <Tooltip
                      formatter={(v) => [`${v}%`, "Present"]}
                      contentStyle={{
                        borderRadius: 10,
                        border: "1px solid var(--border)",
                        fontSize: 12,
                      }}
                    />
                    <Area type="monotone" dataKey="presentRate" stroke="#6366f1" strokeWidth={2} fill="url(#repFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payroll Register — July 2026</CardTitle>
          <CardDescription>Every payout with loss-of-pay adjustments</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={payrolls}
            isLoading={isLoading}
            searchKeys={["employeeName", "status"]}
            emptyMessage="No payroll records"
          />
        </CardContent>
      </Card>
    </div>
  );
}
