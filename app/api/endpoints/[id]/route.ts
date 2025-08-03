import { NextRequest } from "next/server";
import { EndpointData } from "@/data/endpoint.data";
import { requireAuth, requireProjectOwnership } from "../../_helpers/auth-guards";
import { errorResponse, apiResponse } from "../../_helpers/api-response";

// NO NEED GET-BY-ID API FOR ENDPOINTS
// export async function GET(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const sessionResult = await requireAuth(req);
//     if (sessionResult instanceof Response) {
//       return sessionResult;
//     }

//     const { id } = await params;
//     const endpoint = await EndpointData.getEndpointById(id);
    
//     if (!endpoint) {
//       return errorResponse(req, { error: "Endpoint not found", statusCode: 404 });
//     }

//     // Verify project ownership
//     const ownershipResult = await requireProjectOwnership(req, endpoint.projectId, sessionResult.user.id);
//     if (ownershipResult instanceof Response) {
//       return ownershipResult;
//     }

//     return apiResponse(req, { data: endpoint });
//   } catch (error) {
//     console.error('Error fetching endpoint:', error);
//     return errorResponse(req, { error: 'Failed to fetch endpoint' });
//   }
// }

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionResult = await requireAuth(req);
    if (sessionResult instanceof Response) {
      return sessionResult;
    }

    const body = await req.json();
    const { id } = await params;

    // Get current endpoint to verify ownership
    const currentEndpoint = await EndpointData.getEndpointById(id);
    if (!currentEndpoint) {
      return errorResponse(req, { error: "Endpoint not found", statusCode: 404 });
    }

    // Verify project ownership
    const ownershipResult = await requireProjectOwnership(req, currentEndpoint.projectId, sessionResult.user.id);
    if (ownershipResult instanceof Response) {
      return ownershipResult;
    }

    const endpoint = await EndpointData.updateEndpoint(id, body);
    return apiResponse(req, { data: endpoint });
  } catch (error) {
    console.error('Error updating endpoint:', error);
    return errorResponse(req, { error: 'Failed to update endpoint' });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionResult = await requireAuth(req);
    if (sessionResult instanceof Response) {
      return sessionResult;
    }

    const { id } = await params;

    // Get current endpoint to verify ownership
    const currentEndpoint = await EndpointData.getEndpointById(id);
    if (!currentEndpoint) {
      return errorResponse(req, { error: "Endpoint not found", statusCode: 404 });
    }

    // Verify project ownership
    const ownershipResult = await requireProjectOwnership(req, currentEndpoint.projectId, sessionResult.user.id);
    if (ownershipResult instanceof Response) {
      return ownershipResult;
    }

    await EndpointData.deleteEndpoint(id);
    return apiResponse(req, { data: { success: true } });
  } catch (error) {
    console.error('Error deleting endpoint:', error);
    return errorResponse(req, { error: 'Failed to delete endpoint' });
  }
}
