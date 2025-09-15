import { apiResponse, errorResponse } from "../../_helpers/api-response";
import { NextRequest } from "next/server";
import getGeminiClient from "@/lib/gemini";
import { SchemaData } from "@/data/schema.data";
import { HttpMethod } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const { prompt: userInput } = await req.json();

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
        name: "profile",
        type: "STRING",
      },
      {
        name: "tags",
        type: "ARRAY",
        arrayType: {
          elementType: "FAKER",
          fakerType: "WORD",
        },
      },
    ];

    const exampleEndpoints = [
      {
        path: "/users",
        method: "GET",
        description: "Get all users",
        schemaId: 1,
        isDataList: true,
        numberOfData: 10
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
      }
    ];

    const exampleSchemas = [
      {
        name: "User",
        description: "User profile schema",
        fields: exampleSchemaFields
      },
      {
        name: "Product", 
        description: "Product information schema",
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
            name: "price",
            type: "FAKER", 
            fakerType: "PRICE"
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

Generate a complete API project structure based on the user request. You need to create both schemas and endpoints that work together.

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

Example schemas:
${JSON.stringify(exampleSchemas, null, 2)}

Example endpoints:
${JSON.stringify(exampleEndpoints, null, 2)}

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
6. numberOfData should be specified for list endpoints (typically 5-20)
7. Paths should start with / and use kebab-case for multi-word resources

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

    const gemini = getGeminiClient();
    const completion = await gemini.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
      contents: prompt,
    });

    let response;
    try {
      // Try to parse the response as JSON
      if (!completion.text) {
        throw new Error("No response from Gemini API");
      }
      response = JSON.parse(completion.text);
    } catch (parseError) {
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = completion.text?.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          response = JSON.parse(jsonMatch[0]);
        } catch (extractError) {
          throw new Error(
            `AI returned invalid JSON. Response: ${completion.text?.substring(
              0,
              200
            )}...`
          );
        }
      } else {
        throw new Error(
          `AI response does not contain valid JSON. Response: ${completion.text?.substring(
            0,
            200
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

    // Validate schemas
    for (const schema of response.schemas) {
      if (!schema.name || !schema.fields || !Array.isArray(schema.fields)) {
        throw new Error("Each schema must have 'name' and 'fields' array");
      }
    }

    // Validate endpoints
    for (const endpoint of response.endpoints) {
      if (!endpoint.path || !endpoint.method || !endpoint.description) {
        throw new Error("Each endpoint must have 'path', 'method', and 'description'");
      }
      
      // Validate method is valid
      if (!Object.values(HttpMethod).includes(endpoint.method)) {
        throw new Error(`Invalid HTTP method: ${endpoint.method}`);
      }
    }

    return apiResponse(req, { data: response });
  } catch (error) {
    return errorResponse(req, { error });
  }
}
