import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/shared/LoadingButton";
import type { LeaveType } from "@/types";

const inputCls =
  "flex h-9 w-full rounded-lg border border-border bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none";

type ApplyLeaveDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submitting: boolean;
  onSubmit: (payload: {
    type: LeaveType;
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
  }) => Promise<void>;
};

function countDays(start: string, end: string): number {
  if (!start || !end) return 0;
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (Number.isNaN(s) || Number.isNaN(e) || e < s) return 0;
  return Math.round((e - s) / 86_400_000) + 1;
}

export function ApplyLeaveDialog({
  open,
  onOpenChange,
  submitting,
  onSubmit,
}: ApplyLeaveDialogProps) {
  const [type, setType] = useState<LeaveType>("PAID");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const days = countDays(startDate, endDate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ type, startDate, endDate, days, reason: reason.trim() });
    setType("PAID");
    setStartDate("");
    setEndDate("");
    setReason("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) {
          setStartDate("");
          setEndDate("");
          setReason("");
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Apply for Leave</DialogTitle>
          <DialogDescription>
            Your request goes to HR for approval.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="leave-type">Leave Type</Label>
            <select
              id="leave-type"
              value={type}
              onChange={(e) => setType(e.target.value as LeaveType)}
              className={inputCls}
            >
              <option value="PAID">Paid</option>
              <option value="SICK">Sick</option>
              <option value="UNPAID">Unpaid</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="leave-start">From</Label>
              <Input
                id="leave-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="leave-end">To</Label>
              <Input
                id="leave-end"
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          {days > 0 && (
            <p className="rounded-lg border border-sky-500/20 bg-sky-500/5 px-3 py-2 text-sm text-sky-700 dark:text-sky-400">
              Duration: <strong>{days}</strong> day{days > 1 ? "s" : ""}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="leave-reason">Reason</Label>
            <textarea
              id="leave-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Briefly explain the reason…"
              required
              className={`${inputCls} h-auto min-h-[76px] py-2`}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              loading={submitting}
              loadingText="Submitting…"
              disabled={days <= 0}
            >
              Submit Request
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


