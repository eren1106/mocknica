import { apiRequest } from "@/helpers/api-request";
import { SchemaSchemaType } from "@/zod-schemas/schema.schema";
import { FakerService } from "./faker.service";
import { generateUUID } from "@/lib/utils";
import { EIdFieldType, ESchemaFieldType, ISchema, ISchemaField } from "@/types";

export class SchemaService {
  static async getAllSchemas(projectId: string): Promise<ISchema[]> {
    const url = `schema?projectId=${projectId}`;
    const res = await apiRequest.get(url);
    return res.data;
  }

  static async createSchema(data: SchemaSchemaType & { projectId?: string }): Promise<ISchema> {
    const res = await apiRequest.post("schema", data);
    return res.data;
  }

  static async updateSchema(
    id: number,
    data: SchemaSchemaType
  ): Promise<ISchema> {
    const res = await apiRequest.put(`schema/${id}`, data);
    return res.data;
  }

  static async deleteSchema(id: number): Promise<void> {
    await apiRequest.delete(`schema/${id}`);
  }

  // TODO: move this function to helpers file
  static generateSchemaFieldValue(
    field: ISchemaField,
    dataId?: number | string
  ) {
    if (field.type === ESchemaFieldType.FAKER && field.fakerType) {
      return FakerService.generateFakerValue(field.fakerType);
    }

    if (field.type === ESchemaFieldType.OBJECT && field.objectSchemaId) {
      const result: any = {};
      if (field.objectSchema) {
        const objectFields = field.objectSchema.fields || field.objectSchema.fields || [];
        for (const subField of objectFields) {
          result[subField.name] = this.generateSchemaFieldValue(
            subField as ISchemaField
          );
        }
      } else {
        console.warn('⚠️ [Frontend] No objectSchema found for field:', field.name);
      }
      return result;
    }

    if (field.type === ESchemaFieldType.ARRAY && field.arrayType) {
      const count = Math.floor(Math.random() * 5) + 1; // Generate 1-5 items
      const result = [];
      for (let i = 0; i < count; i++) {
        if (field.arrayType.elementType === ESchemaFieldType.OBJECT) {
          const objResult: any = {};
          if (field.arrayType.objectSchema) {
            const arrayObjectFields = field.arrayType.objectSchema.fields || field.arrayType.objectSchema.fields || [];
            for (const subField of arrayObjectFields) {
              objResult[subField.name] = this.generateSchemaFieldValue(
                subField as ISchemaField
              );
            }
          } else {
            console.warn('⚠️ [Frontend] No arrayType.objectSchema found for field:', field.name, 'objectSchemaId:', field.arrayType.objectSchemaId);
          }
          result.push(objResult);
        } else if (
          field.arrayType.elementType === ESchemaFieldType.FAKER &&
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
      case ESchemaFieldType.STRING:
        return "string";
      case ESchemaFieldType.INTEGER:
        return 1;
      case ESchemaFieldType.FLOAT:
        return 1.0;
      case ESchemaFieldType.BOOLEAN:
        return true;
      case ESchemaFieldType.DATE:
        return new Date();
      case ESchemaFieldType.ID:
        const defaultValue = field.idFieldType === EIdFieldType.UUID ? generateUUID() : 1;
        return dataId ?? defaultValue;
      default:
        return null;
    }
  }

  // TODO: move this function to helpers file
  static generateResponseFromSchema(
    schema: ISchema,
    isList: boolean = false,
    numberOfData?: number,
  ) {
    const fields = schema.fields || [];
    
    if (isList) {
      // Generate array of 5-10 items for list endpoints
      const count = numberOfData ?? 3;
      const response = [];
      for (let i = 0; i < count; i++) {
        const item: any = {};
        for (const field of fields) {
          item[field.name] = this.generateSchemaFieldValue(
            field as ISchemaField,
            field.idFieldType === EIdFieldType.UUID ? generateUUID() : i + 1
          );
        }
        response.push(item);
      }
      return response;
    } else {
      // Generate single item for ID endpoints
      const response: any = {};
      for (const field of fields) {
        response[field.name] = this.generateSchemaFieldValue(
          field as ISchemaField
        );
      }
      return response;
    }
  }
}
