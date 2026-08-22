import { useState } from "react";
import { CalendarSearch, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import { useOrgAttendance } from "@/hooks/useOrgAttendance";
import { AttendanceCorrectionDialog } from "@/components/hr/AttendanceCorrectionDialog";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { ErrorState } from "@/components/shared/ErrorState";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AttendanceRecord } from "@/types";

const STATUS_STYLE: Record<AttendanceRecord["status"], string> = {
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

const fmtTime = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

export default function HrAttendance() {
  const { records, date, setDate, isLoading, error, refetch, correct } =
    useOrgAttendance();
  const [correcting, setCorrecting] = useState<AttendanceRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (error)
    return (
      <ErrorState
        title="Couldn't load attendance"
        description={error}
        onRetry={refetch}
      />
    );

  const handleCorrect = async (
    id: string,
    patch: Parameters<typeof correct>[1]
  ) => {
    setSubmitting(true);
    try {
      await correct(id, patch);
      toast.success("Attendance corrected");
      setCorrecting(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to correct");
    } finally {
      setSubmitting(false);
    }
  };

  const counts = records.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const columns: DataTableColumn<AttendanceRecord>[] = [
    {
      key: "employeeName",
      header: "Employee",
      sortable: true,
      render: (r) => (
        <div>
          <p className="text-sm font-medium leading-tight">{r.employeeName}</p>
          <p className="text-xs text-muted-foreground">{r.userId}</p>
        </div>
      ),
    },
    {
      key: "checkInAt",
      header: "Check In",
      sortable: true,
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
    {
      key: "actions",
      header: "",
      render: (r) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-xs"
          onClick={() => setCorrecting(r)}
        >
          <Pencil className="size-3" />
          Correct
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarSearch className="size-6" />
            Attendance Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Org-wide daily register · fix wrong entries
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Date</span>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-[170px]"
          />
        </label>
      </div>

      {!isLoading && records.length > 0 && (
        <div className="flex flex-wrap gap-2 text-xs">
          {(
            [
              ["PRESENT", "Present"],
              ["ABSENT", "Absent"],
              ["HALF_DAY", "Half Day"],
              ["LEAVE", "On Leave"],
            ] as const
          ).map(([key, label]) => (
            <span
              key={key}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-medium ${STATUS_STYLE[key]}`}
            >
              {counts[key] ?? 0} {label}
            </span>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {new Date(date).toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </CardTitle>
          <CardDescription>{records.length} records</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={records}
            isLoading={isLoading}
            searchKeys={["employeeName", "status"]}
            emptyMessage="No records for this date"
          />
        </CardContent>
      </Card>

      <AttendanceCorrectionDialog
        record={correcting}
        onClose={() => setCorrecting(null)}
        submitting={submitting}
        onSubmit={handleCorrect}
      />
    </div>
  );
}


