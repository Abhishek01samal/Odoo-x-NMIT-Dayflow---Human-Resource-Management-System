import { Button } from "@/components/ui/button";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { Eye, EyeOff, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAuthContext } from "@/context/AuthContext";
import { Spinner } from "@/components/ui/spinner";
import { Link, useNavigate } from "react-router";
import toast from "react-hot-toast";

const DEMO_ACCOUNTS = [
  { label: "Admin", email: "admin@dayflow.io", password: "Admin@123", role: "ADMIN" },
  { label: "HR", email: "hr@dayflow.io", password: "Hr@12345", role: "HR" },
  { label: "Employee", email: "employee@dayflow.io", password: "Employee@123", role: "EMPLOYEE" },
];

const REMEMBER_KEY = "dayflow.rememberEmail";

const homeFor = (role?: string) => {
  if (role === "ADMIN") return "/admin/dashboard";
  if (role === "HR") return "/hr/dashboard";
  return "/employee/dashboard";
};

const SignIn = () => {
  const [email, setEmail] = useState<string>(
    () => localStorage.getItem(REMEMBER_KEY) ?? ""
  );
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [remember, setRemember] = useState<boolean>(
    () => !!localStorage.getItem(REMEMBER_KEY)
  );
  const { isLoading, login } = useAuth();
  const { setUser, setIsInitialized } = useAuthContext();
  const navigate = useNavigate();

  // DEV MODE: Force login without backend — sets mock user directly
  const forceLogin = (account: (typeof DEMO_ACCOUNTS)[number]) => {
    const mockUser = {
      id: `mock-${account.role.toLowerCase()}-001`,
      name: `Demo ${account.label}`,
      email: account.email,
      role: account.role,
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setUser(mockUser);
    setIsInitialized(true);
    toast.success(`Logged in as ${account.label} (Dev Mode)`);
    navigate(homeFor(account.role));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (remember) {
      localStorage.setItem(REMEMBER_KEY, email);
    } else {
      localStorage.removeItem(REMEMBER_KEY);
    }
    login({ email, password });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10 relative">
      <div className="absolute top-4 right-4">
        <AnimatedThemeToggler className="p-2 rounded-full border border-border bg-background shadow-sm hover:bg-muted" />
      </div>
      <div className="w-full max-w-sm md:max-w-3xl">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden p-0">
            <CardContent className="grid p-0 md:grid-cols-2">
              <form className="p-6 md:p-8" onSubmit={handleSubmit}>
                <FieldGroup className="gap-5">
                  <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold tracking-tight">
                      Welcome back
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Sign in to Dayflow — Human Resource Management
                    </p>
                  </div>

                  {/* Email */}
                  <Field>
                    <FieldLabel htmlFor="signin-email">Email</FieldLabel>
                    <Input
                      id="signin-email"
                      type="email"
                      value={email}
                      placeholder="you@example.com"
                      required
                      disabled={isLoading}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setEmail(e.target.value);
                        e.target.setCustomValidity("");
                      }}
                    />
                  </Field>

                  {/* Password */}
                  <Field>
                    <div className="flex items-center justify-between">
                      <FieldLabel htmlFor="signin-password">Password</FieldLabel>
                      <Link
                        to="/forgot-password"
                        className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter Your Password"
                        value={password}
                        required
                        className="pr-10"
                        disabled={isLoading}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setPassword(e.target.value);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </Field>

                  {/* Remember me */}
                  <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="size-4 rounded border-border accent-[var(--primary)]"
                    />
                    Remember me
                  </label>

                  {/* Submit */}
                  <Field>
                    <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </Field>

                  {/* DEV MODE: Force login without backend */}
                  <div className="rounded-lg border border-dashed border-amber-500/60 bg-amber-500/5 p-3 space-y-2">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-amber-600 flex items-center gap-1">
                      <Zap className="size-3" /> Dev Mode — bypass backend
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {DEMO_ACCOUNTS.map((account) => (
                        <button
                          key={`force-${account.email}`}
                          type="button"
                          onClick={() => forceLogin(account)}
                          className="rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-500/20 transition-colors"
                        >
                          {account.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <FieldDescription className="text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <Link
                      to="/sign-up"
                      className="font-medium underline underline-offset-4 hover:text-foreground transition-colors"
                    >
                      Sign up
                    </Link>
                  </FieldDescription>
                </FieldGroup>
              </form>

              {/* Image panel */}
              <div className="relative hidden bg-muted md:block">
                <img
                  src="/signin-bg.png"
                  alt="Sign in visual"
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col justify-end p-8">
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white/80">JWT</span>
                      <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white/80">Redis</span>
                      <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white/80">RBAC</span>
                    </div>
                    <p className="text-white text-lg font-semibold leading-snug">
                      Secure by design.
                      <br />
                      <span className="text-white/70 text-sm font-normal">
                        Enterprise-grade authentication for your workforce.
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <FieldDescription className="px-6 text-center text-xs text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <a href="#" className="underline underline-offset-4 hover:text-foreground transition-colors">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline underline-offset-4 hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            .
          </FieldDescription>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
