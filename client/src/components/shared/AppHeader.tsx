import { Link } from "react-router";
import { LogOut } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const homeFor = (role?: string) => {
  if (role === "ADMIN") return "/admin/dashboard";
  if (role === "HR") return "/hr/dashboard";
  return "/employee/dashboard";
};

export default function AppHeader() {
  const { user } = useAuthContext();
  const { logout, isLoading } = useAuth();

  if (!user) return null;

  const displayName = user.name || user.email || "Account";
  const initials = displayName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          to={homeFor(user.role)}
          className="flex items-center gap-2.5 min-w-0"
        >
          <span className="text-base font-bold tracking-tight">
            Dayflow
          </span>
          <Badge variant="secondary" className="hidden sm:inline-flex text-[11px]">
            {user.role ?? "EMPLOYEE"}
          </Badge>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-2 min-w-0">
            <Avatar className="size-8">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="leading-tight min-w-0">
              <p className="truncate text-sm font-medium">{displayName}</p>
              {user.email ? (
                <p className="truncate text-[11px] text-muted-foreground">
                  {user.email}
                </p>
              ) : null}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            title="Sign out"
            disabled={isLoading}
            onClick={() => void logout()}
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}


