import { apiResponse, errorResponse } from "../_helpers/api-response";
import { NextRequest } from "next/server";
import { requireAuth } from "../_helpers/auth-guards";
import { validateRequestBody } from "../_helpers/validation";
import { ProjectSchema } from "@/zod-schemas/project.schema";
import { ProjectService } from "@/services/backend/project.service";

export async function GET(req: NextRequest) {
  try {
    const sessionResult = await requireAuth(req);
    if (sessionResult instanceof Response) return sessionResult;

    const projects = await ProjectService.getUserProjects(sessionResult.user.id);
    return apiResponse(req, { data: projects });
  } catch (error) {
    return errorResponse(req, { error });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionResult = await requireAuth(req);
    if (sessionResult instanceof Response) return sessionResult;

    const validationResult = await validateRequestBody(req, ProjectSchema);
    if (validationResult instanceof Response) return validationResult;

    const project = await ProjectService.createProject(
      validationResult, 
      sessionResult.user.id
    );
    
    return apiResponse(req, { data: project });
  } catch (error) {
    return errorResponse(req, { error });
  }
}
