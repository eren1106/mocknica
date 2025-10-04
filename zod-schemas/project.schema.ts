import { ProjectPermission, SchemaFieldType, IdFieldType, FakerType, HttpMethod } from "@prisma/client";
import { z } from "zod";

// Schema for AI-generated schema fields
const AISchemaFieldSchema = z.object({
  name: z.string().min(1),
  type: z.nativeEnum(SchemaFieldType),
  idFieldType: z.nativeEnum(IdFieldType).nullable().optional(),
  fakerType: z.nativeEnum(FakerType).nullable().optional(),
  objectSchemaId: z.number().int().nullable().optional(),
  arrayType: z.object({
    elementType: z.nativeEnum(SchemaFieldType).nullable(),
    objectSchemaId: z.number().int().nullable(),
    fakerType: z.nativeEnum(FakerType).nullable().optional(),
  }).nullable().optional(),
});

// Schema for AI-generated schemas
const AISchemaSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  fields: z.array(AISchemaFieldSchema).min(1),
});

// Schema for AI-generated endpoints
const AIEndpointSchema = z.object({
  path: z.string().min(1),
  method: z.nativeEnum(HttpMethod),
  description: z.string().min(1),
  schemaId: z.number().int().positive().optional(),
  isDataList: z.boolean().optional(),
  numberOfData: z.number().int().positive().nullable().optional(),
});

// Schema for AI-generated data
const AIGeneratedDataSchema = z.object({
  schemas: z.array(AISchemaSchema),
  endpoints: z.array(AIEndpointSchema),
});

export const ProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  // permission: z.nativeEnum(ProjectPermission),
  isNeedToken: z.boolean(),
  corsOrigins: z.array(z.string().url("Please enter a valid URL")),
  aiGeneratedData: AIGeneratedDataSchema.optional(),
});

export type ProjectSchemaType = z.infer<typeof ProjectSchema>;
export type AIGeneratedDataType = z.infer<typeof AIGeneratedDataSchema>;
export type AISchemaType = z.infer<typeof AISchemaSchema>;
export type AIEndpointType = z.infer<typeof AIEndpointSchema>;

// Validation functions
export const validateProject = (data: unknown) => ProjectSchema.safeParse(data);
export const validateProjectStrict = (data: unknown) => ProjectSchema.parse(data);
