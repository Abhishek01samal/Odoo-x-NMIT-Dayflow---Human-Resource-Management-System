import { useState } from "react";
import { Pencil, UserPlus, Users } from "lucide-react";
import toast from "react-hot-toast";
import {
  useEmployees,
  type EmployeeInput,
} from "@/hooks/useEmployees";
import { EmployeeFormDialog } from "@/components/hr/EmployeeFormDialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { ErrorState } from "@/components/shared/ErrorState";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { EmployeeListItem } from "@/types";

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export default function HrEmployees() {
  const { employees, isLoading, error, refetch, add, edit, setActive } =
    useEmployees();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EmployeeListItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deactivating, setDeactivating] = useState<EmployeeListItem | null>(null);
  const [deactivateLoading, setDeactivateLoading] = useState(false);

  if (error)
    return (
      <ErrorState
        title="Couldn't load employees"
        description={error}
        onRetry={refetch}
      />
    );

  const handleSubmit = async (payload: EmployeeInput) => {
    setSubmitting(true);
    try {
      if (editing) {
        await edit(editing.userId, payload);
        toast.success("Employee updated");
      } else {
        await add(payload);
        toast.success("Employee added");
      }
      setFormOpen(false);
      setEditing(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivating) return;
    setDeactivateLoading(true);
    try {
      await setActive(deactivating.userId, !deactivating.isActive);
      toast.success(
        deactivating.isActive ? "Employee deactivated" : "Employee reactivated"
      );
      setDeactivating(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update status");
    } finally {
      setDeactivateLoading(false);
    }
  };

  const columns: DataTableColumn<EmployeeListItem>[] = [
    {
      key: "name",
      header: "Employee",
      sortable: true,
      render: (e) => (
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarFallback className="text-xs">{initials(e.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium leading-tight">{e.name}</p>
            <p className="text-xs text-muted-foreground">{e.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "employeeId",
      header: "ID",
      sortable: true,
      render: (e) => (
        <span className="font-mono text-xs text-muted-foreground">
          {e.employeeId}
        </span>
      ),
    },
    { key: "department", header: "Department", sortable: true },
    { key: "designation", header: "Designation", sortable: true },
    {
      key: "joinedAt",
      header: "Joined",
      sortable: true,
      render: (e) => (
        <span className="tabular-nums text-sm">
          {new Date(e.joinedAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      sortable: true,
      render: (e) => (
        <Badge
          variant="outline"
          className={
            e.isActive
              ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
              : "border-zinc-500/30 bg-zinc-500/15 text-zinc-600 dark:text-zinc-400"
          }
        >
          {e.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (e) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            title="Edit"
            onClick={() => {
              setEditing(e);
              setFormOpen(true);
            }}
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-7 px-2 text-xs ${
              e.isActive ? "text-destructive hover:text-destructive" : "text-primary"
            }`}
            onClick={() => setDeactivating(e)}
          >
            {e.isActive ? "Deactivate" : "Reactivate"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="size-6" />
            Employee Management
          </h1>
          <p className="text-sm text-muted-foreground">
            {employees.filter((e) => e.isActive).length} active ·{" "}
            {employees.length} total
          </p>
        </div>
        <Button
          className="gap-1.5"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <UserPlus className="size-4" />
          Add Employee
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Roster</CardTitle>
          <CardDescription>Search, sort and manage everyone</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={employees}
            isLoading={isLoading}
            searchKeys={["name", "email", "department", "designation"]}
            emptyMessage="No employees found"
          />
        </CardContent>
      </Card>

      <EmployeeFormDialog
        open={formOpen}
        onOpenChange={(o) => {
          setFormOpen(o);
          if (!o) setEditing(null);
        }}
        submitting={submitting}
        editing={editing}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={deactivating !== null}
        onOpenChange={(o) => !o && setDeactivating(null)}
        title={
          deactivating?.isActive
            ? `Deactivate ${deactivating?.name}?`
            : `Reactivate ${deactivating?.name}?`
        }
        description={
          deactivating?.isActive
            ? "They'll lose access to the workspace immediately."
            : "Their access to the workspace will be restored."
        }
        confirmLabel={deactivating?.isActive ? "Deactivate" : "Reactivate"}
        destructive={!!deactivating?.isActive}
        loading={deactivateLoading}
        onConfirm={handleDeactivate}
      />
    </div>
  );
}


