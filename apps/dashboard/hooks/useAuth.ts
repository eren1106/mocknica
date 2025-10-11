import { useSession as useBetterAuthSession } from "@/lib/auth-client"

export function useAuth() {
  const session = useBetterAuthSession()
  
  return {
    user: session.data?.user,
    isLoading: session.isPending,
    isAuthenticated: !!session.data?.user,
    session: session.data,
    error: session.error
  }
}
