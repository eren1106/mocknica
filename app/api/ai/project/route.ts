import { apiResponse, errorResponse } from "../../_helpers/api-response";
import { NextRequest } from "next/server";
import { SchemaData } from "@/data/schema.data";
import { HttpMethod } from "@prisma/client";
import { aiServiceManager } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { prompt: userInput, model } = await req.json();

    if (!aiServiceManager) {
      return errorResponse(req, { 
        message: 'AI services are not available. Please configure at least one AI provider (GEMINI_API_KEY, OPENAI_API_KEY, or run Ollama locally).',
        statusCode: 503
      });
    }

    // Get all existing schemas to provide as examples for object references
    const existingSchemas = await SchemaData.getAllSchemas();

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
        numberOfData: 15
      },
      {
        path: "/users/:id",
        method: "GET", 
        description: "Get user by ID",
        schemaId: 1,
        isDataList: false
      },
      {
        path: "/users",
        method: "POST",
        description: "Create new user",
        schemaId: 1,
        isDataList: false
      },
      {
        path: "/users/:id",
        method: "PUT",
        description: "Update user by ID",
        schemaId: 1,
        isDataList: false
      },
      {
        path: "/users/:id",
        method: "DELETE",
        description: "Delete user by ID",
        schemaId: 1,
        isDataList: false
      }
    ];

    const exampleSchemas = [
      {
        name: "User",
        description: "User profile and authentication schema",
        fields: exampleSchemaFields
      },
      {
        name: "Product", 
        description: "Product catalog and inventory schema",
        fields: [
          {
            name: "id",
            type: "ID",
            idFieldType: "AUTOINCREMENT"
          },
          {
            name: "name",
            type: "FAKER",
            fakerType: "PRODUCT_NAME"
          },
          {
            name: "description",
            type: "FAKER",
            fakerType: "PARAGRAPH"
          },
          {
            name: "price",
            type: "FAKER", 
            fakerType: "PRICE"
          },
          {
            name: "category",
            type: "FAKER",
            fakerType: "WORD"
          },
          {
            name: "inStock",
            type: "BOOLEAN"
          },
          {
            name: "createdAt",
            type: "DATE"
          }
        ]
      },
      {
        name: "Order",
        description: "Customer orders and transactions schema",
        fields: [
          {
            name: "id",
            type: "ID",
            idFieldType: "UUID"
          },
          {
            name: "orderNumber",
            type: "FAKER",
            fakerType: "DATABASE_ID"
          },
          {
            name: "customerEmail",
            type: "FAKER",
            fakerType: "EMAIL"
          },
          {
            name: "totalAmount",
            type: "FAKER",
            fakerType: "AMOUNT"
          },
          {
            name: "status",
            type: "STRING"
          },
          {
            name: "orderDate",
            type: "DATE"
          }
        ]
      },
      {
        name: "Customer",
        description: "Customer information and contact details",
        fields: [
          {
            name: "id",
            type: "ID",
            idFieldType: "AUTOINCREMENT"
          },
          {
            name: "firstName",
            type: "FAKER",
            fakerType: "FIRST_NAME"
          },
          {
            name: "lastName",
            type: "FAKER",
            fakerType: "LAST_NAME"
          },
          {
            name: "email",
            type: "FAKER",
            fakerType: "EMAIL"
          },
          {
            name: "phone",
            type: "FAKER",
            fakerType: "PHONE_NUMBER"
          },
          {
            name: "address",
            type: "FAKER",
            fakerType: "STREET_ADDRESS"
          },
          {
            name: "city",
            type: "FAKER",
            fakerType: "CITY"
          }
        ]
      }
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

Generate a complete API project structure based on the user request. You need to create multiple schemas (minimum 5-8 schemas) and comprehensive CRUD endpoints for each schema.

${prismaTypes}

Expected response format:
{
  "schemas": [
    {
      "name": "SchemaName", 
      "description": "Schema description",
      "fields": [schema field objects]
    }
  ],
  "endpoints": [
    {
      "path": "/endpoint-path",
      "method": "GET|POST|PUT|DELETE|PATCH", 
      "description": "Endpoint description",
      "schemaId": 1, // Reference to schema by index (1-based)
      "isDataList": true|false, // true for list endpoints, false for single item
      "numberOfData": 10 // only for list endpoints
    }
  ]
}

Example schemas for small-medium company:
${JSON.stringify(exampleSchemas, null, 2)}

Example CRUD endpoints (generate these patterns for EVERY schema):
${JSON.stringify(exampleCrudEndpoints, null, 2)}

MANDATORY REQUIREMENTS:
1. Generate minimum 6-10 schemas covering typical business needs:
   - User management (Users, Roles, Permissions)
   - Product management (Products, Categories, Inventory)
   - Customer management (Customers, Orders, Invoices)
   - Content management (Posts, Comments, Media)
   - Analytics (Analytics, Reports, Logs)
   - Settings (Settings, Configurations)

2. For EVERY schema, generate complete CRUD operations:
   - GET /{resource} - List all (with numberOfData: 10-20)
   - GET /{resource}/:id - Get single item
   - POST /{resource} - Create new item
   - PUT /{resource}/:id - Update existing item
   - DELETE /{resource}/:id - Delete item

3. Schema complexity requirements:
   - Each schema must have 5-10 fields minimum
   - Include variety of field types (ID, FAKER, STRING, INTEGER, BOOLEAN, DATE)
   - Use meaningful business field names
   - Include common audit fields (createdAt, updatedAt, isActive)

Rules for schemas:
1. Schema names should be PascalCase (e.g., "User", "Product", "BlogPost")
2. Field names MUST be camelCase (e.g., "firstName", "userEmail", "createdAt")
3. Each schema must have at least an "id" field
4. If type is "ID", optionally include "idFieldType" (UUID or AUTOINCREMENT)
5. If type is "FAKER", include "fakerType" from available options
6. DO NOT use "OBJECT" type or reference other schemas with "objectSchemaId" in AI generation
7. DO NOT use "ARRAY" type with object references in AI generation - use simple arrays only
8. Keep schemas independent and self-contained for AI generation

Rules for endpoints:
1. Create REST endpoints following patterns: /resource, /resource/:id
2. Use proper HTTP methods (GET for read, POST for create, PUT for update, DELETE for delete)
3. schemaId should reference schemas by their index in the schemas array (1-based)
4. Use isDataList=true for endpoints that return arrays (like GET /users)
5. Use isDataList=false for endpoints that return single items (like GET /users/:id)
6. numberOfData should be specified for list endpoints (typically 10-25)
7. Paths should start with / and use kebab-case for multi-word resources
8. Generate 5 endpoints per schema (complete CRUD)

Available existing schemas: ${JSON.stringify(
      existingSchemas.map((s) => ({ id: s.id, name: s.name })),
      null,
      2
    )}

GENERATE AT LEAST 6-10 SCHEMAS WITH COMPLETE CRUD ENDPOINTS (30-50 endpoints total).

RESPOND WITH ONLY JSON:`;

    const prompt = [
      systemPrompt.trim(),
      `User request: ${userInput.trim()}`,
    ].join("\n\n");

    // Initialize AI service manager and generate response
    
    let completion;
    try {
      completion = await aiServiceManager.generateText({
        prompt,
        model,
      });
    } catch (aiError) {
      // If AI generation fails, throw a more descriptive error
      const errorMessage = aiError instanceof Error ? aiError.message : 'Unknown AI generation error';
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
          if (!repairedJson.endsWith('}')) {
            // Count unclosed braces and arrays
            const openBraces = (repairedJson.match(/\{/g) || []).length;
            const closeBraces = (repairedJson.match(/\}/g) || []).length;
            const openBrackets = (repairedJson.match(/\[/g) || []).length;
            const closeBrackets = (repairedJson.match(/\]/g) || []).length;
            
            // Add missing closing brackets/braces
            for (let i = 0; i < openBrackets - closeBrackets; i++) {
              repairedJson += ']';
            }
            for (let i = 0; i < openBraces - closeBraces; i++) {
              repairedJson += '}';
            }
            
            try {
              response = JSON.parse(repairedJson);
              console.log("Successfully repaired truncated JSON response");
            } catch (repairError) {
              throw new Error(
                `AI returned malformed JSON that couldn't be repaired. Response: ${rawResponse.substring(0, 500)}...`
              );
            }
          } else {
            throw new Error(
              `AI returned invalid JSON. Response: ${rawResponse.substring(0, 500)}...`
            );
          }
        }
      } else {
        throw new Error(
          `AI response does not contain valid JSON. Response: ${rawResponse.substring(0, 500)}...`
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

    // Validate minimum schema count for comprehensive business coverage
    if (response.schemas.length < 5) {
      throw new Error(`Insufficient schemas generated. Expected minimum 5, got ${response.schemas.length}. Please generate more comprehensive business schemas.`);
    }

    // Validate schemas
    for (const schema of response.schemas) {
      if (!schema.name || !schema.fields || !Array.isArray(schema.fields)) {
        throw new Error("Each schema must have 'name' and 'fields' array");
      }
      
      // Validate minimum field count for meaningful schemas
      if (schema.fields.length < 3) {
        throw new Error(`Schema '${schema.name}' has insufficient fields. Each schema should have at least 3 fields.`);
      }
      
      // Validate that schema has an ID field
      const hasIdField = schema.fields.some((field: any) => field.type === 'ID');
      if (!hasIdField) {
        throw new Error(`Schema '${schema.name}' must have an ID field.`);
      }
    }

    // Validate endpoints
    const requiredMethods = ['GET', 'POST', 'PUT', 'DELETE'];
    const schemaEndpointCoverage = new Map();
    
    for (const endpoint of response.endpoints) {
      if (!endpoint.path || !endpoint.method || !endpoint.description) {
        throw new Error("Each endpoint must have 'path', 'method', and 'description'");
      }
      
      // Validate method is valid
      if (!Object.values(HttpMethod).includes(endpoint.method)) {
        throw new Error(`Invalid HTTP method: ${endpoint.method}`);
      }
      
      // Track CRUD coverage per schema
      if (endpoint.schemaId) {
        const schemaId = endpoint.schemaId;
        if (!schemaEndpointCoverage.has(schemaId)) {
          schemaEndpointCoverage.set(schemaId, new Set());
        }
        schemaEndpointCoverage.get(schemaId).add(endpoint.method);
      }
    }

    // Validate CRUD completeness for each schema
    for (let i = 1; i <= response.schemas.length; i++) {
      const methods = schemaEndpointCoverage.get(i) || new Set();
      const missingMethods = requiredMethods.filter(method => !methods.has(method));
      
      if (missingMethods.length > 0) {
        const schemaName = response.schemas[i - 1]?.name || `Schema ${i}`;
        console.warn(`Warning: Schema '${schemaName}' is missing CRUD operations: ${missingMethods.join(', ')}`);
        // Don't throw error, just warn - allow partial CRUD for flexibility
      }
    }

    // Validate minimum endpoint count (should be roughly 5 per schema)
    const minExpectedEndpoints = response.schemas.length * 4; // At least 4 CRUD ops per schema
    if (response.endpoints.length < minExpectedEndpoints) {
      console.warn(`Warning: Expected at least ${minExpectedEndpoints} endpoints for ${response.schemas.length} schemas, got ${response.endpoints.length}`);
    }

    return apiResponse(req, { data: response });
  } catch (error) {
    return errorResponse(req, { error });
  }
}
