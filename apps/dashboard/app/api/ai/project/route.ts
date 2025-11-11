import { apiResponse, errorResponse } from "../../_helpers/api-response";
import { NextRequest } from "next/server";
import { HttpMethod } from "@prisma/client";
import { AIServiceManager } from "@/lib/ai/ai-service-manager";
import { extractApiKeysFromHeaders } from "@/lib/ai/helpers";
import { schemaService } from "@/lib/services";
import { requireAuth } from "../../_helpers/auth-guards";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const sessionResult = await requireAuth(req);
    if (sessionResult instanceof Response) return sessionResult;

    // Rate limit check for AI operations (most expensive)
    const rateLimitResult = await checkRateLimit(req, "AI", sessionResult.user.id);
    if (!rateLimitResult.success && rateLimitResult.response) return rateLimitResult.response;

    const {
      prompt: userInput,
      model,
      projectId,
      isGenerateSchemas = true,
    } = await req.json();

    // Create AI service manager with custom keys from headers
    const customKeys = extractApiKeysFromHeaders(req);
    const manager = new AIServiceManager(customKeys);

    if (!manager) {
      return errorResponse(req, {
        message:
          "AI services are not available. Please configure at least one AI provider.",
        statusCode: 503,
      });
    }

    // Get all existing schemas to provide as examples for object references
    const existingSchemas = projectId
      ? await schemaService.getProjectSchemas(projectId, sessionResult.user.id)
      : [];

    // Create example structures
    const exampleSchemaFields = [
      {
        name: "id",
        type: "ID",
        idFieldType: "UUID",
      },
      {
        name: "email",
        type: "FAKER",
        fakerType: "EMAIL",
      },
      {
        name: "firstName",
        type: "FAKER",
        fakerType: "FIRST_NAME",
      },
      {
        name: "lastName",
        type: "FAKER",
        fakerType: "LAST_NAME",
      },
      {
        name: "profile",
        type: "STRING",
      },
      {
        name: "isActive",
        type: "BOOLEAN",
      },
      {
        name: "createdAt",
        type: "DATE",
      },
    ];

    // Complete CRUD example for a single schema
    const exampleCrudEndpoints = [
      {
        path: "/users",
        method: "GET",
        description: "Get all users with pagination",
        schemaId: 1,
        isDataList: true,
        numberOfData: 15,
      },
      {
        path: "/users/:id",
        method: "GET",
        description: "Get user by ID",
        schemaId: 1,
        isDataList: false,
      },
      {
        path: "/users",
        method: "POST",
        description: "Create new user",
        schemaId: 1,
        isDataList: false,
      },
      {
        path: "/users/:id",
        method: "PUT",
        description: "Update user by ID",
        schemaId: 1,
        isDataList: false,
      },
      {
        path: "/users/:id",
        method: "DELETE",
        description: "Delete user by ID",
        schemaId: 1,
        isDataList: false,
      },
    ];

    // Example static response endpoints
    const exampleStaticEndpoints = [
      {
        path: "/users",
        method: "GET",
        description: "Get list of users",
        staticResponse: {
          users: [
            {
              id: 1,
              email: "john.doe@example.com",
              firstName: "John",
              lastName: "Doe",
              isActive: true,
              createdAt: "2024-01-15T10:30:00Z",
            },
            {
              id: 2,
              email: "jane.smith@example.com",
              firstName: "Jane",
              lastName: "Smith",
              isActive: true,
              createdAt: "2024-01-20T14:45:00Z",
            },
          ],
          total: 2,
          page: 1,
          pageSize: 10,
        },
      },
      {
        path: "/users/:id",
        method: "GET",
        description: "Get single user by ID",
        staticResponse: {
          id: 1,
          email: "john.doe@example.com",
          firstName: "John",
          lastName: "Doe",
          profile: "Software Engineer",
          isActive: true,
          createdAt: "2024-01-15T10:30:00Z",
        },
      },
    ];

    const exampleSchemas = [
      {
        name: "User",
        description: "User profile and authentication schema",
        fields: exampleSchemaFields,
      },
      {
        name: "Product",
        description: "Product catalog and inventory schema",
        fields: [
          {
            name: "id",
            type: "ID",
            idFieldType: "AUTOINCREMENT",
          },
          {
            name: "name",
            type: "FAKER",
            fakerType: "PRODUCT_NAME",
          },
          {
            name: "description",
            type: "FAKER",
            fakerType: "PARAGRAPH",
          },
          {
            name: "price",
            type: "FAKER",
            fakerType: "PRICE",
          },
          {
            name: "category",
            type: "FAKER",
            fakerType: "WORD",
          },
          {
            name: "inStock",
            type: "BOOLEAN",
          },
          {
            name: "createdAt",
            type: "DATE",
          },
        ],
      },
      {
        name: "Order",
        description: "Customer orders and transactions schema",
        fields: [
          {
            name: "id",
            type: "ID",
            idFieldType: "UUID",
          },
          {
            name: "orderNumber",
            type: "FAKER",
            fakerType: "DATABASE_ID",
          },
          {
            name: "customerEmail",
            type: "FAKER",
            fakerType: "EMAIL",
          },
          {
            name: "totalAmount",
            type: "FAKER",
            fakerType: "AMOUNT",
          },
          {
            name: "status",
            type: "STRING",
          },
          {
            name: "orderDate",
            type: "DATE",
          },
        ],
      },
      {
        name: "Customer",
        description: "Customer information and contact details",
        fields: [
          {
            name: "id",
            type: "ID",
            idFieldType: "AUTOINCREMENT",
          },
          {
            name: "firstName",
            type: "FAKER",
            fakerType: "FIRST_NAME",
          },
          {
            name: "lastName",
            type: "FAKER",
            fakerType: "LAST_NAME",
          },
          {
            name: "email",
            type: "FAKER",
            fakerType: "EMAIL",
          },
          {
            name: "phone",
            type: "FAKER",
            fakerType: "PHONE_NUMBER",
          },
          {
            name: "address",
            type: "FAKER",
            fakerType: "STREET_ADDRESS",
          },
          {
            name: "city",
            type: "FAKER",
            fakerType: "CITY",
          },
        ],
      },
    ];

    const prismaTypes = `
    // Available Schema Field Types:
    enum SchemaFieldType {
      ID, FAKER, STRING, INTEGER, FLOAT, BOOLEAN, OBJECT, ARRAY, DATE
    }
    
    // Available ID Field Types (when type is ID):
    enum IdFieldType {
      UUID, AUTOINCREMENT
    }
    
    // Available Faker Types (when type is FAKER):
    enum FakerType {
      FIRST_NAME, LAST_NAME, FULL_NAME, JOB_TITLE, PHONE_NUMBER,
      EMAIL, USER_NAME, PASSWORD, URL, IP_ADDRESS,
      CITY, COUNTRY, STATE, STREET_ADDRESS, ZIP_CODE, LATITUDE, LONGITUDE,
      COMPANY_NAME, DEPARTMENT, PRODUCT_NAME, PRICE,
      PAST_DATE, FUTURE_DATE, RECENT_DATE,
      CREDIT_CARD_NUMBER, ACCOUNT_NUMBER, AMOUNT, CURRENCY,
      WORD, SENTENCE, PARAGRAPH,
      FILE_NAME, DIRECTORY_PATH, MIME_TYPE,
      UUID, DATABASE_ID
    }

    // Available HTTP Methods:
    enum HttpMethod {
      GET, POST, PUT, DELETE, PATCH
    }
    `;

    const systemPrompt = `CRITICAL: You MUST respond with ONLY valid JSON. No explanations, no markdown, no code blocks, no additional text.

Your response must start with { and end with }. Nothing else.

Generate a complete API project structure based EXACTLY on the user's request. Create ONLY what the user asks for - if they ask for 1 schema, create 1 schema. If they ask for a specific feature, focus on that feature.

${
  isGenerateSchemas
    ? "IMPORTANT: Generate both schemas AND endpoints as requested. Endpoints should use schemaId to reference schemas."
    : 'IMPORTANT: Generate ONLY endpoints with static responses. DO NOT generate any schemas. Set "schemas" to an empty array []. Each endpoint MUST have a "staticResponse" field containing the JSON object to return.'
}

${prismaTypes}

Expected response format:
{
  "schemas": [${
    isGenerateSchemas
      ? `
    {
      "name": "SchemaName", 
      "description": "Schema description",
      "fields": [schema field objects]
    }`
      : " // EMPTY ARRAY - Do not generate schemas"
  }
  ],
  "endpoints": [
    {
      "path": "/endpoint-path",
      "method": "GET|POST|PUT|DELETE|PATCH", 
      "description": "Endpoint description",${
        isGenerateSchemas
          ? `
      "schemaId": 1, // Reference to schema by index (1-based)
      "isDataList": true|false, // true for list endpoints, false for single item
      "numberOfData": 10 // only for list endpoints`
          : `
      "staticResponse": { // Static JSON response object
        "key": "value",
        "data": "example"
      }`
      }
    }
  ]
}

