import { apiResponse, errorResponse } from "../../_helpers/api-response";
import { NextRequest } from "next/server";
import { SchemaData } from "@/data/schema.data";
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

    // Get all existing schemas to provide as examples
    const existingSchemas = await SchemaData.getAllSchemas();

    // Create example schema field JSON structure
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
        name: "profile",
        type: "OBJECT",
        objectSchemaId: 1,
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

    const prismaSchema = `
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
    `;

    const systemPrompt = `CRITICAL: You MUST respond with ONLY valid JSON. No explanations, no markdown, no code blocks, no additional text.

Your response must start with { and end with }. Nothing else.

Generate schema fields based on the user request. Use this exact format:

${prismaSchema}

Example response format:
${JSON.stringify({ fields: exampleSchemaFields }, null, 2)}

Rules:
1. Each field must have "name" and "type"
2. Field names MUST be in camelCase format (e.g., "firstName", "userEmail", "profileData")
3. If type is "ID", optionally include "idFieldType" (UUID or AUTOINCREMENT)
4. If type is "FAKER", include "fakerType" from available options
5. If type is "OBJECT", you can reference existing schemas with "objectSchemaId"
6. If type is "ARRAY", include "arrayType" with "elementType" and optionally "fakerType" if elementType is FAKER

Available schemas: ${JSON.stringify(
      existingSchemas.map((s) => ({ id: s.id, name: s.name })),
      null,
      2
    )}

RESPOND WITH ONLY JSON:`;

    const prompt = [
      systemPrompt.trim(),
      `User request: ${userInput.trim()}`,
    ].join("\n\n");

    const completion = await aiServiceManager.generateText({
      prompt,
      model,
    });

    let response;
    try {
      // Try to parse the response as JSON
      if (!completion.content) {
        throw new Error("No response from AI service");
      }
      response = JSON.parse(completion.content);
    } catch (parseError) {
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = completion.content?.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          response = JSON.parse(jsonMatch[0]);
        } catch (extractError) {
          throw new Error(
            `AI returned invalid JSON. Response: ${completion.content?.substring(
              0,
              200
            )}...`
          );
        }
      } else {
        throw new Error(
          `AI response does not contain valid JSON. Response: ${completion.content?.substring(
            0,
            200
          )}...`
        );
      }
    }

    // TODO: validate with Zod
    // Extract and validate the schema fields from AI response
    if (!response.fields || !Array.isArray(response.fields)) {
      throw new Error("AI response must contain a 'fields' array");
    }

    return apiResponse(req, { data: response.fields });
  } catch (error) {
    return errorResponse(req, { error });
  }
}
