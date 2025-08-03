import { apiRequest } from "@/helpers/api-request";
import { SchemaField } from "@/models/schema-field.model";
import { Schema } from "@/models/schema.model";
import { SchemaSchemaType } from "@/zod-schemas/schema.schema";
import { IdFieldType, SchemaFieldType } from "@prisma/client";
import { FakerService } from "./faker.service";
import { generateUUID } from "@/lib/utils";

export class SchemaService {
  static async getAllSchemas(projectId: string): Promise<Schema[]> {
    const url = `schema?projectId=${projectId}`;
    const res = await apiRequest.get(url);
    return res.data;
  }

  static async createSchema(data: SchemaSchemaType & { projectId?: string }): Promise<Schema> {
    const res = await apiRequest.post("schema", data);
    return res.data;
  }

  static async updateSchema(
    id: number,
    data: SchemaSchemaType
  ): Promise<Schema> {
    const res = await apiRequest.put(`schema/${id}`, data);
    return res.data;
  }

  static async deleteSchema(id: number): Promise<void> {
    await apiRequest.delete(`schema/${id}`);
  }

  static generateSchemaFieldValue(
    field: SchemaField,
    dataId?: number | string
  ) {
    if (field.type === SchemaFieldType.FAKER && field.fakerType) {
      return FakerService.generateFakerValue(field.fakerType);
    }

    if (field.type === SchemaFieldType.OBJECT && field.objectSchemaId) {
      const result: any = {};
      for (const subField of field.objectSchema?.fields || []) {
        result[subField.name] = this.generateSchemaFieldValue(
          subField as SchemaField
        );
      }
      return result;
    }

    if (field.type === SchemaFieldType.ARRAY && field.arrayType) {
      const count = Math.floor(Math.random() * 5) + 1; // Generate 1-5 items
      const result = [];
      for (let i = 0; i < count; i++) {
        if (field.arrayType.elementType === SchemaFieldType.OBJECT) {
          const objResult: any = {};
          for (const subField of field.arrayType.objectSchema?.fields || []) {
            objResult[subField.name] = this.generateSchemaFieldValue(
              subField as SchemaField
            );
          }
          result.push(objResult);
        } else if (
          field.arrayType.elementType === SchemaFieldType.FAKER &&
          field.arrayType.fakerType
        ) {
          result.push(
            FakerService.generateFakerValue(field.arrayType?.fakerType)
          );
        }
      }
      return result;
    }

    // Default values for other types
    switch (field.type) {
      case SchemaFieldType.STRING:
        return "string";
      case SchemaFieldType.INTEGER:
        return 1;
      case SchemaFieldType.FLOAT:
        return 1.0;
      case SchemaFieldType.BOOLEAN:
        return true;
      case SchemaFieldType.DATE:
        return new Date();
      case SchemaFieldType.ID:
        const defaultValue = field.idFieldType === IdFieldType.UUID ? generateUUID() : 1;
        return dataId ?? defaultValue;
      default:
        return null;
    }
  }

  static generateResponseFromSchema(
    schema: Schema,
    isList: boolean = false,
    numberOfData?: number,
  ) {
    if (isList) {
      // Generate array of 5-10 items for list endpoints
      const count = numberOfData ?? 3;
      const response = [];
      for (let i = 0; i < count; i++) {
        const item: any = {};
        for (const field of schema.fields) {
          item[field.name] = this.generateSchemaFieldValue(
            field as SchemaField,
            field.idFieldType === IdFieldType.UUID ? generateUUID() : i + 1
          );
        }
        response.push(item);
      }
      return response;
    } else {
      // Generate single item for ID endpoints
      const response: any = {};
      for (const field of schema.fields) {
        response[field.name] = this.generateSchemaFieldValue(
          field as SchemaField
        );
      }
      return response;
    }
  }
}
