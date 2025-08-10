import { apiResponse, errorResponse } from "@/app/api/_helpers/api-response";
import { requireAuth } from "@/app/api/_helpers/auth-guards";
import { validateRequestBody } from "@/app/api/_helpers/validation";
import { EndpointService } from "@/services/backend/endpoint.service";
import { NextRequest } from "next/server";
import { z } from "zod";

const CreateEndpointsBySchemaSchema = z.object({
  schemaId: z.number().int().positive(),
  basePath: z.string().min(1, "Base path is required"),
  responseWrapperId: z.number().int().positive().optional(),
  projectId: z.string().min(1, "Project ID is required"),
});

export async function POST(req: NextRequest) {
    try {
        const sessionResult = await requireAuth(req);
        if (sessionResult instanceof Response) return sessionResult;

        const validationResult = await validateRequestBody(req, CreateEndpointsBySchemaSchema);
        if (validationResult instanceof Response) return validationResult;

        const endpoints = await EndpointService.createEndpointsBySchema(
            validationResult,
            sessionResult.user.id
        );

        return apiResponse(req, { data: endpoints });
    } catch (error) {
        return errorResponse(req, { error });
    }
}