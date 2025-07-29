import { apiResponse, errorResponse } from "../../_helpers/api-response";
import { NextRequest } from "next/server";
import { ProjectData } from "@/data/project.data";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const project = await ProjectData.getProject(id);
    return apiResponse(req, { data: project });
  } catch (error) {
    return errorResponse(req, { error });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers
    });
    if (!session?.user?.id) {
      return errorResponse(req, { error: "Unauthorized", statusCode: 401 });
    }

    const { id } = await params;
    const data = await req.json();
    const project = await ProjectData.updateProject(id, data);
    return apiResponse(req, { data: project });
  } catch (error) {
    return errorResponse(req, { error });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers
    });
    if (!session?.user?.id) {
      return errorResponse(req, { error: "Unauthorized", statusCode: 401 });
    }

    const { id } = await params;
    await ProjectData.deleteProject(id);
    return apiResponse(req, { data: { success: true } });
  } catch (error) {
    return errorResponse(req, { error });
  }
}
