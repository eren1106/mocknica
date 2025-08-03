import { apiResponse, errorResponse } from "../_helpers/api-response";
import { NextRequest } from "next/server";
import { SchemaData } from "@/data/schema.data";
import { requireAuth, requireProjectOwnership } from "../_helpers/auth-guards";

export async function GET(req: NextRequest) {
  try {
    const sessionResult = await requireAuth(req);
    if (sessionResult instanceof Response) return sessionResult;

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    
    if (projectId) {
      // Verify project ownership
      const ownershipResult = await requireProjectOwnership(req, projectId, sessionResult.user.id);
      if (ownershipResult instanceof Response) {
        return ownershipResult;
      }
      
      const schemas = await SchemaData.getAllSchemas(projectId);
      return apiResponse(req, { data: schemas });
    }

    return errorResponse(req, { error: "Project not found", statusCode: 404 });
  } catch (error) {
    return errorResponse(req, { error });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionResult = await requireAuth(req);
    if (sessionResult instanceof Response) {
      return sessionResult;
    }

    const data = await req.json();
    
    // Verify project ownership if projectId is provided
    if (data.projectId) {
      const ownershipResult = await requireProjectOwnership(req, data.projectId, sessionResult.user.id);
      if (ownershipResult instanceof Response) {
        return ownershipResult;
      }
    }

    const schema = await SchemaData.createSchema(data);
    return apiResponse(req, { data: schema });
  } catch (error) {
    return errorResponse(req, { error });
  }
}