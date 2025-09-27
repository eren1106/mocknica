import { SignUpForm } from "@/components/signup-form"
import Link from "next/link"

export default function SignUpPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 sm:gap-6 bg-muted p-4 sm:p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-4 sm:gap-6">
        <Link href="/" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            M
          </div>
          Mocka
        </Link>
        <SignUpForm />
      </div>
    </div>
  )
}
