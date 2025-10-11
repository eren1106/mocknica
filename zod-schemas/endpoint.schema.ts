import { z } from "zod";
import { HttpMethod } from "@prisma/client";

export const EndPointSchema = z.object({
  description: z.string().min(1, "Description is required"),
  method: z.nativeEnum(HttpMethod),
  path: z.string().min(1, "Path is required"),
  schemaId: z.union([z.coerce.number().int().positive(), z.literal(undefined)]),
  isDataList: z.boolean().transform((val) => val ?? false),
  numberOfData: z.coerce.number().int().positive(),
  responseWrapperId: z.union([
    z.coerce.number().int().positive(),
    z.literal(undefined),
  ]),
  staticResponse: z.string().nullable().refine((val) => {
    if (!val || val.trim() === "") return true; // Allow empty or null values
    try {
      JSON.parse(val);
      return true;
    } catch {
      return false;
    }
  }, {
    message: "Static response must be valid JSON"
  }),
  projectId: z.string().min(1, "Project is required"),
});

// TODO: to be enhanced, should not hard-code like this
export const EndpointSchemaBackend = EndPointSchema.extend({
  staticResponse: z.any().nullable().optional(),
});


export const GetEndpointsQuerySchema = z.object({
  projectId: z.string().optional(),
});


export type EndPointSchemaType = z.infer<typeof EndPointSchema>;
export type EndpointSchemaBackendType = z.infer<typeof EndpointSchemaBackend>;
export type GetEndpointsQuerySchemaType = z.infer<typeof GetEndpointsQuerySchema>;
