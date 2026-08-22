import { useState } from "react";
import { Link } from "react-router";
import {
  CalendarDays,
  ChevronLeft,
  Clock3,
  HeartPulse,
  Wallet,
} from "lucide-react";
import { StatCard, TONES } from "@/components/shared/StatCard";
import { LoadingButton } from "@/components/shared/LoadingButton";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { LeaveStatus, LeaveType } from "@/types/leave";
import { useLeave } from "@/hooks/useLeave";

const STATUS_TONE: Record<LeaveStatus, string> = {
  PENDING: TONES.warning,
  APPROVED: TONES.success,
  REJECTED: TONES.danger,
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function EmployeeLeave() {
  const { leaves, balance, isLoading, error, isApplying, refetch, applyLeave } =
    useLeave();

  const [type, setType] = useState<LeaveType>("PAID");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim()) return;
    const ok = await applyLeave({
      type,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      reason: reason.trim(),
    });
    if (ok) {
      setStartDate("");
      setEndDate("");
      setReason("");
    }
  };

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <ErrorState description={error} onRetry={refetch} />
      </div>
    );
  }

  const paidRemaining = balance ? balance.paidTotal - balance.paidUsed : null;
  const sickRemaining = balance ? balance.sickTotal - balance.sickUsed : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/employee/dashboard">
            <ChevronLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Leave & Time-Off</h1>
          <p className="text-sm text-muted-foreground">
            Apply for leave and track your requests
          </p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard
          title="Paid leave left"
          value={paidRemaining ?? "—"}
          icon={Wallet}
          iconClassName={TONES.info}
        />
        <StatCard
          title="Sick leave left"
          value={sickRemaining ?? "—"}
          icon={HeartPulse}
          iconClassName={TONES.success}
        />
        <StatCard
          title="Unpaid taken"
          value={balance?.unpaidUsed ?? "—"}
          icon={Clock3}
          iconClassName={TONES.default}
        />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Apply for leave</CardTitle>
          <CardDescription>Select a leave type, date range, and add a reason</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="leave-type">Leave type</FieldLabel>
                <div className="flex gap-2">
                  {(["PAID", "SICK", "UNPAID"] as LeaveType[]).map((t) => (
                    <Button
                      key={t}
                      type="button"
                      variant={type === t ? "default" : "outline"}
                      size="sm"
                      onClick={() => setType(t)}
                    >
                      {t.charAt(0) + t.slice(1).toLowerCase()}
                    </Button>
                  ))}
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="startDate">Start date</FieldLabel>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="endDate">End date</FieldLabel>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="reason">Reason</FieldLabel>
                <Input
                  id="reason"
                  placeholder="Briefly describe why you need this leave"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </Field>

              <LoadingButton type="submit" loading={isApplying} loadingText="Submitting...">
                Submit request
              </LoadingButton>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your requests</CardTitle>
          <CardDescription>History of leave applications</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : leaves.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="No leave requests yet"
              description="Once you apply for leave, it'll show up here."
            />
          ) : (
            <div className="space-y-3">
              {leaves.map((lr) => (
                <div
                  key={lr.id}
                  className="flex items-start justify-between gap-3 rounded-lg border p-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {lr.type.charAt(0) + lr.type.slice(1).toLowerCase()} Leave
                      </span>
                      <Badge className={STATUS_TONE[lr.status]}>{lr.status}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(lr.startDate)} – {formatDate(lr.endDate)} · {lr.days} day(s)
                    </p>
                    <p className="mt-1 text-sm">{lr.reason}</p>
                    {lr.reviewComment && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        HR comment: {lr.reviewComment}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}