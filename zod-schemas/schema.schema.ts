import { FakerType, IdFieldType, SchemaFieldType } from "@prisma/client";
import { z } from "zod";

const ArrayTypeSchema: z.ZodType<any> = z.lazy(() =>
    z.object({
      elementType: z.nativeEnum(SchemaFieldType).nullable(),
      objectSchemaId: z.number().int().nullable(),
    })
  );
  const SchemaFieldSchema: z.ZodType<any> = z.lazy(() =>
    z.object({
      name: z.string().min(1),
      type: z.nativeEnum(SchemaFieldType),
      idFieldType: z.nativeEnum(IdFieldType).nullable(),
      fakerType: z.nativeEnum(FakerType).nullable(),
      objectSchemaId: z.number().int().nullable(),
      arrayType: ArrayTypeSchema.nullable(),
    })
  );
  // Main Schema schema
  export const SchemaSchema = z.object({
    name: z.string().min(1),
    fields: z.array(SchemaFieldSchema).min(1),
  });
  export type SchemaSchemaType = z.infer<typeof SchemaSchema>;

  // Validation functions
  export const validateSchema = (data: unknown) => SchemaSchema.safeParse(data);
  export const validateSchemaStrict = (data: unknown) => SchemaSchema.parse(data);
