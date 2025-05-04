import prisma from '@/lib/db';
import { apiResponse, errorResponse } from '../_helpers/api-response';
import { NextRequest } from 'next/server';

// GET /api/response-wrappers
export async function GET(req: NextRequest) {
  try {
    const wrappers = await prisma.responseWrapper.findMany({
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
    const { name, json } = body;

    if (!name || !json) {
      return errorResponse(req, { error: 'Name and JSON are required' });
    }

    const wrapper = await prisma.responseWrapper.create({
      data: {
        name,
        json,
      },
    });

    return apiResponse(req, { data: wrapper });
  } catch (error) {
    return errorResponse(req, { error });
  }
}