${
  isGenerateSchemas
    ? `
Example schemas for reference:
${JSON.stringify(exampleSchemas, null, 2)}

Example CRUD endpoints (generate these patterns for schemas when appropriate):
${JSON.stringify(exampleCrudEndpoints, null, 2)}
`
    : `
Example static response endpoints:
${JSON.stringify(exampleStaticEndpoints, null, 2)}

CRITICAL for static endpoints:
- Every endpoint MUST have a "staticResponse" field
- The staticResponse should be a valid JSON object representing the response
- Make the response realistic and appropriate for the endpoint's purpose
- DO NOT include schemaId, isDataList, or numberOfData fields
`
}

IMPORTANT REQUIREMENTS:
1. Follow the user's request EXACTLY - if they ask for 1 car schema and 1 car endpoint, generate exactly that
2. Do NOT add extra schemas or endpoints unless explicitly requested
3. If the user doesn't specify, you can create a reasonable small set (2-4 ${
      isGenerateSchemas ? "schemas" : "endpoints"
    })
${
  isGenerateSchemas
    ? "4. For each schema mentioned, consider generating basic CRUD operations unless user specifies otherwise"
    : "4. Each endpoint must return a meaningful static response appropriate to its purpose"
}
${
  !isGenerateSchemas
    ? "\n5. CRITICAL: Since schema generation is disabled, generate ONLY endpoints with staticResponse field.\n6. DO NOT include schemaId, isDataList, or numberOfData in endpoints."
    : ""
}

