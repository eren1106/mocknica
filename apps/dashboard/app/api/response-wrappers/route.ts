import { apiResponse, errorResponse } from '../_helpers/api-response';
import { NextRequest } from 'next/server';
import { requireAuth } from '../_helpers/auth-guards';
import { validateRequestBody, validateQueryParams } from '../_helpers/validation';
import { responseWrapperService } from '@/lib/services';
import { CreateResponseWrapperSchema } from '@/zod-schemas/response-wrapper.schema';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';

const GetResponseWrappersQuerySchema = z.object({
  projectId: z.string().optional(),
});

// GET /api/response-wrappers
export async function GET(req: NextRequest) {
  try {
    const sessionResult = await requireAuth(req);
    if (sessionResult instanceof Response) return sessionResult;

    const queryValidation = validateQueryParams(req, GetResponseWrappersQuerySchema);
    if (queryValidation instanceof Response) return queryValidation;

    const { projectId } = queryValidation;

    if (projectId) {
      const wrappers = await responseWrapperService.getProjectResponseWrappers(
        projectId, 
        sessionResult.user.id
      );
      return apiResponse(req, { data: wrappers });
    } else {
      const wrappers = await responseWrapperService.getUserResponseWrappers(
        sessionResult.user.id
      );
      return apiResponse(req, { data: wrappers });
    }
  } catch (error) {
    return errorResponse(req, { error });
  }
}

// POST /api/response-wrappers
export async function POST(req: NextRequest) {
  try {
    const sessionResult = await requireAuth(req);
    if (sessionResult instanceof Response) return sessionResult;

    // Rate limit check for response wrapper creation
    const rateLimitResult = await checkRateLimit(req, "CREATE", sessionResult.user.id);
    if (!rateLimitResult.success && rateLimitResult.response) return rateLimitResult.response;

    const validationResult = await validateRequestBody(req, CreateResponseWrapperSchema, (data) => {
      return {
        ...data,
        json: data.json ?? null,
      }
    });
    if (validationResult instanceof Response) return validationResult;

    const wrapper = await responseWrapperService.createResponseWrapper(
      {
        name: validationResult.name,
        json: validationResult.json,
      },
      validationResult.projectId,
      sessionResult.user.id
    );

    return apiResponse(req, { 
      data: wrapper, 
      message: 'Response wrapper created successfully' 
    });
  } catch (error) {
    return errorResponse(req, { error });
  }
}
