// app/api/endpoints/route.ts
import { NextRequest } from 'next/server';
import { apiResponse, errorResponse } from '../_helpers/api-response';
import { requireAuth } from '../_helpers/auth-guards';
import { validateRequestBody, validateQueryParams } from '../_helpers/validation';
import { endpointService } from '@/lib/services';
import { EndpointSchemaBackend, GetEndpointsQuerySchema } from '@/zod-schemas/endpoint.schema';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const sessionResult = await requireAuth(req);
    if (sessionResult instanceof Response) return sessionResult;

    // Rate limit check for endpoint creation
    const { success, response } = await checkRateLimit(req, "CREATE", sessionResult.user.id);
    if (!success && response) return response;

    const validationResult = await validateRequestBody(req, EndpointSchemaBackend);
    if (validationResult instanceof Response) return validationResult;

    const endpoint = await endpointService.createEndpoint(
      {
        ...validationResult,
        description: validationResult.description!,
        schemaId: validationResult.schemaId,
        responseWrapperId: validationResult.responseWrapperId,
        staticResponse: validationResult.staticResponse,
        numberOfData: validationResult.numberOfData,
        isDataList: validationResult.isDataList,
      },
      sessionResult.user.id
    );

    return apiResponse(req, { data: endpoint });
  } catch (error) {
    console.error('Error creating endpoint:', error);
    return errorResponse(req, { error });
  }
}

export async function GET(req: NextRequest) {
  try {
    const sessionResult = await requireAuth(req);
    if (sessionResult instanceof Response) return sessionResult;

    const queryValidation = validateQueryParams(req, GetEndpointsQuerySchema);
    if (queryValidation instanceof Response) return queryValidation;

    const { projectId } = queryValidation;

    if (projectId) {
      const endpoints = await endpointService.getProjectEndpoints(projectId, sessionResult.user.id);
      return apiResponse(req, { data: endpoints });
    } else {
      const endpoints = await endpointService.getUserEndpoints(sessionResult.user.id);
      return apiResponse(req, { data: endpoints });
    }
  } catch (error) {
    console.error('Error fetching endpoints:', error);
    return errorResponse(req, { error });
  }
}