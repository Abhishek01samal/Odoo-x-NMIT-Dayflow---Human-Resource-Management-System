import { useState } from "react";
import { ShieldCheck, UserCog } from "lucide-react";
import toast from "react-hot-toast";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { ErrorState } from "@/components/shared/ErrorState";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingButton } from "@/components/shared/LoadingButton";
import type { AdminUser, SystemRole } from "@/types";

const ROLE_BADGE: Record<SystemRole, string> = {
  EMPLOYEE:
    "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  HR: "border-indigo-500/30 bg-indigo-500/15 text-indigo-700 dark:text-indigo-400",
  ADMIN:
    "border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-400",
};

const inputCls =
  "flex h-9 w-full rounded-lg border border-border bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none";

export default function AdminUsers() {
  const { users, isLoading, error, refetch, changeRole, setActive } =
    useAdminUsers();
  const [roleTarget, setRoleTarget] = useState<AdminUser | null>(null);
  const [newRole, setNewRole] = useState<SystemRole>("EMPLOYEE");
  const [roleSaving, setRoleSaving] = useState(false);
  const [activeTarget, setActiveTarget] = useState<AdminUser | null>(null);
  const [activeSaving, setActiveSaving] = useState(false);

  if (error)
    return (
      <ErrorState
        title="Couldn't load users"
        description={error}
        onRetry={refetch}
      />
    );

  const handleRoleChange = async () => {
    if (!roleTarget) return;
    setRoleSaving(true);
    try {
      await changeRole(roleTarget.id, newRole);
      toast.success(`${roleTarget.name} is now ${newRole}`);
      setRoleTarget(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update role");
    } finally {
      setRoleSaving(false);
    }
  };

  const handleActiveToggle = async () => {
    if (!activeTarget) return;
    setActiveSaving(true);
    try {
      await setActive(activeTarget.id, !activeTarget.isActive);
      toast.success(activeTarget.isActive ? "Account disabled" : "Account enabled");
      setActiveTarget(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update status");
    } finally {
      setActiveSaving(false);
    }
  };

  const columns: DataTableColumn<AdminUser>[] = [
    {
      key: "name",
      header: "User",
      sortable: true,
      render: (u) => (
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarFallback className="text-xs">
              {u.name
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium leading-tight">{u.name}</p>
            <p className="text-xs text-muted-foreground">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      sortable: true,
      render: (u) => (
        <Badge variant="outline" className={`${ROLE_BADGE[u.role]} border`}>
          {u.role}
        </Badge>
      ),
    },
    {
      key: "isVerified",
      header: "Verified",
      render: (u) =>
        u.isVerified ? (
          <span className="text-xs text-emerald-600 dark:text-emerald-400">
            Yes
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">No</span>
        ),
    },
    {
      key: "createdAt",
      header: "Joined",
      sortable: true,
      render: (u) => (
        <span className="tabular-nums text-sm">
          {new Date(u.createdAt).toLocaleDateString("en-IN", {
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
      render: (u) => (
        <Badge
          variant="outline"
          className={
            u.isActive
              ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
              : "border-zinc-500/30 bg-zinc-500/15 text-zinc-600 dark:text-zinc-400"
          }
        >
          {u.isActive ? "Active" : "Disabled"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (u) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs"
            onClick={() => {
              setRoleTarget(u);
              setNewRole(u.role);
            }}
          >
            <UserCog className="size-3.5" />
            Role
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-7 px-2 text-xs ${
              u.isActive ? "text-destructive hover:text-destructive" : "text-primary"
            }`}
            onClick={() => setActiveTarget(u)}
          >
            {u.isActive ? "Disable" : "Enable"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <ShieldCheck className="size-6" />
          Users & Roles
        </h1>
        <p className="text-sm text-muted-foreground">
          Control who has access and what they can do
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Accounts ({users.length})</CardTitle>
          <CardDescription>
            Role changes apply immediately
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={users}
            isLoading={isLoading}
            searchKeys={["name", "email", "role"]}
            emptyMessage="No user accounts found"
          />
        </CardContent>
      </Card>

      <Dialog open={roleTarget !== null} onOpenChange={(o) => !o && setRoleTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Change role for {roleTarget?.name}</DialogTitle>
            <DialogDescription>
              Their permissions update instantly.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label htmlFor="role-select" className="text-sm font-medium">
              Role
            </label>
            <select
              id="role-select"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as SystemRole)}
              className={inputCls}
            >
              <option value="EMPLOYEE">EMPLOYEE — self-service only</option>
              <option value="HR">HR — manage people & attendance</option>
              <option value="ADMIN">ADMIN — full system control</option>
            </select>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRoleTarget(null)}>
              Cancel
            </Button>
            <LoadingButton loading={roleSaving} loadingText="Updating…" onClick={handleRoleChange}>
              Update role
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={activeTarget !== null}
        onOpenChange={(o) => !o && setActiveTarget(null)}
        title={
          activeTarget?.isActive
            ? `Disable ${activeTarget?.name}'s account?`
            : `Enable ${activeTarget?.name}'s account?`
        }
        description={
          activeTarget?.isActive
            ? "They will be signed out and blocked from signing in."
            : "They'll be able to sign in again."
        }
        confirmLabel={activeTarget?.isActive ? "Disable account" : "Enable account"}
        destructive={!!activeTarget?.isActive}
        loading={activeSaving}
        onConfirm={handleActiveToggle}
      />
    </div>
  );
}
