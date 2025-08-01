import prisma from '@/lib/db';
import { apiResponse, errorResponse } from '../_helpers/api-response';
import { NextRequest } from 'next/server';

// GET /api/response-wrappers
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const wrappers = await prisma.responseWrapper.findMany({
      where: projectId ? { projectId } : undefined,
      orderBy: { createdAt: 'asc' },
    });
    return apiResponse(req, { data: wrappers });
  } catch (error) {
    return errorResponse(req, { error });
  }
}

// POST /api/response-wrappers
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, json, projectId } = body;
    console.log("PROJECT ID:", projectId);
    if (!name || !json || !projectId) {
      return errorResponse(req, { error: 'Name, JSON and projectId are required' });
    }

    // Check if the project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return errorResponse(req, { error: `Project with ID ${projectId} not found` });
    }

    const wrapper = await prisma.responseWrapper.create({
      data: {
        name,
        json,
        projectId,
      },
    });

    return apiResponse(req, { data: wrapper, message: 'Response wrapper created successfully' });
  } catch (error) {
    return errorResponse(req, { error });
  }
}
