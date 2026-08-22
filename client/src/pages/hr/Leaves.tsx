import { useState } from "react";
import { CircleCheck, CircleX, Inbox } from "lucide-react";
import toast from "react-hot-toast";
import { useLeaveQueue } from "@/hooks/useLeaveQueue";
import { ReviewDialog } from "@/components/hr/ReviewDialog";
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

const TYPE_LABEL: Record<LeaveType, string> = {
  PAID: "Paid",
  SICK: "Sick",
  UNPAID: "Unpaid",
};

const STATUS_STYLE: Record<LeaveStatus, string> = {
  PENDING:
    "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  APPROVED:
    "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  REJECTED: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30",
};

type Decision = Exclude<LeaveStatus, "PENDING">;

export default function HrLeaves() {
  const { queue, history, isLoading, error, refetch, review } = useLeaveQueue();
  const [pendingDecision, setPendingDecision] = useState<
    (LeaveRequest & { decision: Decision }) | null
  >(null);
  const [submitting, setSubmitting] = useState(false);

  if (error)
    return (
      <ErrorState
        title="Couldn't load leave requests"
        description={error}
        onRetry={refetch}
      />
    );

  const handleReview = async (
    id: string,
    status: Decision,
    comment?: string
  ) => {
    setSubmitting(true);
    try {
      await review(id, status, comment);
      toast.success(status === "APPROVED" ? "Request approved" : "Request rejected");
      setPendingDecision(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to record decision");
    } finally {
      setSubmitting(false);
    }
  };

  const queueColumns: DataTableColumn<LeaveRequest>[] = [
    {
      key: "employeeName",
      header: "Employee",
      sortable: true,
      render: (l) => (
        <div>
          <p className="text-sm font-medium leading-tight">{l.employeeName}</p>
          <p className="text-xs text-muted-foreground">{l.department}</p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (l) => <Badge variant="secondary">{TYPE_LABEL[l.type]}</Badge>,
    },
    {
      key: "startDate",
      header: "Dates",
      sortable: true,
      render: (l) => (
        <span className="tabular-nums">
          {new Date(l.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          {l.endDate !== l.startDate &&
            ` → ${new Date(l.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}
        </span>
      ),
    },
    { key: "days", header: "Days", sortable: true },
    {
      key: "reason",
      header: "Reason",
      render: (l) => (
        <span className="block max-w-[240px] truncate" title={l.reason}>
          {l.reason}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Applied",
      sortable: true,
      render: (l) =>
        new Date(l.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        }),
    },
    {
      key: "actions",
      header: "",
      render: (l) => (
        <div className="flex justify-end gap-1">
          <Button
            size="sm"
            className="h-7 gap-1 px-2.5 text-xs"
            onClick={() => setPendingDecision({ ...l, decision: "APPROVED" })}
          >
            <CircleCheck className="size-3.5" />
            Approve
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1 border-destructive/40 px-2.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setPendingDecision({ ...l, decision: "REJECTED" })}
          >
            <CircleX className="size-3.5" />
            Reject
          </Button>
        </div>
      ),
    },
  ];

  const historyColumns: DataTableColumn<LeaveRequest>[] = [
    {
      key: "employeeName",
      header: "Employee",
      sortable: true,
      render: (l) => <span className="text-sm">{l.employeeName}</span>,
    },
    {
      key: "type",
      header: "Type",
      render: (l) => <Badge variant="secondary">{TYPE_LABEL[l.type]}</Badge>,
    },
    {
      key: "startDate",
      header: "Dates",
      render: (l) => (
        <span className="tabular-nums text-sm">
          {new Date(l.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          {l.endDate !== l.startDate &&
            ` → ${new Date(l.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (l) => (
        <Badge variant="outline" className={`${STATUS_STYLE[l.status]} border`}>
          {l.status.charAt(0) + l.status.slice(1).toLowerCase()}
        </Badge>
      ),
    },
    {
      key: "reviewComment",
      header: "Review",
      render: (l) => (
        <span
          className="block max-w-[220px] truncate text-xs text-muted-foreground italic"
          title={`${l.reviewComment ?? ""} — ${l.reviewedBy ?? ""}`}
        >
          {l.reviewComment ? `“${l.reviewComment}”` : "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Leave Management</h1>
        <p className="text-sm text-muted-foreground">
          Review requests · decisions are shared with employees instantly
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Inbox className="size-5" />
            Approval Queue
          </CardTitle>
          <CardDescription>
            {queue.length} pending request{queue.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={queueColumns}
            data={queue}
            isLoading={isLoading}
            searchKeys={["employeeName", "type", "reason"]}
            emptyMessage="Queue is clear — no pending requests 🎉"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reviewed History</CardTitle>
          <CardDescription>All past decisions</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={historyColumns}
            data={history}
            isLoading={isLoading}
            searchKeys={["employeeName", "status", "reviewComment"]}
            emptyMessage="Nothing reviewed yet"
          />
        </CardContent>
      </Card>

      <ReviewDialog
        request={pendingDecision}
        onClose={() => setPendingDecision(null)}
        submitting={submitting}
        onSubmit={handleReview}
      />
    </div>
  );
}
