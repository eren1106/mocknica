// app/api/mock/[projectId]/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { HttpMethod } from "@prisma/client";
// import { Ollama } from 'ollama';
import { errorResponse } from "../../../_helpers/api-response";
import { Endpoint } from "@/models/endpoint.model";
import { EndpointData } from "@/data/endpoint.data";
import { EndpointService } from "@/services/endpoint.service";

export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string; path: string[] } }
) {
  return handleRequest(req, params, "GET");
}

export async function POST(
  req: NextRequest,
  { params }: { params: { projectId: string; path: string[] } }
) {
  return handleRequest(req, params, "POST");
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { projectId: string; path: string[] } }
) {
  return handleRequest(req, params, "PUT");
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { projectId: string; path: string[] } }
) {
  return handleRequest(req, params, "DELETE");
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { projectId: string; path: string[] } }
) {
  return handleRequest(req, params, "PATCH");
}

async function handleRequest(
  req: NextRequest,
  params: { projectId: string; path: string[] },
  method: HttpMethod
) {
  try {
    const { projectId, path } = params;
    const fullPath = `${path?.join("/")}`;

    if (!projectId) {
      return errorResponse(req, { message: "Project ID is required", statusCode: 400 });
    }

    if (!fullPath) {
      return errorResponse(req, { message: "Invalid path", statusCode: 400 });
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

    // TODO: make this function into utils instead of using service
    const response = EndpointService.getEndpointResponse(matchingEndpoint);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error handling mock request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
