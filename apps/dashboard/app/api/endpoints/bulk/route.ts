import { NextRequest } from "next/server";
import { apiResponse, errorResponse } from "../../_helpers/api-response";
import { requireAuth } from "../../_helpers/auth-guards";
import { validateRequestBody } from "../../_helpers/validation";
import { endpointService, schemaService } from "@/lib/services";
import { EndpointSchemaBackend } from "@/zod-schemas/endpoint.schema";
import { SchemaSchema } from "@/zod-schemas/schema.schema";
import { z } from "zod";
import { SchemaService } from "@/services/schema.service";
import { ISchema } from "@/types";
import { checkRateLimit } from "@/lib/rate-limit";

const BulkCreateEndpoints = z
  .object({
    projectId: z.string().min(1, "Project ID is required"),
    schemas: z.array(SchemaSchema).optional().default([]),
    endpoints: z.array(EndpointSchemaBackend).optional().default([]),
  })
  .refine((data) => data.schemas.length > 0 || data.endpoints.length > 0, {
    message: "At least one schema or endpoint is required",
  });

export async function POST(req: NextRequest) {
  try {
    const sessionResult = await requireAuth(req);
    if (sessionResult instanceof Response) return sessionResult;

    // Rate limit check for bulk operations (more restrictive since it creates multiple resources)
    const rateLimitResult = await checkRateLimit(req, "BULK", sessionResult.user.id);
    if (!rateLimitResult.success && rateLimitResult.response) return rateLimitResult.response;

    const validationResult = await validateRequestBody(
      req,
      BulkCreateEndpoints
    );
    if (validationResult instanceof Response) return validationResult;

    const { projectId, schemas = [], endpoints = [] } = validationResult;

    const result: {
      schemas: any[];
      endpoints: any[];
    } = {
      schemas: [],
      endpoints: [],
    };

    // Create a map to convert AI's 1-based schemaId to actual database schema IDs
    const schemaIdMapping = new Map<number, number>(); // AI index (1-based) -> DB schema ID

    // Create schemas first (if any)
    if (schemas.length > 0) {
      const createdSchemas = await schemaService.bulkCreateSchemas(
        schemas,
        projectId,
        sessionResult.user.id
      );
      result.schemas = createdSchemas;

      // Build mapping: AI uses 1-based index, we map it to actual DB IDs
      createdSchemas.forEach((schema, index) => {
        const aiSchemaId = index + 1; // AI uses 1-based index
        schemaIdMapping.set(aiSchemaId, schema.id);
      });
    }

    // Get all schemas for this project (for generating endpoint responses)
    const allSchemas = await schemaService.getProjectSchemas(
      projectId,
      sessionResult.user.id
    );

    // Map endpoints to include actual schema IDs
    // TODO: check why Promise?
    const mappedEndpoints = await Promise.all(endpoints.map(async (endpointData) => {
      let staticResponse = endpointData.staticResponse;
      let actualSchemaId: number | undefined = undefined;

      if (endpointData.schemaId) {
        // Convert AI's 1-based schemaId to actual DB schema ID
        const dbSchemaId = schemaIdMapping.get(endpointData.schemaId);

        if (dbSchemaId) {
          actualSchemaId = dbSchemaId;

          // Find the schema from available schemas using actual DB ID
          const schema = allSchemas.find((s) => s.id === dbSchemaId);

          if (schema) {
            // Generate response from schema
            staticResponse = await SchemaService.generateResponseFromSchema(
              schema as ISchema,
              endpointData.isDataList ?? false,
              endpointData.numberOfData ?? undefined
            );
          } else {
            // Fallback to empty object if schema not found
            staticResponse = endpointData.staticResponse ?? {};
          }
        } else {
          // Fallback to empty object if mapping not found
          staticResponse = endpointData.staticResponse ?? {};
        }
      } else if (staticResponse === undefined) {
        // No schema and no staticResponse provided - use empty object as fallback
        staticResponse = {};
      }

      const mappedData = {
        path: endpointData.path,
        method: endpointData.method,
        description: endpointData.description!,
        projectId: projectId,
        schemaId: actualSchemaId, // Use the actual DB schema ID, not AI's index
        responseWrapperId: endpointData.responseWrapperId,
        staticResponse: staticResponse,
        numberOfData: endpointData.numberOfData,
        isDataList: endpointData.isDataList,
      };

      return mappedData;
    }));

    // Create endpoints (if any)
    if (endpoints.length > 0) {
      const createdEndpoints = await endpointService.bulkCreateEndpoints(
        mappedEndpoints,
        projectId,
        sessionResult.user.id
      );
      result.endpoints = createdEndpoints;
    }

    return apiResponse(req, { data: result });
  } catch (error) {
    console.error("Error creating bulk schemas and endpoints:", error);
    return errorResponse(req, { error });
  }
}
