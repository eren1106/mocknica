import { apiResponse, errorResponse } from "../../_helpers/api-response";
import { NextRequest } from "next/server";
import { ProjectData } from "@/data/project.data";
import { requireAuthAndProjectOwnership } from "../../_helpers/auth-guards";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const authResult = await requireAuthAndProjectOwnership(req, id);
    
    if (authResult instanceof Response) return authResult;

    // Since ownership is already verified, we can use the regular getProject method
    const project = await ProjectData.getProject(id);
    return apiResponse(req, { data: project });
  } catch (error) {
    return errorResponse(req, { error });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const authResult = await requireAuthAndProjectOwnership(req, id);
    
    if (authResult instanceof Response) return authResult;

    const data = await req.json();
    const project = await ProjectData.updateProject(id, data);
    return apiResponse(req, { data: project });
  } catch (error) {
    return errorResponse(req, { error });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const authResult = await requireAuthAndProjectOwnership(req, id);
    
    if (authResult instanceof Response) return authResult;

    await ProjectData.deleteProject(id);
    return apiResponse(req, { data: { success: true } });
  } catch (error) {
    return errorResponse(req, { error });
  }
}
