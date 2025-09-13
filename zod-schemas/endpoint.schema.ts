import { z } from "zod";
import { HttpMethod } from "@prisma/client";

export const EndPointSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable(),
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

export type EndPointSchemaType = z.infer<typeof EndPointSchema>;
