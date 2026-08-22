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
import { DEPARTMENTS_MOCK, DESIGNATIONS_MOCK } from "@/services/mocks/employees.mock";
import type { EmployeeListItem } from "@/types";
import type { EmployeeInput } from "@/hooks/useEmployees";

const inputCls =
  "flex h-9 w-full rounded-lg border border-border bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none";

type EmployeeFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submitting: boolean;
  editing: EmployeeListItem | null;
  onSubmit: (payload: EmployeeInput) => Promise<void>;
};

const EMPTY: EmployeeInput = {
  name: "",
  email: "",
  department: "",
  designation: "",
  phone: "",
};

export function EmployeeFormDialog({
  open,
  onOpenChange,
  submitting,
  editing,
  onSubmit,
}: EmployeeFormDialogProps) {
  const [form, setForm] = useState<EmployeeInput>(EMPTY);

  useEffect(() => {
    if (open) {
      setForm(
        editing
          ? {
              name: editing.name,
              email: editing.email,
              department: editing.department,
              designation: editing.designation,
              phone: editing.phone,
            }
          : EMPTY
      );
    }
  }, [open, editing]);

  const set = (key: keyof EmployeeInput) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
    setForm(EMPTY);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit employee" : "Add new employee"}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? `Updating ${editing.name}'s record.`
              : "They'll appear in the roster immediately."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emp-name">Full Name</Label>
            <Input
              id="emp-name"
              value={form.name}
              onChange={set("name")}
              placeholder="e.g. Priya Sharma"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emp-email">Work Email</Label>
            <Input
              id="emp-email"
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="name@dayflow.io"
              disabled={!!editing}
              required
            />
            {editing && (
              <p className="text-xs text-muted-foreground">
                Email can't be changed after creation.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="emp-dept">Department</Label>
              <select
                id="emp-dept"
                value={form.department}
                onChange={set("department")}
                required
                className={inputCls}
              >
                <option value="" disabled>
                  Select…
                </option>
                {DEPARTMENTS_MOCK.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="emp-desig">Designation</Label>
              <select
                id="emp-desig"
                value={form.designation}
                onChange={set("designation")}
                required
                className={inputCls}
              >
                <option value="" disabled>
                  Select…
                </option>
                {DESIGNATIONS_MOCK.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name} ({d.level})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="emp-phone">Phone</Label>
            <Input
              id="emp-phone"
              value={form.phone}
              onChange={set("phone")}
              placeholder="+91 98765 43210"
              required
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <LoadingButton type="submit" loading={submitting} loadingText="Saving…">
              {editing ? "Save changes" : "Add employee"}
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
