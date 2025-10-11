import { apiResponse, errorResponse } from '../../_helpers/api-response';
import { NextRequest } from 'next/server';
import { requireAuth } from '../../_helpers/auth-guards';
import { validateRequestBody } from '../../_helpers/validation';
import { ResponseWrapperService } from '@/services/backend/response-wrapper.service';
import { ResponseWrapperSchema } from '@/zod-schemas/response-wrapper.schema';
import { WRAPPER_DATA_STR } from '@/constants';

// GET /api/response-wrappers/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionResult = await requireAuth(req);
    if (sessionResult instanceof Response) return sessionResult;

    const { id } = await params;
    const parsedId = parseInt(id, 10);
    
    if (isNaN(parsedId)) {
      return errorResponse(req, { error: 'Invalid ID', statusCode: 400 });
    }

    const wrapper = await ResponseWrapperService.getResponseWrapper(
      parsedId,
      sessionResult.user.id
    );

    return apiResponse(req, { data: wrapper });
  } catch (error) {
    return errorResponse(req, { error });
  }
}

// PUT /api/response-wrappers/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionResult = await requireAuth(req);
    if (sessionResult instanceof Response) return sessionResult;

    const { id } = await params;
    const parsedId = parseInt(id, 10);
    
    if (isNaN(parsedId)) {
      return errorResponse(req, { error: 'Invalid ID', statusCode: 400 });
    }

    const validationResult = await validateRequestBody(req, ResponseWrapperSchema, (data) => {
      return {
        ...data,
        json: data.json ?? null,
      }
    });
    if (validationResult instanceof Response) return validationResult;

    const wrapper = await ResponseWrapperService.updateResponseWrapper(
      parsedId,
      {
        name: validationResult.name,
        json: validationResult.json,
      },
      sessionResult.user.id
    );

    return apiResponse(req, { data: wrapper });
  } catch (error) {
    return errorResponse(req, { error });
  }
}

// DELETE /api/response-wrappers/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionResult = await requireAuth(req);
    if (sessionResult instanceof Response) return sessionResult;

    const { id } = await params;
    const parsedId = parseInt(id, 10);
    
    if (isNaN(parsedId)) {
      return errorResponse(req, { error: 'Invalid ID', statusCode: 400 });
    }

    const data = await ResponseWrapperService.deleteResponseWrapper(
      parsedId,
      sessionResult.user.id
    );

    return apiResponse(req, { 
      data, 
      message: 'Response wrapper deleted successfully' 
    });
  } catch (error) {
    return errorResponse(req, { error });
  }
}

