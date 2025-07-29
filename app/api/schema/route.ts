import { apiResponse, errorResponse } from "../_helpers/api-response";
import { NextRequest } from "next/server";
import { SchemaData } from "@/data/schema.data";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const schemas = await SchemaData.getAllSchemas(projectId || undefined);
    return apiResponse(req, { data: schemas });
  } catch (error) {
    return errorResponse(req, { error });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const schema = await SchemaData.createSchema(data);
    return apiResponse(req, { data: schema });
  } catch (error) {
    return errorResponse(req, { error });
  }
}