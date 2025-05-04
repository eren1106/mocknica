import prisma from '@/lib/db';
import { apiResponse, errorResponse } from '../../_helpers/api-response';
import { NextRequest } from 'next/server';

// GET /api/response-wrappers/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return errorResponse(req, { error: 'Invalid ID' });
    }

    const wrapper = await prisma.responseWrapper.findUnique({
      where: { id },
    });

    if (!wrapper) {
      return errorResponse(req, { error: 'Response wrapper not found' });
    }

    return apiResponse(req, { data: wrapper });
  } catch (error) {
    return errorResponse(req, { error: 'Failed to fetch response wrapper' });
  }
}

// PUT /api/response-wrappers/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return errorResponse(req, { error: 'Invalid ID' });
    }

    const body = await req.json();
    const { name, json } = body;

    if (!name || !json) {
      return errorResponse(req, { error: 'Name and JSON are required' });
    }

    const wrapper = await prisma.responseWrapper.update({
      where: { id },
      data: {
        name,
        json,
      },
    });

    return apiResponse(req, { data: wrapper });
  } catch (error) {
    return errorResponse(req, { error: 'Failed to update response wrapper' });
  }
}

// DELETE /api/response-wrappers/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;               // ← await here
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      return errorResponse(req, { error: 'Invalid ID' });
    }

    const data = await prisma.responseWrapper.delete({
      where: { id: parsedId },
    });

    return apiResponse(req, { data, message: 'Response wrapper deleted successfully' });
  } catch (error) {
    return errorResponse(req, { error: 'Failed to delete response wrapper' });
  }
}

