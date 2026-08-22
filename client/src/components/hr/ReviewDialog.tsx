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
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/shared/LoadingButton";
import type { LeaveRequest, LeaveStatus } from "@/types";

type ReviewDialogProps = {
  request: (LeaveRequest & { decision: Exclude<LeaveStatus, "PENDING"> }) | null;
  onClose: () => void;
  submitting: boolean;
  onSubmit: (id: string, status: Exclude<LeaveStatus, "PENDING">, comment?: string) => Promise<void>;
};

export function ReviewDialog({ request, onClose, submitting, onSubmit }: ReviewDialogProps) {
  const [comment, setComment] = useState("");

  if (!request) return null;
  const isReject = request.decision === "REJECTED";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(request.id, request.decision, comment.trim() || undefined);
    setComment("");
    onClose();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {isReject ? "Reject request" : "Approve request"}?
          </DialogTitle>
          <DialogDescription>
            {request.employeeName} ·{" "}
            {new Date(request.startDate).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            })}
            {request.endDate !== request.startDate &&
              ` → ${new Date(request.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}{" "}
            · {request.days} day{request.days > 1 ? "s" : ""}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="review-comment">
              Comment {isReject ? "(required)" : "(optional)"}
            </Label>
            <textarea
              id="review-comment"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required={isReject}
              placeholder={
                isReject
                  ? "Let them know why…"
                  : "Add a note for the employee…"
              }
              className="flex min-h-[70px] w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              variant={isReject ? "destructive" : "default"}
              loading={submitting}
              loadingText="Saving…"
            >
              {isReject ? "Reject" : "Approve"}
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
