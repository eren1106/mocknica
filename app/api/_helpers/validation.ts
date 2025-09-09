import { NextRequest } from "next/server";
import { ZodSchema, ZodError } from "zod";
import { customResponse } from "./api-response";

/**
 * Validates request body against a Zod schema
 */
export async function validateRequestBody<T>(
  req: NextRequest,
  schema: ZodSchema<T>,
  dataProcessor?: (data: T) => T
): Promise<T | Response> {
  try {
    let body = await req.json();
    if (dataProcessor) body = dataProcessor(body);
    const validatedData = schema.parse(body);
    return validatedData;
  } catch (error) {
    if (error instanceof ZodError) {
      return customResponse(req, {
        message: "Validation failed",
        status: "FAILED",
        statusCode: 400,
        extra: {
          errorDetails: error.errors.map((err) => err.message),
        },
      });
    }
    return customResponse(req, {
      message: "Invalid request body",
      status: "FAILED",
      statusCode: 400,
    });
  }
}

/**
 * Validates query parameters against a Zod schema
 */
export function validateQueryParams<T>(
  req: NextRequest,
  schema: ZodSchema<T>
): T | Response {
  try {
    const { searchParams } = new URL(req.url);
    const params: Record<string, string> = {};

    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    const validatedData = schema.parse(params);
    return validatedData;
  } catch (error) {
    if (error instanceof ZodError) {
      return customResponse(req, {
        message: "Invalid query parameters",
        status: "FAILED",
        statusCode: 400,
        extra: {
          details: error.errors.map((err) => ({
            path: err.path.join("."),
            message: err.message,
          })),
        },
      });
    }
    return customResponse(req, {
      message: "Invalid query parameters",
      status: "FAILED",
      statusCode: 400,
    });
  }
}
