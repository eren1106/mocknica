// app/api/mock/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { HttpMethod, ResponseGeneration } from "@prisma/client";
// import { Ollama } from 'ollama';
import { SchemaService } from "@/services/schema.service";
import { errorResponse } from "../../_helpers/api-response";
import { Endpoint } from "@/models/endpoint.model";
import { EndpointData } from "@/data/endpoint.data";
import { ResponseWrapperService } from "@/services/response-wrapper.service";

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(req, params, "GET");
}

export async function POST(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(req, params, "POST");
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(req, params, "PUT");
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(req, params, "DELETE");
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(req, params, "PATCH");
}

async function handleRequest(
  req: NextRequest,
  params: { path: string[] },
  method: HttpMethod
) {
  try {
    const fullPath = params?.path?.join("/");

    if (!fullPath) {
      return errorResponse(req, { message: "Invalid path", statusCode: 400 });
    }

    // Find matching endpoint by checking if the request path matches the endpoint path pattern
    const endpoints = await EndpointData.getEndpoints({
      where: {
        method,
      },
    });

    // Find the best matching endpoint and extract ID if present
    let matchingEndpoint: Endpoint | null = null;
    // let extractedId: string | null = null;

    for (const endpoint of endpoints) {
      const endpointParts = endpoint.path.split("/");
      const requestParts = fullPath.split("/");

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

    // TODO: should return array or not is not check like this, need add a flag in endpoint (isDataList)
    // Check if this is a GET request and if it's a collection endpoint (no ID parameter)
    const isCollectionEndpoint =
      !matchingEndpoint.path.includes("/:") &&
      !matchingEndpoint.path.includes("/{");
    const shouldReturnArray = method === "GET" && isCollectionEndpoint;

    // Generate response
    let response: any;
    if (matchingEndpoint.responseGen === ResponseGeneration.STATIC) {
      response = matchingEndpoint.responseWrapper
        ? ResponseWrapperService.generateResponseWrapperJson({
            response: matchingEndpoint.staticResponse,
            wrapper: matchingEndpoint.responseWrapper,
          })
        : matchingEndpoint.staticResponse;
    } else if (
      matchingEndpoint.responseGen === ResponseGeneration.SCHEMA &&
      matchingEndpoint.schema
    ) {
      response = matchingEndpoint.responseWrapper
        ? ResponseWrapperService.generateResponseWrapperJson({
            response: SchemaService.generateResponseFromSchema(
              matchingEndpoint.schema,
              shouldReturnArray
            ),
            wrapper: matchingEndpoint.responseWrapper,
          })
        : SchemaService.generateResponseFromSchema(
            matchingEndpoint.schema,
            shouldReturnArray
          );
    } else {
      response = shouldReturnArray ? [] : "no data";
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error handling mock request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
