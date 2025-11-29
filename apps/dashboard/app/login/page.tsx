import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form"

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 sm:gap-6 bg-muted p-4 sm:p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-4 sm:gap-6">
        <AuthForm mode="login" />
      </div>
    </div>
  )
}
