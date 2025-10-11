import { FakerType, IdFieldType, SchemaFieldType } from "@prisma/client";
import { z } from "zod";

const ArrayTypeSchema: z.ZodType = z.object({
  elementType: z.nativeEnum(SchemaFieldType).nullable(),
  objectSchemaId: z.number().int().nullable(),
});
// Need lazy because it references ArrayTypeSchema before it's defined
const SchemaFieldSchema: z.ZodType = z.lazy(() =>
  z.object({
    name: z.string().min(1),
    type: z.nativeEnum(SchemaFieldType),
    idFieldType: z.nativeEnum(IdFieldType).nullable().optional(),
    fakerType: z.nativeEnum(FakerType).nullable().optional(),
    objectSchemaId: z.number().int().nullable().optional(),
    arrayType: ArrayTypeSchema.nullable().optional(),
  })
);
export const SchemaSchema = z.object({
  name: z.string().min(1),
  fields: z.array(SchemaFieldSchema).min(1),
});
export type SchemaSchemaType = z.infer<typeof SchemaSchema>;

export const PayloadSchemaSchema = SchemaSchema.extend({
  projectId: z.string().min(1, "Project ID is required"),
});
export type PayloadSchemaSchemaType = z.infer<typeof PayloadSchemaSchema>;
