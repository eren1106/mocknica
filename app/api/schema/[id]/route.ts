import { errorResponse } from "../../_helpers/api-response";
import { NextRequest } from "next/server";
import { SchemaData } from "@/data/schema.data";
import { apiResponse } from "../../_helpers/api-response";
import { requireAuth, requireProjectOwnership } from "../../_helpers/auth-guards";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sessionResult = await requireAuth(req);
    if (sessionResult instanceof Response) return sessionResult;

    const { id } = await params;
    const schema = await SchemaData.getSchema(Number(id));
    
    if (!schema || !schema.projectId) {
      return errorResponse(req, { error: "Schema not found", statusCode: 404 });
    }

    // Verify project ownership
    const ownershipResult = await requireProjectOwnership(req, schema.projectId, sessionResult.user.id);
    if (ownershipResult instanceof Response) return ownershipResult;

    return apiResponse(req, { data: schema });
  } catch (error) {
    return errorResponse(req, { error });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sessionResult = await requireAuth(req);
    if (sessionResult instanceof Response) {
      return sessionResult;
    }

    const { id } = await params;
    
    // Get current schema to verify ownership
    const currentSchema = await SchemaData.getSchema(Number(id));
    if (!currentSchema || !currentSchema.projectId) {
      return errorResponse(req, { error: "Schema not found", statusCode: 404 });
    }

    // Verify project ownership
    const ownershipResult = await requireProjectOwnership(req, currentSchema.projectId, sessionResult.user.id);
    if (ownershipResult instanceof Response) {
      return ownershipResult;
    }

    const data = await req.json();
    const schema = await SchemaData.updateSchema(Number(id), data);
    return apiResponse(req, { data: schema });
  } catch (error) {
    return errorResponse(req, { error });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sessionResult = await requireAuth(req);
    if (sessionResult instanceof Response) {
      return sessionResult;
    }

    const { id } = await params;
    
    // Get current schema to verify ownership
    const currentSchema = await SchemaData.getSchema(Number(id));
    if (!currentSchema || !currentSchema.projectId) {
      return errorResponse(req, { error: "Schema not found", statusCode: 404 });
    }

    // Verify project ownership
    const ownershipResult = await requireProjectOwnership(req, currentSchema.projectId, sessionResult.user.id);
    if (ownershipResult instanceof Response) {
      return ownershipResult;
    }

    const schema = await SchemaData.deleteSchema(Number(id));
    return apiResponse(req, { data: schema });
  } catch (error) {
    return errorResponse(req, { error });
  }
}       