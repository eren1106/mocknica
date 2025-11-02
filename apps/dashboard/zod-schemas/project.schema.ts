import { z } from "zod";
import { SchemaSchema, SchemaSchemaType } from "./schema.schema";
import { EndPointSchema } from "./endpoint.schema";

// Schema for AI-generated schema fields
// const AISchemaFieldSchema = z.object({
//   name: z.string().min(1),
//   type: z.nativeEnum(ESchemaFieldType),
//   idFieldType: z.nativeEnum(EIdFieldType).nullable().optional(),
//   fakerType: z.nativeEnum(EFakerType).nullable().optional(),
//   objectSchemaId: z.number().int().nullable().optional(),
//   arrayType: z.object({
//     elementType: z.nativeEnum(ESchemaFieldType).nullable(),
//     objectSchemaId: z.number().int().nullable(), // Change this from nullable() to optional()
//     fakerType: z.nativeEnum(EFakerType).nullable().optional(),
//   }).nullable().optional(),
// });

// Schema for AI-generated schemas
// const AISchemaSchema = z.object({
//   name: z.string().min(1),
//   description: z.string().optional(),
//   fields: z.array(AISchemaFieldSchema).min(1),
// });

// Schema for AI-generated endpoints
// const AIEndpointSchema = z.object({
//   path: z.string().min(1),
//   method: z.nativeEnum(EHttpMethod),
//   description: z.string().min(1),
//   schemaId: z.number().int().positive().optional(),
//   isDataList: z.boolean().optional(),
//   numberOfData: z.number().int().positive().nullable().optional(),
// });

const AIEndpointSchema = EndPointSchema.omit({
  staticResponse: true,
  responseWrapperId: true,
  projectId: true,
})

// Schema for AI-generated data
const AIGeneratedDataSchema = z.object({
  schemas: z.array(SchemaSchema).min(1),
  endpoints: z.array(AIEndpointSchema).min(1),
});

export const ProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  isNeedToken: z.boolean(),
  corsOrigins: z.array(z.string().url("Please enter a valid URL")),
  // aiGeneratedData: AIGeneratedDataSchema.nullish(),
});

export type ProjectSchemaType = z.infer<typeof ProjectSchema>;
export type AIGeneratedDataType = z.infer<typeof AIGeneratedDataSchema>;
export type AISchemaType = SchemaSchemaType;
export type AIEndpointType = z.infer<typeof AIEndpointSchema>;

// Validation functions
export const validateProject = (data: unknown) => ProjectSchema.safeParse(data);
export const validateProjectStrict = (data: unknown) => ProjectSchema.parse(data);