${
  isGenerateSchemas
    ? `
Schema requirements:
1. Schema names should be PascalCase (e.g., "User", "Product", "Car")
2. Field names MUST be camelCase (e.g., "firstName", "userEmail", "createdAt")
3. Each schema must have at least an "id" field
4. If type is "ID", optionally include "idFieldType" (UUID or AUTOINCREMENT)
5. If type is "FAKER", include "fakerType" from available options
6. DO NOT use "OBJECT" type or reference other schemas with "objectSchemaId" in AI generation
7. DO NOT use "ARRAY" type with object references in AI generation - use simple arrays only
8. Keep schemas independent and self-contained for AI generation
9. Each schema should have 3-8 fields for meaningful data structure

Endpoint requirements:
1. Create REST endpoints following patterns: /resource, /resource/:id
2. Use proper HTTP methods (GET for read, POST for create, PUT for update, DELETE for delete)
3. schemaId should reference schemas by their index in the schemas array (1-based)
4. Use isDataList=true for endpoints that return arrays (like GET /users)
5. Use isDataList=false for endpoints that return single items (like GET /users/:id)
6. numberOfData should be specified for list endpoints (typically 10-25)
7. Paths should start with / and use kebab-case for multi-word resources
`
    : `
Endpoint requirements for static responses:
1. Create REST endpoints with descriptive paths
2. Use proper HTTP methods (GET for read, POST for create, PUT for update, DELETE for delete)
3. Each endpoint MUST have a "staticResponse" field with a JSON object
4. The staticResponse should be realistic and match the endpoint's purpose
5. DO NOT include schemaId, isDataList, or numberOfData fields
6. Paths should start with / and use kebab-case for multi-word resources
`
}

Available existing schemas: ${JSON.stringify(
      existingSchemas.map((s) => ({ id: s.id, name: s.name })),
      null,
      2
    )}

