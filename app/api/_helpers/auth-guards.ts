import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { ProjectData } from "@/data/project.data";
import { errorResponse } from "./api-response";

export interface AuthSession {
  user: {
    id: string;
    email?: string;
    name?: string;
    image?: string;
  };
}

/**
 * Verify that the user is authenticated
 */
export async function requireAuth(req: NextRequest): Promise<AuthSession | Response> {
  try {
    const session = await auth.api.getSession({
      headers: req.headers
    });
    
    if (!session?.user?.id) {
      return errorResponse(req, { error: "Unauthorized", statusCode: 401 });
    }

    return session as AuthSession;
  } catch (error) {
    console.error('Error during authentication:', error);
    return errorResponse(req, { error: "Authentication failed", statusCode: 401 });
  }
}

/**
 * Verify that the user owns the specified project
 */
export async function requireProjectOwnership(
  req: NextRequest, 
  projectId: string, 
  userId: string
): Promise<true | Response> {
  try {
    const project = await ProjectData.getProjectByUserAndId(projectId, userId);
    
    if (!project) {
      return errorResponse(req, { error: "Project not found", statusCode: 404 });
    }

    return true;
  } catch (error) {
    console.error('Error checking project ownership:', error);
    return errorResponse(req, { error: "Failed to verify project ownership", statusCode: 500 });
  }
}

/**
 * Combined auth and project ownership check
 */
export async function requireAuthAndProjectOwnership(
  req: NextRequest, 
  projectId: string
): Promise<{ session: AuthSession; success: true } | Response> {
  const sessionResult = await requireAuth(req);
  
  if (sessionResult instanceof Response) {
    return sessionResult;
  }

  const ownershipResult = await requireProjectOwnership(req, projectId, sessionResult.user.id);
  
  if (ownershipResult instanceof Response) {
    return ownershipResult;
  }

  return {
    session: sessionResult,
    success: true
  };
}
