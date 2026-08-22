import { Button } from "@/components/ui/button";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import apiInstance from "@/services/auth.api";
import { useNavigate, useSearchParams } from "react-router";
import toast from "react-hot-toast";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState<string>(searchParams.get("email") || "");
  const [otp, setOtp] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const res = await apiInstance.post("/auth/reset-password", {
        email,
        otp,
        newPassword,
      });
      toast.success(res.data?.message || "Password reset successfully");
      navigate("/sign-in");
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
                      Reset Password
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Enter the OTP sent to your email and your new password
                    </p>
                  </div>

                  <Field>
                    <FieldLabel htmlFor="reset-email">Email</FieldLabel>
                    <Input
                      id="reset-email"
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
                    <FieldLabel htmlFor="reset-otp">OTP</FieldLabel>
                    <Input
                      id="reset-otp"
                      type="text"
                      value={otp}
                      placeholder="Enter 6-digit OTP"
                      required
                      maxLength={6}
                      disabled={isLoading}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setOtp(e.target.value);
                      }}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="new-password">New Password</FieldLabel>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      placeholder="Enter new password"
                      required
                      disabled={isLoading}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setNewPassword(e.target.value);
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
                      Reset Password
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
