// app/api/mock/[projectId]/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { HttpMethod } from "@prisma/client";
// import { Ollama } from 'ollama';
import { errorResponse } from "../../../_helpers/api-response";
import { Endpoint } from "@/models/endpoint.model";
import { EndpointData } from "@/data/endpoint.data";
import { EndpointService } from "@/services/endpoint.service";
import { ProjectData } from "@/data/project.data";
import { QueryParamsHelper } from "@/helpers/query-params";

// Define the proper params type for Next.js App Router
type Params = Promise<{ projectId: string; path: string[] }>;

export async function GET(
  req: NextRequest,
  { params }: { params: Params }
) {
  const resolvedParams = await params;
  return handleRequest(req, resolvedParams, "GET");
}

export async function POST(
  req: NextRequest,
  { params }: { params: Params }
) {
  const resolvedParams = await params;
  return handleRequest(req, resolvedParams, "POST");
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Params }
) {
  const resolvedParams = await params;
  return handleRequest(req, resolvedParams, "PUT");
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Params }
) {
  const resolvedParams = await params;
  return handleRequest(req, resolvedParams, "DELETE");
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Params }
) {
  const resolvedParams = await params;
  return handleRequest(req, resolvedParams, "PATCH");
}

// export async function OPTIONS(
//   req: NextRequest,
//   { params }: { params: Params }
// ) {
//   try {
//     const resolvedParams = await params;
//     const { projectId } = resolvedParams;
    
//     // Check if project exists
//     const project = await ProjectData.getProject(projectId);
//     if (!project) {
//       return new NextResponse("Project not found", { status: 404 });
//     }

//     const requestOrigin = req.headers.get("origin");
//     const headers = new Headers();

//     if (requestOrigin && project.corsOrigins && project.corsOrigins.includes(requestOrigin)) {
//       headers.set("Access-Control-Allow-Origin", requestOrigin);
//       headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
//       headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
//       headers.set("Access-Control-Max-Age", "86400");
//     } else if (!project.corsOrigins || project.corsOrigins.length === 0) {
//       // If no CORS origins are specified, allow all origins (default behavior)
//       headers.set("Access-Control-Allow-Origin", "*");
//       headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
//       headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
//       headers.set("Access-Control-Max-Age", "86400");
//     } else {
//       // Origin not allowed - return response without CORS headers so browser generates CORS error
//       return new NextResponse(null, { status: 200 });
//     }

//     return new NextResponse(null, { status: 200, headers });
//   } catch (error) {
//     console.error("Error handling OPTIONS request:", error);
//     return new NextResponse("Internal server error", { status: 500 });
//   }
// }

async function handleRequest(
  req: NextRequest,
  params: { projectId: string; path: string[] },
  method: HttpMethod
) {
  try {
    const { projectId, path } = params;
    const fullPath = path?.join("/");

    if (!projectId) return errorResponse(req, { message: "Project ID is required", statusCode: 400 });
    if (!fullPath) return errorResponse(req, { message: "Invalid path", statusCode: 400 });

    // Check if project exists and requires token authentication
    const project = await ProjectData.getProject(projectId);
    if (!project) return errorResponse(req, { message: "Project not found", statusCode: 404 });

    // Get origin once for CORS checks
    const requestOrigin = req.headers.get("origin");

    // Validate token if required
    if (project.isNeedToken) {
      const authHeader = req.headers.get("authorization");
      
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return errorResponse(req, { 
          // message: "Authorization header with Bearer token is required", 
          message: "Unauthorized",
          statusCode: 401 
        });
      }

      const token = authHeader.substring(7); // Remove "Bearer " prefix
      
      if (token !== project.token) {
        return errorResponse(req, { 
          message: "Invalid or expired token", 
          statusCode: 401 
        });
      }
    }

    // Find matching endpoint by checking if the request path matches the endpoint path pattern
    // and belongs to the specified project
    const endpoints = await EndpointData.getEndpoints({
      where: {
        method,
        projectId,
      },
    });

    // Find the best matching endpoint and extract ID if present
    let matchingEndpoint: Endpoint | null = null;
    // let extractedId: string | null = null;

    for (const endpoint of endpoints) {
      const endpointParts = endpoint.path.split("/").filter((part) => part); // filter out empty strings
      const requestParts = fullPath.split("/").filter((part) => part); // filter out empty strings

      if (endpointParts.length !== requestParts.length) continue;

      let isMatch = true;
      for (let i = 0; i < endpointParts.length; i++) {
        const part = endpointParts[i];
        const requestPart = requestParts[i];

        // Check if this part is an ID parameter (e.g. :id or {id})
        const isIdParam =
          part.startsWith(":") || (part.startsWith("{") && part.endsWith("}"));
        if (isIdParam) {
          // For ID parameters, check if the request part is a valid ID format
          if (
            !/^\d+$/.test(requestPart) &&
            !/^[0-9a-fA-F-]+$/.test(requestPart)
          ) {
            isMatch = false;
            break;
          }
        } else if (part !== requestPart) {
          isMatch = false;
          break;
        }
      }

      if (isMatch) {
        matchingEndpoint = endpoint;
        break;
      }
    }

    if (!matchingEndpoint) {
      return errorResponse(req, {
        message: "Endpoint not found",
        statusCode: 404,
      });
    }

    // Parse query parameters from the request URL
    const queryParams = QueryParamsHelper.parseQueryParams(new URL(req.url));

    // TODO: make this function into utils instead of using service
    const response = EndpointService.getEndpointResponse(matchingEndpoint, queryParams);

    // Create response with CORS headers only if origin is allowed
    const headers = new Headers();
    
    // Only add CORS headers if the origin is allowed or no restrictions are set
    if (requestOrigin && project.corsOrigins && project.corsOrigins.length > 0) {
      console.log(`CORS Check: Origin "${requestOrigin}" against allowed origins:`, project.corsOrigins);
      // Check if origin is allowed
      if (!project.corsOrigins.includes(requestOrigin)) {
        console.log(`CORS: Origin "${requestOrigin}" NOT ALLOWED - returning response without CORS headers`);
        // Origin not allowed - return successful response but without CORS headers
        // This will trigger browser CORS policy violation
        return NextResponse.json(response);
      }
      console.log(`CORS: Origin "${requestOrigin}" ALLOWED - adding CORS headers`);
      // Origin is allowed - add CORS headers
      headers.set("Access-Control-Allow-Origin", requestOrigin);
      headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
      headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    } else if (!project.corsOrigins || project.corsOrigins.length === 0) {
      console.log("CORS: No restrictions set - allowing all origins");
      // If no CORS origins are specified, allow all origins (default behavior)
      headers.set("Access-Control-Allow-Origin", "*");
      headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
      headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    } else {
      console.log("CORS: No origin header in request");
    }

    return NextResponse.json(response, { headers });
  } catch (error) {
    console.error("Error handling mock request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}