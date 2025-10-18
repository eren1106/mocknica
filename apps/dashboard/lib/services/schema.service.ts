import { ISchema, ISchemaField } from "@/types";
import { SchemaSchemaType } from "@/zod-schemas/schema.schema";
import { SchemaRepository } from "@/lib/repositories";
import { AppError, ERROR_CODES, handlePrismaError } from "@/lib/errors";
import { STATUS_CODES } from "@/constants/status-codes";
import { ProjectService } from "./project.service";
import { IdFieldType, SchemaFieldType } from "@prisma/client";
import { FakerService } from "@/services/faker.service";
import { generateUUID } from "@/lib/utils";

export class SchemaService {
  constructor(
    private readonly schemaRepository: SchemaRepository = schemaRepository,
    private readonly projectService: ProjectService = projectService
  ) {}

  /**
   * Create a new schema with project ownership validation
   */
  async createSchema(
    data: SchemaSchemaType,
    projectId: string,
    userId: string
  ): Promise<ISchema> {
    try {
      // Verify project ownership
      const hasAccess = await this.projectService.verifyProjectOwnership(projectId, userId);
      if (!hasAccess) {
        throw new AppError(
          "Project not found or access denied",
          STATUS_CODES.NOT_FOUND,
          ERROR_CODES.NOT_FOUND
        );
      }

      return await this.schemaRepository.createSchema(data, projectId);
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Get all schemas for a project with ownership validation
   */
  async getProjectSchemas(projectId: string, userId: string): Promise<ISchema[]> {
    try {
      // Verify project ownership
      const hasAccess = await this.projectService.verifyProjectOwnership(projectId, userId);
      if (!hasAccess) {
        throw new AppError(
          "Project not found or access denied",
          STATUS_CODES.NOT_FOUND,
          ERROR_CODES.NOT_FOUND
        );
      }

      return await this.schemaRepository.findByProjectId(projectId);
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Get a specific schema with ownership validation
   */
  async getSchema(schemaId: number, userId: string): Promise<ISchema> {
    try {
      const schema = await this.schemaRepository.findById(schemaId);
      
      if (!schema) {
        throw new AppError(
          "Schema not found",
          STATUS_CODES.NOT_FOUND,
          ERROR_CODES.NOT_FOUND
        );
      }

      // Verify project ownership if schema has projectId
      if (schema.projectId) {
        const hasAccess = await this.projectService.verifyProjectOwnership(schema.projectId, userId);
        if (!hasAccess) {
          throw new AppError(
            "Access denied",
            STATUS_CODES.FORBIDDEN,
            ERROR_CODES.AUTH_ERROR
          );
        }
      }

      return schema;
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Update a schema with ownership validation
   */
  async updateSchema(
    schemaId: number,
    data: SchemaSchemaType,
    userId: string
  ): Promise<ISchema> {
    try {
      // Verify ownership first
      await this.getSchema(schemaId, userId);
      
      return await this.schemaRepository.updateSchema(schemaId, data);
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Delete a schema with ownership validation
   */
  async deleteSchema(schemaId: number, userId: string): Promise<Partial<ISchema>> {
    try {
      // Verify ownership first
      await this.getSchema(schemaId, userId);
      
      return await this.schemaRepository.deleteSchema(schemaId);
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Verify if user has access to a schema
   */
  async verifySchemaAccess(schemaId: number, userId: string): Promise<boolean> {
    try {
      const schema = await this.schemaRepository.findById(schemaId);
      if (!schema || !schema.projectId) {
        return false;
      }
      
      return await this.projectService.verifyProjectOwnership(schema.projectId, userId);
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate a value for a schema field
   * Used for creating mock/fake data responses
   */
  generateSchemaFieldValue(
    field: ISchemaField,
    dataId?: number | string
  ) {
    if (field.type === SchemaFieldType.FAKER && field.fakerType) {
      return FakerService.generateFakerValue(field.fakerType);
    }

    if (field.type === SchemaFieldType.OBJECT && field.objectSchemaId) {
      const result: any = {};
      for (const subField of field.objectSchema?.fields || []) {
        result[subField.name] = this.generateSchemaFieldValue(
          subField as ISchemaField
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
              subField as ISchemaField
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

  /**
   * Generate a response from a schema
   * Used for creating mock/fake data for endpoints
   */
  generateResponseFromSchema(
    schema: ISchema,
    isList: boolean = false,
    numberOfData?: number,
  ) {
    if (isList) {
      // Generate array of items for list endpoints
      const count = numberOfData ?? 3;
      const response = [];
      for (let i = 0; i < count; i++) {
        const item: any = {};
        for (const field of schema.fields) {
          item[field.name] = this.generateSchemaFieldValue(
            field as ISchemaField,
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
          field as ISchemaField
        );
      }
      return response;
    }
  }
}

// Export singleton instance
export const schemaService = new SchemaService();
