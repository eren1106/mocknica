import { NextRequest } from "next/server";
import { requireAuth, requireProjectOwnership } from "../../_helpers/auth-guards";
import { errorResponse, apiResponse } from "../../_helpers/api-response";
import { endpointService } from "@/lib/services";

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
//     const endpoint = await endpointService.getEndpoint(id, sessionResult.user.id);
    
//     if (!endpoint) {
//       return errorResponse(req, { error: "Endpoint not found", statusCode: 404 });
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

    // Get current endpoint to verify ownership (this also validates ownership)
    const currentEndpoint = await endpointService.getEndpoint(id, sessionResult.user.id);
    if (!currentEndpoint) {
      return errorResponse(req, { error: "Endpoint not found", statusCode: 404 });
    }

    const endpoint = await endpointService.updateEndpoint(id, body, sessionResult.user.id);
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

    // Delete endpoint (service validates ownership)
    await endpointService.deleteEndpoint(id, sessionResult.user.id);
    return apiResponse(req, { data: { success: true } });
  } catch (error) {
    console.error('Error deleting endpoint:', error);
    return errorResponse(req, { error: 'Failed to delete endpoint' });
  }
}
