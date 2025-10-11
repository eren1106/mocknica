"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FaGoogle } from "react-icons/fa6";
import { signIn, signUp } from "@/lib/auth-client";
import { useState } from "react";
import { toast } from "sonner";
import { BrandLogo } from "@/components/layout/BrandLogo";
import Link from "next/link";
import SeparatorWithText from "./separator-with-text";
import { useZodForm } from "@/hooks/useZodForm";
import {
  LoginSchema,
  SignupSchema,
  LoginFormData,
  SignupFormData,
} from "@/zod-schemas/auth.schema";
import ZodForm from "./zod-form";
import GenericFormField from "./generic-form-field";

type AuthMode = "login" | "signup";

interface AuthFormProps extends React.ComponentPropsWithoutRef<"div"> {
  mode: AuthMode;
}

export function AuthForm({ mode, className, ...props }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const isSignup = mode === "signup";

  const loginForm = useZodForm(LoginSchema, {
    email: "",
    password: "",
  });

  const signupForm = useZodForm(SignupSchema, {
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (data: LoginFormData | SignupFormData) => {
    setIsLoading(true);

    try {
      const result = isSignup
        ? await signUp.email({
            email: data.email,
            password: data.password,
            name: (data as SignupFormData).name,
          })
        : await signIn.email({ email: data.email, password: data.password });

      if (result.error) {
        toast.error(result.error.message);
      } else {
        toast.success(
          isSignup ? "Account created successfully!" : "Signed in successfully!"
        );
        window.location.href = "/";
      }
    } catch (error) {
      toast.error(
        `An error occurred during ${isSignup ? "sign up" : "sign in"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch (error) {
      toast.error(
        `An error occurred during Google ${isSignup ? "sign up" : "sign in"}`
      );
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex justify-center">
        <BrandLogo size="lg" showBeta={true} />
      </div>

      <Card>
        <CardHeader className="text-center mb-2">
          <CardTitle className="text-xl">
            {isSignup ? "Create an account" : "Welcome back"}
          </CardTitle>
          {/* {isSignup && (
            <CardDescription>
              Enter your information to create an account
            </CardDescription>
          )} */}
        </CardHeader>
        <CardContent>
          {isSignup ? (
            <ZodForm form={signupForm} onSubmit={handleSubmit}>
              <div className="grid gap-6">
                <div className="flex flex-col gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center gap-2"
                    onClick={handleGoogleAuth}
                    disabled={isLoading}
                  >
                    <FaGoogle />
                    Sign up with Google
                  </Button>
                </div>

                <SeparatorWithText>Or continue with</SeparatorWithText>

                <div className="grid gap-6">
                  <GenericFormField
                    control={signupForm.control}
                    type="input"
                    name="name"
                    placeholder="Enter your name"
                    disabled={isLoading}
                  />

                  <GenericFormField
                    control={signupForm.control}
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    disabled={isLoading}
                  />

                  <GenericFormField
                    control={signupForm.control}
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create account"}
                  </Button>
                </div>

                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <Link href="/login" className="underline underline-offset-4">
                    Sign in
                  </Link>
                </div>
              </div>
            </ZodForm>
          ) : (
            <ZodForm form={loginForm} onSubmit={handleSubmit}>
              <div className="grid gap-6">
                <div className="flex flex-col gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center gap-2"
                    onClick={handleGoogleAuth}
                    disabled={isLoading}
                  >
                    <FaGoogle />
                    Login with Google
                  </Button>
                </div>

                <SeparatorWithText>Or continue with</SeparatorWithText>

                <div className="grid gap-6">
                  <GenericFormField
                    control={loginForm.control}
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    disabled={isLoading}
                  />

                  <GenericFormField
                    control={loginForm.control}
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Login"}
                  </Button>
                </div>

                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="underline underline-offset-4">
                    Sign up
                  </Link>
                </div>
              </div>
            </ZodForm>
          )}
        </CardContent>
      </Card>

      {/* {isSignup && (
        <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
          By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
          and <a href="#">Privacy Policy</a>.
        </div>
      )} */}
    </div>
  );
}
