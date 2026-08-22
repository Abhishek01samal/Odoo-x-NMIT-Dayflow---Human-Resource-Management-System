import { useEffect, useState } from "react";
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
import type { AttendanceRecord } from "@/types";

type CorrectionPatch = {
  checkInAt: string | null;
  checkOutAt: string | null;
  note: string;
};

type CorrectionDialogProps = {
  record: AttendanceRecord | null;
  onClose: () => void;
  submitting: boolean;
  onSubmit: (id: string, patch: CorrectionPatch) => Promise<void>;
};

function toTimeInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function AttendanceCorrectionDialog({
  record,
  onClose,
  submitting,
  onSubmit,
}: CorrectionDialogProps) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (record) {
      setCheckIn(toTimeInput(record.checkInAt));
      setCheckOut(toTimeInput(record.checkOutAt));
      setNote(record.note ?? "");
    }
  }, [record]);

  if (!record) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const datePart = record.date;
    await onSubmit(record.id, {
      checkInAt: checkIn ? `${datePart}T${checkIn}:00` : null,
      checkOutAt: checkOut ? `${datePart}T${checkOut}:00` : null,
      note: note.trim(),
    });
    onClose();
  };

  return (
    <Dialog open={!!record} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Correct attendance</DialogTitle>
          <DialogDescription>
            {record.employeeName} ·{" "}
            {new Date(record.date).toLocaleDateString("en-IN", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="corr-in">Check In</Label>
              <Input
                id="corr-in"
                type="time"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="corr-out">Check Out</Label>
              <Input
                id="corr-out"
                type="time"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="corr-note">Reason for correction</Label>
            <textarea
              id="corr-note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Biometric device was down…"
              className="flex min-h-[70px] w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <LoadingButton type="submit" loading={submitting} loadingText="Saving…">
              Save correction
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
