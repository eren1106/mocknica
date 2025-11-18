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
    const rateLimitResult = await checkRateLimit(
      req,
      "AI",
      sessionResult.user.id
    );
    if (!rateLimitResult.success && rateLimitResult.response)
      return rateLimitResult.response;

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

    // Get basic existing schema info (optimized - no nested enrichment needed for AI prompt)
    const existingSchemas = projectId
      ? await schemaService.getProjectSchemasBasicInfo(projectId, sessionResult.user.id)
      : [];

    // Complete CRUD example for a single schema
    const exampleCrudEndpoints = [
      {
        path: "/users",
        method: "GET",
        description: "Get all users",
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

    // Example static response endpoints (only used when isGenerateSchemas=false)
    const exampleStaticEndpoints = [
      {
        path: "/users",
        method: "GET",
        description: "Get list of users",
        staticResponse: {
          users: [
            { id: 1, email: "john@example.com", name: "John Doe" },
            { id: 2, email: "jane@example.com", name: "Jane Smith" }
          ]
        },
      },
      {
        path: "/users/:id",
        method: "GET",
        description: "Get user by ID",
        staticResponse: {
          id: 1,
          email: "john@example.com",
          name: "John Doe"
        },
      },
    ];

    // Compact schema examples (only used when isGenerateSchemas=true)
    const exampleSchemas = [
      {
        name: "User",
        fields: [
          { name: "id", type: "ID", idFieldType: "UUID", objectSchemaId: null, fakerType: null, arrayType: null },
          { name: "email", type: "FAKER", fakerType: "EMAIL", idFieldType: null, objectSchemaId: null, arrayType: null },
          { name: "firstName", type: "FAKER", fakerType: "FIRST_NAME", idFieldType: null, objectSchemaId: null, arrayType: null },
          { name: "isActive", type: "BOOLEAN", idFieldType: null, fakerType: null, objectSchemaId: null, arrayType: null },
          { name: "createdAt", type: "DATE", idFieldType: null, fakerType: null, objectSchemaId: null, arrayType: null },
        ],
      },
      {
        name: "Product",
        fields: [
          { name: "id", type: "ID", idFieldType: "AUTOINCREMENT", objectSchemaId: null, fakerType: null, arrayType: null },
          { name: "name", type: "FAKER", fakerType: "PRODUCT_NAME", idFieldType: null, objectSchemaId: null, arrayType: null },
          { name: "price", type: "FAKER", fakerType: "PRICE", idFieldType: null, objectSchemaId: null, arrayType: null },
          { name: "inStock", type: "BOOLEAN", idFieldType: null, fakerType: null, objectSchemaId: null, arrayType: null },
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

    const systemPrompt = `CRITICAL: You MUST respond with ONLY raw JSON. No explanations, no markdown, no code blocks (\`\`\`json), no additional text.

Your response must start with { and end with }. Do NOT wrap in code fences or markdown.

Generate a complete API project structure based EXACTLY on the user's request. Create ONLY what the user asks for - if they ask for 1 schema, create 1 schema. If they ask for a specific feature, focus on that feature.

${
  isGenerateSchemas
    ? "IMPORTANT: Generate schemas AND endpoints. Endpoints MUST have schemaId, isDataList, and numberOfData (for lists). DO NOT include staticResponse in endpoints - it will be auto-generated from schemas."
    : 'IMPORTANT: Generate ONLY endpoints with staticResponse. Set "schemas" to empty array []. Each endpoint MUST have "staticResponse" field. DO NOT include schemaId, isDataList, or numberOfData.'
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
      "fields": [
        {
          "name": "fieldName",
          "type": "FIELD_TYPE",
          "idFieldType": null,
          "fakerType": null,
          "objectSchemaId": null,
          "arrayType": null
        }
      ]
    }`
      : " // EMPTY ARRAY - Do not generate schemas"
  }
  ],
  "endpoints": [{
      "path": "/path",
      "method": "GET",
      "description": "Description"${isGenerateSchemas ? ',\n      "schemaId": 1,\n      "isDataList": true,\n      "numberOfData": 10' : ',\n      "staticResponse": { "key": "value" }'}
    }]
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

REQUIREMENTS:
1. Follow user request EXACTLY - don't add extras
2. If unspecified, create 2-4 ${isGenerateSchemas ? "schemas with CRUD endpoints" : "endpoints"}
3. ${isGenerateSchemas ? "Generate CRUD operations (GET list, GET by ID, POST, PUT, DELETE) for each schema" : "Each endpoint needs meaningful staticResponse matching its purpose"}

${
  isGenerateSchemas
    ? `
SCHEMA RULES:
- Names: PascalCase (User, Product). Fields: camelCase (firstName, createdAt)
- Each field needs: name, type, idFieldType, fakerType, objectSchemaId, arrayType (set unused to null)
- ID type: set idFieldType to UUID/AUTOINCREMENT. FAKER type: set fakerType
- NO OBJECT/ARRAY types with objectSchemaId - keep schemas simple
- 3-8 fields per schema

ENDPOINT RULES:
- REST patterns: /resource, /resource/:id. Use / prefix, kebab-case
- Methods: GET (read), POST (create), PUT (update), DELETE (delete)
- schemaId: reference by index (1-based) in schemas array
- isDataList: true for arrays (GET /users), false for single (GET /users/:id)
- numberOfData: 10-25 for list endpoints
- CRITICAL: NO staticResponse field - will be auto-generated from schema
`
    : `
STATIC ENDPOINT RULES:
- REST patterns with / prefix, kebab-case paths
- Methods: GET/POST/PUT/DELETE based on purpose
- MUST have staticResponse field with realistic JSON object
- NO schemaId, isDataList, or numberOfData fields
`
}

Available existing schemas: ${JSON.stringify(existingSchemas, null, 2)}

RESPOND WITH ONLY JSON:`;

    const prompt = [
      systemPrompt.trim(),
      `User request: ${userInput.trim()}`,
    ].join("\n\n");

    // const promptTokenEstimate = Math.ceil(prompt.length / 4);
    // console.log(`📊 [AI Project] Prompt prepared - Est. tokens: ${promptTokenEstimate}, Length: ${prompt.length} chars`);
    // console.log(`⏱️  [AI Project] Time to prepare prompt: ${(performance.now() - startTime).toFixed(2)}ms`);

    // Initialize AI service manager and generate response
    const aiStartTime = performance.now();
    let completion;
    try {
      completion = await manager.generateText({
        prompt,
        model,
      });
      // const aiDuration = performance.now() - aiStartTime;
      // console.log(`✅ [AI Project] AI response received in ${aiDuration.toFixed(2)}ms`);
      
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

    const parseStartTime = performance.now();
    try {
      // Try to parse the response as JSON
      if (!completion.content) {
        throw new Error("No response from AI service");
      }

      rawResponse = completion.content;

      // Strip markdown code blocks if present (e.g., ```json ... ```)
      let cleanedResponse = rawResponse.trim();
      if (cleanedResponse.startsWith('```')) {
        // Remove opening code fence (```json or ```)
        cleanedResponse = cleanedResponse.replace(/^```(?:json)?\s*\n?/, '');
        // Remove closing code fence
        cleanedResponse = cleanedResponse.replace(/\n?```\s*$/, '');
        console.log(`🧹 [AI Project] Stripped markdown code blocks`);
      }

      response = JSON.parse(cleanedResponse);
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
    const validationStartTime = performance.now();
    
    if (!response.schemas || !Array.isArray(response.schemas)) {
      throw new Error("AI response must contain a 'schemas' array");
    }

    if (!response.endpoints || !Array.isArray(response.endpoints)) {
      throw new Error("AI response must contain an 'endpoints' array");
    }
    
    // Validate schemas (only if isGenerateSchemas is true)
    if (isGenerateSchemas) {
      for (const schema of response.schemas) {
        if (
          !schema.name ||
          !schema.fields ||
          !Array.isArray(schema.fields)
        ) {
          throw new Error(
            "Each schema must have 'name' and 'fields' array"
          );
        }

        // Validate minimum field count for meaningful schemas
        if (schema.fields.length < 1) {
          throw new Error(
            `Schema '${schema.name}' has no fields fields. Each schema should have at least 1 field.`
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
        // When generating schemas, endpoints should have schemaId and NOT have staticResponse
        if (endpoint.schemaId === undefined) {
          throw new Error(
            `Endpoint ${endpoint.path} must have a schemaId when generating schemas`
          );
        }
        // Explicitly reject staticResponse when using schemas
        if (endpoint.staticResponse !== undefined) {
          throw new Error(
            `Endpoint ${endpoint.path} must NOT have staticResponse when generating schemas. Use schemaId instead.`
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
    // console.error(`❌ [AI Project] Error after ${(performance.now() - startTime).toFixed(2)}ms:`, error);
    return errorResponse(req, { error });
  }
}
