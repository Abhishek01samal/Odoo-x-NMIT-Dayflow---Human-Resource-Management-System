import { useState } from "react";
import { CalendarPlus, CircleCheck, CircleX, Clock3 } from "lucide-react";
import toast from "react-hot-toast";
import { useLeaves } from "@/hooks/useLeaves";
import { ApplyLeaveDialog } from "@/components/employee/ApplyLeaveDialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { ErrorState } from "@/components/shared/ErrorState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { LeaveRequest, LeaveStatus, LeaveType } from "@/types";

const LEAVE_STATUS_STYLE: Record<LeaveStatus, string> = {
  PENDING:
    "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  APPROVED:
    "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  REJECTED: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30",
};

const TYPE_LABEL: Record<LeaveType, string> = {
  PAID: "Paid",
  SICK: "Sick",
  UNPAID: "Unpaid",
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

function BalanceCard({
  title,
  used,
  total,
}: {
  title: string;
  used: number;
  total?: number;
}) {
  const pct =
    total && total > 0 ? Math.min(100, Math.round((used / total) * 100)) : null;
  return (
    <div className="rounded-xl border p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <p className="mt-1.5 text-2xl font-bold tabular-nums">
        {total != null ? (
          <>
            {total - used}
            <span className="text-sm font-normal text-muted-foreground">
              {" "}
              / {total} left
            </span>
          </>
        ) : (
          <>
            {used}
            <span className="text-sm font-normal text-muted-foreground">
              {" "}
              used
            </span>
          </>
        )}
      </p>
      {pct != null && (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default function EmployeeLeave() {
  const { leaves, balances, isLoading, error, refetch, apply, cancel } =
    useLeaves();
  const [applyOpen, setApplyOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<LeaveRequest | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  if (error)
    return (
      <ErrorState
        title="Couldn't load leave data"
        description={error}
        onRetry={refetch}
      />
    );

  const handleApply = async (payload: Parameters<typeof apply>[0]) => {
    setSubmitting(true);
    try {
      await apply(payload);
      toast.success("Leave request submitted");
      setApplyOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to apply");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelLoading(true);
    try {
      await cancel(cancelTarget.id);
      toast.success("Pending request cancelled");
      setCancelTarget(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to cancel");
    } finally {
      setCancelLoading(false);
    }
  };

  const columns: DataTableColumn<LeaveRequest>[] = [
    {
      key: "type",
      header: "Type",
      sortable: true,
      render: (l) => <Badge variant="secondary">{TYPE_LABEL[l.type]}</Badge>,
    },
    {
      key: "startDate",
      header: "Dates",
      render: (l) => (
        <span className="tabular-nums">
          {fmtDate(l.startDate)}
          {l.endDate !== l.startDate && ` → ${fmtDate(l.endDate)}`}
        </span>
      ),
    },
    { key: "days", header: "Days", sortable: true },
    {
      key: "reason",
      header: "Reason",
      render: (l) => (
        <span className="block max-w-[220px] truncate" title={l.reason}>
          {l.reason}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (l) => (
        <Badge variant="outline" className={`${LEAVE_STATUS_STYLE[l.status]} border`}>
          {l.status === "PENDING" ? (
            <Clock3 className="size-3" />
          ) : l.status === "APPROVED" ? (
            <CircleCheck className="size-3" />
          ) : (
            <CircleX className="size-3" />
          )}
          {l.status.charAt(0) + l.status.slice(1).toLowerCase()}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (l) =>
        l.status === "PENDING" ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-destructive hover:text-destructive"
            onClick={() => setCancelTarget(l)}
          >
            Cancel
          </Button>
        ) : l.reviewComment ? (
          <span
            className="block max-w-[160px] truncate text-xs text-muted-foreground italic"
            title={l.reviewComment ?? ""}
          >
            “{l.reviewComment}”
          </span>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Leave</h1>
          <p className="text-sm text-muted-foreground">
            Balances, requests and history
          </p>
        </div>
        <Button className="gap-1.5" onClick={() => setApplyOpen(true)}>
          <CalendarPlus className="size-4" />
          Apply for Leave
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <BalanceCard
          title="Paid Leave"
          used={balances?.paidUsed ?? 0}
          total={balances?.paidTotal}
        />
        <BalanceCard
          title="Sick Leave"
          used={balances?.sickUsed ?? 0}
          total={balances?.sickTotal}
        />
        <BalanceCard title="Unpaid Leave" used={balances?.unpaidUsed ?? 0} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Requests</CardTitle>
          <CardDescription>Newest first · cancel pending anytime</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={leaves}
            isLoading={isLoading}
            searchKeys={["type", "reason", "status"]}
            emptyMessage="No leave requests yet — apply for your first one!"
          />
        </CardContent>
      </Card>

      <ApplyLeaveDialog
        open={applyOpen}
        onOpenChange={setApplyOpen}
        submitting={submitting}
        onSubmit={handleApply}
      />

      <ConfirmDialog
        open={cancelTarget !== null}
        onOpenChange={(o) => !o && setCancelTarget(null)}
        title="Cancel this leave request?"
        description={
          cancelTarget
            ? `${TYPE_LABEL[cancelTarget.type]} · ${fmtDate(cancelTarget.startDate)} (${cancelTarget.days}d)`
            : undefined
        }
        confirmLabel="Yes, cancel it"
        destructive
        loading={cancelLoading}
        onConfirm={handleCancel}
      />
    </div>
  );
}


