import { Button } from "@/components/ui/button";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import apiInstance from "@/services/auth.api";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const res = await apiInstance.post("/auth/forgot-password", { email });
      toast.success(res.data?.message || "OTP sent successfully to your email");
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10 relative">
      <div className="absolute top-4 right-4">
        <AnimatedThemeToggler className="p-2 rounded-full border border-border bg-background shadow-sm hover:bg-muted" />
      </div>
      <div className="w-full max-w-sm md:max-w-md">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden p-0">
            <CardContent className="p-0">
              <form className="p-6 md:p-8" onSubmit={handleSubmit}>
                <FieldGroup className="gap-5">
                  <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold tracking-tight">
                      Forgot Password
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Enter your email to receive an OTP
                    </p>
                  </div>

                  <Field>
                    <FieldLabel htmlFor="forgot-email">Email</FieldLabel>
                    <Input
                      id="forgot-email"
                      type="email"
                      value={email}
                      placeholder="you@example.com"
                      required
                      disabled={isLoading}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setEmail(e.target.value);
                      }}
                    />
                  </Field>

                  <Field>
                    <Button
                      type="submit"
                      className="w-full cursor-pointer"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Spinner size="sm" variant="button" className="mr-2" />
                      ) : null}
                      Send OTP
                    </Button>
                  </Field>

                  <div className="text-center text-sm">
                    Remember your password?{" "}
                    <a
                      href="/sign-in"
                      className="font-medium underline underline-offset-4 hover:text-foreground transition-colors"
                    >
                      Sign in
                    </a>
                  </div>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
