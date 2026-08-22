import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  BadgeIndianRupee,
  CalendarCheck2,
  CalendarClock,
  CalendarDays,
  Clock,
  LogIn,
  LogOut,
  UserRound,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/hooks/useDashboard";
import { StatCard, TONES } from "@/components/shared/StatCard";
import { LoadingButton } from "@/components/shared/LoadingButton";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ActivityItem, ActivityType } from "@/types/dashboard";

const ACTIVITY_META: Record<
  ActivityType,
  { icon: typeof Clock; className: string }
> = {
  LEAVE: { icon: CalendarDays, className: TONES.info },
  ATTENDANCE: { icon: CalendarCheck2, className: TONES.success },
  PAYROLL: { icon: Wallet, className: TONES.warning },
  PROFILE: { icon: UserRound, className: TONES.default },
};

const formatTime = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--:--";

const formatTimeAgo = (iso: string) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

function ActivityRow({ item }: { item: ActivityItem }) {
  const { icon: Icon, className } = ACTIVITY_META[item.type];
  return (
    <div className="flex items-start gap-3">
      <span
        className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${className}`}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {item.description}
        </p>
      </div>
      <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
        {formatTimeAgo(item.createdAt)}
      </span>
    </div>
  );
}

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const {
    stats,
    today,
    recentActivity,
    isLoading,
    error,
    refetch,
    checkIn,
    checkOut,
  } = useDashboard();
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (today?.status !== "CHECKED_IN") return;
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, [today?.status]);

  if (isLoading) return <DashboardSkeleton />;
  if (error)
    return (
      <ErrorState
        title="Couldn't load your dashboard"
        description={error}
        onRetry={refetch}
      />
    );
  if (!stats || !today) return null;

  const handleCheckIn = async () => {
    setIsCheckingIn(true);
    await checkIn();
    setIsCheckingIn(false);
  };

  const handleCheckOut = async () => {
    setIsCheckingOut(true);
    await checkOut();
    setIsCheckingOut(false);
  };

  const liveHours =
    today && today.status === "CHECKED_IN" && today.checkInTime
      ? Math.max(
          0,
          Number(
            ((now - new Date(today.checkInTime).getTime()) / 3_600_000).toFixed(
              1
            )
          )
        )
      : (today?.workedHours ?? 0);

  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Greeting */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {getGreeting()}, {firstName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/employee/profile" className="gap-1.5">
            <UserRound className="size-4" />
            My Profile
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Present Days"
          value={`${stats.presentDays}/${stats.workingDays}`}
          hint={`${stats.attendanceRate}% attendance rate`}
          icon={CalendarCheck2}
          iconClassName={TONES.success}
        />
        <StatCard
          title="Leave Balance"
          value={`${stats.leaveBalance} days`}
          hint={`${stats.pendingRequests} request pending`}
          icon={CalendarClock}
          iconClassName={TONES.info}
        />
        <StatCard
          title="Net Salary"
          value={`₹${stats.netSalary.toLocaleString("en-IN")}`}
          hint="Last processed payroll"
          icon={BadgeIndianRupee}
          iconClassName={TONES.warning}
        />
        <StatCard
          title="Pending Requests"
          value={stats.pendingRequests}
          hint={
            stats.pendingRequests > 0
              ? "Awaiting HR action"
              : "All clear"
          }
          icon={CalendarDays}
          iconClassName={stats.pendingRequests > 0 ? TONES.danger : TONES.default}
        />
      </div>

      {/* Today + Activity */}
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Today's Attendance</CardTitle>
            <CardDescription>
              Mark your presence for{" "}
              {new Date().toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-3 gap-3 rounded-xl border bg-muted/30 p-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Check In</p>
                <p className="text-lg font-semibold tabular-nums">
                  {formatTime(today.checkInTime)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Worked</p>
                <p className="text-lg font-semibold tabular-nums">
                  {liveHours.toFixed(1)}h
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Check Out</p>
                <p className="text-lg font-semibold tabular-nums">
                  {formatTime(today.checkOutTime)}
                </p>
              </div>
            </div>

            {today.status === "NOT_CHECKED_IN" && (
              <div className="flex items-center justify-between gap-4 rounded-lg border border-dashed p-3">
                <p className="text-sm text-muted-foreground">
                  You haven't checked in yet.
                </p>
                <LoadingButton
                  loading={isCheckingIn}
                  loadingText="Checking in..."
                  onClick={handleCheckIn}
                  className="gap-1.5"
                >
                  <LogIn className="size-4" />
                  Check In
                </LoadingButton>
              </div>
            )}

            {today.status === "CHECKED_IN" && (
              <div className="flex items-center justify-between gap-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="relative flex size-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
                  </span>
                  Checked in at {formatTime(today.checkInTime)}
                </div>
                <LoadingButton
                  variant="outline"
                  loading={isCheckingOut}
                  loadingText="Checking out..."
                  onClick={handleCheckOut}
                  className="gap-1.5"
                >
                  <LogOut className="size-4" />
                  Check Out
                </LoadingButton>
              </div>
            )}

            {today.status === "CHECKED_OUT" && (
              <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/40 p-3">
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="size-4" />
                  Day complete — {today.workedHours}h logged. See you tomorrow!
                </p>
                <Button variant="ghost" size="sm" onClick={refetch}>
                  Refresh
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest updates</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <EmptyState
                title="No activity yet"
                description="Leave requests, payroll and attendance updates will appear here."
              />
            ) : (
              <div className="space-y-5">
                {recentActivity.map((item) => (
                  <ActivityRow key={item.id} item={item} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

