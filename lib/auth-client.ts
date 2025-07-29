import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000", // the base url of your auth server
})

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient
