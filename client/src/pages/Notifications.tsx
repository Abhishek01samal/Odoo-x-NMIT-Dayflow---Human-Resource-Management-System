import { Bell, CheckCheck, Megaphone, Settings2, UserCheck } from "lucide-react";
import toast from "react-hot-toast";
import { useNotifications } from "@/hooks/useNotifications";
import { ErrorState } from "@/components/shared/ErrorState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { NotificationType } from "@/types";

const TYPE_META: Record<
  NotificationType,
  { icon: typeof Bell; tone: string; label: string }
> = {
  INFO: {
    icon: Bell,
    tone: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    label: "Info",
  },
  LEAVE_UPDATE: {
    icon: UserCheck,
    tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    label: "Leave Update",
  },
  PAYROLL: {
    icon: Megaphone,
    tone: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    label: "Payroll",
  },
  ATTENDANCE: {
    icon: Settings2,
    tone: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    label: "Attendance",
  },
  SYSTEM: {
    icon: Settings2,
    tone: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
    label: "System",
  },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

export default function Notifications() {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    refetch,
    markRead,
    markAllRead,
  } = useNotifications();

  const handleMarkAll = async () => {
    try {
      await markAllRead();
      toast.success("All caught up");
    } catch {
      toast.error("Couldn't mark all as read");
    }
  };

  if (error)
    return (
      <ErrorState
        title="Couldn't load notifications"
        description={error}
        onRetry={refetch}
      />
    );

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Loading…"
              : unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                : "You're all caught up"}
          </p>
        </div>
        {!isLoading && unreadCount > 0 && (
          <Button variant="outline" className="gap-1.5" onClick={handleMarkAll}>
            <CheckCheck className="size-4" />
            Mark all read
          </Button>
        )}
      </div>

      <div className="space-y-2.5">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[72px] animate-pulse rounded-xl border bg-muted/40"
              />
            ))
          : notifications.length === 0
            ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center gap-3 py-14 text-center">
                  <Bell className="size-8 text-muted-foreground" />
                  <p className="font-medium">Nothing here yet</p>
                  <p className="text-sm text-muted-foreground">
                    Leave updates and announcements will appear here.
                  </p>
                </CardContent>
              </Card>
            )
            : notifications.map((n) => {
                const meta = TYPE_META[n.type];
                const Icon = meta.icon;
                return (
                  <button
                    type="button"
                    key={n.id}
                    onClick={() => void markRead(n.id)}
                    className={`w-full flex items-start gap-4 rounded-xl border p-4 text-left transition-colors ${
                      n.isRead
                        ? "bg-background hover:bg-muted/30"
                        : "bg-primary/[0.04] border-primary/20 hover:bg-primary/[0.08]"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg ${meta.tone}`}
                    >
                      <Icon className="size-4" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm leading-snug ${n.isRead ? "" : "font-semibold"}`}
                        >
                          {n.title}
                        </p>
                        <span className="shrink-0 text-xs whitespace-nowrap text-muted-foreground tabular-nums">
                          {timeAgo(n.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground leading-snug">
                        {n.message}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="secondary" className="text-[11px]">
                          {meta.label}
                        </Badge>
                        {!n.isRead && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary">
                            <span className="size-1.5 rounded-full bg-primary" />
                            New
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
      </div>
    </div>
  );
}
