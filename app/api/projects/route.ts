import { apiResponse, errorResponse } from "../_helpers/api-response";
import { NextRequest } from "next/server";
import { ProjectData } from "@/data/project.data";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers
    });
    if (!session?.user?.id) {
      return errorResponse(req, { error: "Unauthorized", statusCode: 401 });
    }
    const projects = await ProjectData.getAllProjects(session?.user?.id);
    return apiResponse(req, { data: projects });
  } catch (error) {
    return errorResponse(req, { error });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers
    });
    if (!session?.user?.id) {
      return errorResponse(req, { error: "Unauthorized", statusCode: 401 });
    }

    const data = await req.json();
    const project = await ProjectData.createProject({
      ...data,
      userId: session.user.id,
    });
    return apiResponse(req, { data: project });
  } catch (error) {
    return errorResponse(req, { error });
  }
}
