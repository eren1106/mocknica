import { z } from "zod";
import { EFakerType, EIdFieldType, ESchemaFieldType } from "@/types";

// const ArrayTypeSchema: z.ZodType = z.object({
//   elementType: z.nativeEnum(ESchemaFieldType).nullable(),
//   objectSchemaId: z.number().int().nullable(),
//   fakerType: z.nativeEnum(EFakerType).nullable().optional(),
// });

// Need lazy because it references ArrayTypeSchema before it's defined
// const SchemaFieldSchema: z.ZodType = z.lazy(() =>
//   z.object({
//     name: z.string().min(1),
//     type: z.nativeEnum(ESchemaFieldType),
//     idFieldType: z.nativeEnum(EIdFieldType).nullable().optional(),
//     fakerType: z.nativeEnum(EFakerType).nullable().optional(),
//     objectSchemaId: z.number().int().nullable().optional(),
//     arrayType: ArrayTypeSchema.nullable().optional(),
//   })
// );

// JSON Schema field format (without IDs)
const JsonSchemaFieldSchema: z.ZodType = z.lazy(() =>
  z.object({
    name: z.string().min(1),
    type: z.nativeEnum(ESchemaFieldType),
    idFieldType: z.nativeEnum(EIdFieldType).nullable().optional(),
    fakerType: z.nativeEnum(EFakerType).nullable().optional(),
    objectSchemaId: z.number().int().nullable().optional(),
    arrayType: z.object({
      elementType: z.nativeEnum(ESchemaFieldType),
      objectSchemaId: z.number().int().nullable().optional(),
      fakerType: z.nativeEnum(EFakerType).nullable().optional(),
    }).nullable().optional(),
  })
);

export const SchemaSchema = z.object({
  name: z.string().min(1),
  jsonSchema: z.array(JsonSchemaFieldSchema).min(1),
});
export type SchemaSchemaType = z.infer<typeof SchemaSchema>;

export const PayloadSchemaSchema = SchemaSchema.extend({
  projectId: z.string().min(1, "Project ID is required"),
});
export type PayloadSchemaSchemaType = z.infer<typeof PayloadSchemaSchema>;
