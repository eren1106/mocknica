import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"
import { checkRateLimit } from "@/lib/rate-limit"
import { NextRequest } from "next/server"

const handlers = toNextJsHandler(auth)

// Apply rate limiting to auth endpoints (signup, signin, etc.)
export const GET = handlers.GET

export async function POST(req: NextRequest) {
  // Check rate limit for auth operations
  const { success, response } = await checkRateLimit(req, "AUTH")
  if (!success && response) return response
  
  return handlers.POST(req)
}
