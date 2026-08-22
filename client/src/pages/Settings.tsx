import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Bell,
  LogOut,
  Moon,
  Palette,
  ShieldCheck,
  Sun,
  UserRound,
} from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { useThemeToggle } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
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

const NOTIF_PREFS_KEY = "dayflow.notifPrefs";

type NotifPrefs = {
  leaveUpdates: boolean;
  payroll: boolean;
  announcements: boolean;
};

const DEFAULT_PREFS: NotifPrefs = {
  leaveUpdates: true,
  payroll: true,
  announcements: false,
};

function loadPrefs(): NotifPrefs {
  try {
    return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem(NOTIF_PREFS_KEY) ?? "{}") };
  } catch {
    return DEFAULT_PREFS;
  }
}

function ToggleRow({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-background shadow transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export default function Settings() {
  const { user } = useAuthContext();
  const { logout } = useAuth();
  const { theme, setTheme } = useThemeToggle();
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState<NotifPrefs>(loadPrefs);
  const [signingOut, setSigningOut] = useState(false);

  const updatePref = (key: keyof NotifPrefs, value: boolean) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    localStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(next));
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await logout();
      navigate("/sign-in");
    } finally {
      setSigningOut(false);
    }
  };

  const themeOptions = [
    { key: "light", label: "Light", icon: Sun },
    { key: "dark", label: "Dark", icon: Moon },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Preferences for your Dayflow account
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="size-4" />
            Account
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="size-12">
            <AvatarFallback>
              {(user?.name ?? user?.email ?? "?")
                .split(" ")
                .map((p: string) => p[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{user?.name ?? "—"}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email ?? "—"}
            </p>
          </div>
          {user?.role && (
            <Badge variant="secondary" className="shrink-0">
              {user.role}
            </Badge>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="size-4" />
            Appearance
          </CardTitle>
          <CardDescription>Select your interface theme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:max-w-xs">
            {themeOptions.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setTheme(opt.key)}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-colors ${
                  theme === opt.key
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <opt.icon className="size-5" />
                {opt.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="size-4" />
            Notifications
          </CardTitle>
          <CardDescription>Choose what you want to hear about</CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          <ToggleRow
            label="Leave updates"
            desc="Approvals, rejections and HR comments"
            checked={prefs.leaveUpdates}
            onChange={(v) => updatePref("leaveUpdates", v)}
          />
          <ToggleRow
            label="Payroll alerts"
            desc="When your payslip is processed or paid"
            checked={prefs.payroll}
            onChange={(v) => updatePref("payroll", v)}
          />
          <ToggleRow
            label="Announcements"
            desc="Company-wide news and events"
            checked={prefs.announcements}
            onChange={(v) => updatePref("announcements", v)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-4" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Change your password and review security options.
          </p>
          <Button variant="outline" onClick={() => navigate("/employee/profile")}>
            Open security
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <LogOut className="size-4" />
            Session
          </CardTitle>
          <CardDescription>Sign out of this device</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </Button>
        </CardContent>
      </Card>

      <p className="pb-4 text-center text-xs text-muted-foreground">
        Dayflow HRMS · Built for Odoo x NMIT Hackathon · v1.0.0
      </p>
    </div>
  );
}
