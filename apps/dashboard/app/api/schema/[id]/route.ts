import { errorResponse } from "../../_helpers/api-response";
import { NextRequest } from "next/server";
import { apiResponse } from "../../_helpers/api-response";
import { requireAuth } from "../../_helpers/auth-guards";
import { validateRequestBody } from "../../_helpers/validation";
import { schemaService } from "@/lib/services";
import { SchemaSchema } from "@/zod-schemas/schema.schema";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sessionResult = await requireAuth(req);
    if (sessionResult instanceof Response) return sessionResult;

    const { id } = await params;
    const schema = await schemaService.getSchema(Number(id), sessionResult.user.id);
    
    return apiResponse(req, { data: schema });
  } catch (error) {
    return errorResponse(req, { error });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sessionResult = await requireAuth(req);
    if (sessionResult instanceof Response) return sessionResult;

    const { id } = await params;
    
    // TODO: Check whether the schema belongs to the project of this user
    
    const validationResult = await validateRequestBody(req, SchemaSchema);
    if (validationResult instanceof Response) return validationResult;

    const schema = await schemaService.updateSchema(
      Number(id), 
      validationResult,
      sessionResult.user.id
    );
    
    return apiResponse(req, { data: schema });
  } catch (error) {
    return errorResponse(req, { error });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sessionResult = await requireAuth(req);
    if (sessionResult instanceof Response) return sessionResult;

    const { id } = await params;
    
    const schema = await schemaService.deleteSchema(Number(id), sessionResult.user.id);
    
    return apiResponse(req, { data: schema });
  } catch (error) {
    return errorResponse(req, { error });
  }
}       