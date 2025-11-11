import { apiResponse, errorResponse } from "../_helpers/api-response";
import { NextRequest } from "next/server";
import { requireAuth } from "../_helpers/auth-guards";
import { validateRequestBody, validateQueryParams } from "../_helpers/validation";
import { schemaService } from "@/lib/services";
import { PayloadSchemaSchema } from "@/zod-schemas/schema.schema";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";

const GetSchemasQuerySchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
});

export async function GET(req: NextRequest) {
  try {
    const sessionResult = await requireAuth(req);
    if (sessionResult instanceof Response) return sessionResult;

    const queryValidation = validateQueryParams(req, GetSchemasQuerySchema);
    if (queryValidation instanceof Response) return queryValidation;

    const { projectId } = queryValidation;
    
    const schemas = await schemaService.getProjectSchemas(projectId, sessionResult.user.id);
    return apiResponse(req, { data: schemas });
  } catch (error) {
    return errorResponse(req, { error });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionResult = await requireAuth(req);
    if (sessionResult instanceof Response) return sessionResult;

    // Rate limit check for schema creation
    const rateLimitResult = await checkRateLimit(req, "CREATE", sessionResult.user.id);
    if (!rateLimitResult.success && rateLimitResult.response) return rateLimitResult.response;

    const validationResult = await validateRequestBody(req, PayloadSchemaSchema);
    if (validationResult instanceof Response) return validationResult;

    const schema = await schemaService.createSchema(
      {
        name: validationResult.name,
        fields: validationResult.fields,
      },
      validationResult.projectId,
      sessionResult.user.id
    );
    
    return apiResponse(req, { data: schema });
  } catch (error) {
    return errorResponse(req, { error });
  }
}