RESPOND WITH ONLY JSON:`;

    const prompt = [
      systemPrompt.trim(),
      `User request: ${userInput.trim()}`,
    ].join("\n\n");

    // Initialize AI service manager and generate response

    let completion;
    try {
      completion = await manager.generateText({
        prompt,
        model,
      });

    } catch (aiError) {
      // If AI generation fails, throw a more descriptive error
      const errorMessage =
        aiError instanceof Error
          ? aiError.message
          : "Unknown AI generation error";
      throw new Error(`AI generation failed: ${errorMessage}`);
    }

    let response;
    let rawResponse = "";

    try {
      // Try to parse the response as JSON
      if (!completion.content) {
        throw new Error("No response from AI service");
      }

      rawResponse = completion.content;

      response = JSON.parse(rawResponse);
    } catch (parseError) {
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          response = JSON.parse(jsonMatch[0]);
        } catch (extractError) {
          // If response seems truncated, try to repair it
          let repairedJson = jsonMatch[0];

          // Common truncation repairs
          if (!repairedJson.endsWith("}")) {
            // Count unclosed braces and arrays
            const openBraces = (repairedJson.match(/\{/g) || []).length;
            const closeBraces = (repairedJson.match(/\}/g) || []).length;
            const openBrackets = (repairedJson.match(/\[/g) || []).length;
            const closeBrackets = (repairedJson.match(/\]/g) || []).length;

            // Add missing closing brackets/braces
            for (let i = 0; i < openBrackets - closeBrackets; i++) {
              repairedJson += "]";
            }
            for (let i = 0; i < openBraces - closeBraces; i++) {
              repairedJson += "}";
            }

            try {
              response = JSON.parse(repairedJson);
            } catch (repairError) {
              throw new Error(
                `AI returned malformed JSON that couldn't be repaired. Response: ${rawResponse.substring(
                  0,
                  500
                )}...`
              );
            }
          } else {
            throw new Error(
              `AI returned invalid JSON. Response: ${rawResponse.substring(
                0,
                500
              )}...`
            );
          }
        }
      } else {
        throw new Error(
          `AI response does not contain valid JSON. Response: ${rawResponse.substring(
            0,
            500
          )}...`
        );
      }
    }

    // TODO: validate with Zod
    // Validate the response structure
    if (!response.schemas || !Array.isArray(response.schemas)) {
      throw new Error("AI response must contain a 'schemas' array");
    }

    if (!response.endpoints || !Array.isArray(response.endpoints)) {
      throw new Error("AI response must contain an 'endpoints' array");
    }

    // Validate schemas (only if isGenerateSchemas is true)
    if (isGenerateSchemas) {
      for (const schema of response.schemas) {
        if (!schema.name || !schema.fields || !Array.isArray(schema.fields)) {
          throw new Error("Each schema must have 'name' and 'fields' array");
        }

        // Validate minimum field count for meaningful schemas
        if (schema.fields.length < 1) {
          throw new Error(
            `Schema '${schema.name}' has no fields. Each schema should have at least 1 field.`
          );
        }
      }
    } else {
      // When isGenerateSchemas is false, schemas array should be empty
      if (response.schemas.length > 0) {
        throw new Error(
          "Schemas array must be empty when isGenerateSchemas is false"
        );
      }
    }

    // Validate endpoints
    for (const endpoint of response.endpoints) {

      if (!endpoint.path || !endpoint.method || !endpoint.description) {
        throw new Error(
          "Each endpoint must have 'path', 'method', and 'description'"
        );
      }

      // Validate method is valid
      if (!Object.values(HttpMethod).includes(endpoint.method)) {
        throw new Error(`Invalid HTTP method: ${endpoint.method}`);
      }

      // Validate endpoint structure based on isGenerateSchemas flag
      if (isGenerateSchemas) {
        // When generating schemas, endpoints should have schemaId
        if (endpoint.schemaId === undefined) {
          throw new Error(
            `Endpoint ${endpoint.path} must have a schemaId when generating schemas`
          );
        }
      } else {
        // When not generating schemas, endpoints should have staticResponse
        if (!endpoint.staticResponse) {
          throw new Error(
            `Endpoint ${endpoint.path} must have a staticResponse when isGenerateSchemas is false`
          );
        }

        // Check if staticResponse is an empty object - THIS IS LIKELY THE BUG!
        if (
          typeof endpoint.staticResponse === "object" &&
          Object.keys(endpoint.staticResponse).length === 0
        ) {
          // Instead of just warning, we should throw an error or provide a default
          throw new Error(
            `Endpoint ${endpoint.path} has an empty staticResponse object {}. The AI must provide a meaningful response object.`
          );
        }

        // Ensure no schema-related fields are present
        if (
          endpoint.schemaId !== undefined ||
          endpoint.isDataList !== undefined ||
          endpoint.numberOfData !== undefined
        ) {
          throw new Error(
            `Endpoint ${endpoint.path} should not have schemaId, isDataList, or numberOfData when isGenerateSchemas is false`
          );
        }
      }
    }
    return apiResponse(req, { data: response });
  } catch (error) {
    return errorResponse(req, { error });
  }
}
