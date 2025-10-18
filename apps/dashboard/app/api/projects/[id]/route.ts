import { apiResponse, errorResponse } from "../../_helpers/api-response";
import { NextRequest } from "next/server";
import { requireAuthAndProjectOwnership } from "../../_helpers/auth-guards";
import { projectService } from "@/lib/services";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const authResult = await requireAuthAndProjectOwnership(req, id);
    
    if (authResult instanceof Response) return authResult;

    // Since ownership is already verified, we can use the regular getProject method
    const project = await projectService.getProject(id, authResult.session.user.id);
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
    const project = await projectService.updateProject(id, data, authResult.session.user.id);
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

    await projectService.deleteProject(id, authResult.session.user.id);
    return apiResponse(req, { data: { success: true } });
  } catch (error) {
    return errorResponse(req, { error });
  }
}
