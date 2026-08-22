import { useMemo } from "react";
import {
  CalendarCheck2,
  CalendarX2,
  Clock,
  Hourglass,
  Palmtree,
} from "lucide-react";
import { useAttendance } from "@/hooks/useAttendance";
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
import type { AttendanceRecord } from "@/types";

const STATUS_STYLE: Record<
  AttendanceRecord["status"],
  string
> = {
  PRESENT:
    "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  ABSENT: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30",
  HALF_DAY:
    "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  LEAVE: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30",
};

const STATUS_LABEL: Record<AttendanceRecord["status"], string> = {
  PRESENT: "Present",
  ABSENT: "Absent",
  HALF_DAY: "Half Day",
  LEAVE: "On Leave",
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const fmtTime = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";

function MonthCalendar({ records }: { records: AttendanceRecord[] }) {
  const byDate = useMemo(
    () => Object.fromEntries(records.map((r) => [r.date, r])),
    [records]
  );

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const todayStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[11px] font-medium uppercase tracking-wide text-muted-foreground py-1"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: firstOffset }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const record = byDate[dateStr];
          const isToday = dateStr === todayStr;
          return (
            <div
              key={dateStr}
              title={
                record
                  ? `${STATUS_LABEL[record.status]}${record.workedHours ? ` · ${record.workedHours}h` : ""}`
                  : undefined
              }
              className={`
                aspect-square rounded-lg border flex flex-col items-center justify-center gap-0.5 text-xs
                ${
                  record
                    ? STATUS_STYLE[record.status]
                    : dateStr > todayStr
                      ? "border-border bg-muted/20 text-muted-foreground"
                      : new Date(dateStr).getDay() % 6 === 0
                        ? "border-dashed border-border text-muted-foreground"
                        : "border-border text-muted-foreground"
                }
                ${isToday ? "ring-2 ring-primary ring-offset-1 ring-offset-background font-bold" : ""}
              `}
            >
              <span>{day}</span>
              {record && (
                <span className="text-[9px] leading-none opacity-80">
                  {record.status === "PRESENT"
                    ? `${record.workedHours}h`
                    : STATUS_LABEL[record.status]}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
        {(Object.keys(STATUS_STYLE) as AttendanceRecord["status"][]).map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5">
            <span
              className={`inline-block size-3 rounded border ${STATUS_STYLE[s]}`}
            />
            {STATUS_LABEL[s]}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function EmployeeAttendance() {
  const { summary, records, isLoading, error, refetch } = useAttendance();

  if (error)
    return (
      <ErrorState
        title="Couldn't load attendance"
        description={error}
        onRetry={refetch}
      />
    );

  const columns: DataTableColumn<AttendanceRecord>[] = [
    {
      key: "date",
      header: "Date",
      sortable: true,
      render: (r) =>
        new Date(r.date).toLocaleDateString("en-IN", {
          weekday: "short",
          day: "numeric",
          month: "short",
        }),
    },
    {
      key: "checkInAt",
      header: "Check In",
      render: (r) => (
        <span className="tabular-nums">{fmtTime(r.checkInAt)}</span>
      ),
    },
    {
      key: "checkOutAt",
      header: "Check Out",
      render: (r) => (
        <span className="tabular-nums">{fmtTime(r.checkOutAt)}</span>
      ),
    },
    {
      key: "workedHours",
      header: "Hours",
      sortable: true,
      render: (r) => <span className="tabular-nums">{r.workedHours}h</span>,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (r) => (
        <Badge variant="outline" className={`${STATUS_STYLE[r.status]} border`}>
          {STATUS_LABEL[r.status]}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Attendance</h1>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("en-IN", {
            month: "long",
            year: "numeric",
          })}{" "}
          · your monthly presence at a glance
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-5">
        <StatCard
          title="Present"
          value={summary?.presentDays ?? "—"}
          icon={CalendarCheck2}
          iconClassName={TONES.success}
        />
        <StatCard
          title="Half Days"
          value={summary?.halfDays ?? "—"}
          icon={Hourglass}
          iconClassName={TONES.warning}
        />
        <StatCard
          title="On Leave"
          value={summary?.leaveDays ?? "—"}
          icon={Palmtree}
          iconClassName={TONES.info}
        />
        <StatCard
          title="Absent"
          value={summary?.absentDays ?? "—"}
          icon={CalendarX2}
          iconClassName={TONES.danger}
        />
        <StatCard
          title="Total Hours"
          value={summary ? `${summary.totalHours}h` : "—"}
          icon={Clock}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>August 2026</CardTitle>
          <CardDescription>Color-coded daily status</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading || !summary ? (
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: 35 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square animate-pulse rounded-lg bg-muted"
                />
              ))}
            </div>
          ) : (
            <MonthCalendar records={records} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>All records this month</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={[...records].reverse()}
            isLoading={isLoading}
            searchKeys={["date"]}
            emptyMessage="No attendance records yet"
          />
        </CardContent>
      </Card>
    </div>
  );
}


