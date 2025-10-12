// app/api/endpoints/route.ts
import { NextRequest } from 'next/server';
import { apiResponse, errorResponse } from '../_helpers/api-response';
import { requireAuth } from '../_helpers/auth-guards';
import { validateRequestBody, validateQueryParams } from '../_helpers/validation';
import { EndpointService } from '@/services/backend/endpoint.service';
import { EndpointSchemaBackend, GetEndpointsQuerySchema } from '@/zod-schemas/endpoint.schema';

export async function POST(req: NextRequest) {
  try {
    const sessionResult = await requireAuth(req);
    if (sessionResult instanceof Response) return sessionResult;

    const validationResult = await validateRequestBody(req, EndpointSchemaBackend);
    if (validationResult instanceof Response) return validationResult;

    const endpoint = await EndpointService.createEndpoint(
      {
        ...validationResult,
        description: validationResult.description!,
        schemaId: validationResult.schemaId ?? null,
        responseWrapperId: validationResult.responseWrapperId ?? null,
        staticResponse: validationResult.staticResponse ?? null,
        numberOfData: validationResult.numberOfData ?? null,
        isDataList: validationResult.isDataList ?? false,
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
      const endpoints = await EndpointService.getProjectEndpoints(projectId, sessionResult.user.id);
      return apiResponse(req, { data: endpoints });
    } else {
      const endpoints = await EndpointService.getUserEndpoints(sessionResult.user.id);
      return apiResponse(req, { data: endpoints });
    }
  } catch (error) {
    console.error('Error fetching endpoints:', error);
    return errorResponse(req, { error });
  }
}