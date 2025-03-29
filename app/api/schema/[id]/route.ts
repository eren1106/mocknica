import { errorResponse } from "../../_helpers/api-response";
import { NextRequest } from "next/server";
import { SchemaData } from "@/data/schema.data";
import { apiResponse } from "../../_helpers/api-response";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const schema = await SchemaData.getSchema(Number(id));
    return apiResponse(req, { data: schema });
  } catch (error) {
    return errorResponse(req, { error });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();
    const schema = await SchemaData.updateSchema(Number(id), data);
    return apiResponse(req, { data: schema });
  } catch (error) {
    return errorResponse(req, { error });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const schema = await SchemaData.deleteSchema(Number(id));
    return apiResponse(req, { data: schema });
  } catch (error) {
    return errorResponse(req, { error });
  }
}       