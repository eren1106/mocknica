/**
 * Helper functions to convert between fields array and JSON schema format
 */

import { ISchemaField, IJsonSchemaField } from "@/types";

/**
 * Convert fields array to JSON schema format
 */
export function fieldsToJsonSchema(fields: ISchemaField[]): IJsonSchemaField[] {
  return fields.map((field) => ({
    name: field.name,
    type: field.type,
    idFieldType: field.idFieldType ?? null,
    fakerType: field.fakerType ?? null,
    objectSchemaId: field.objectSchemaId ?? null,
    arrayType: field.arrayType
      ? {
          elementType: field.arrayType.elementType,
          objectSchemaId: field.arrayType.objectSchemaId ?? null,
          fakerType: field.arrayType.fakerType ?? null,
        }
      : null,
  }));
}