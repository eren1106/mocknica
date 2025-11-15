import { ISchema, ISchemaField, IJsonSchemaField } from "@/types";
import { SchemaSchemaType } from "@/zod-schemas/schema.schema";
import { SchemaRepository, ProjectRepository } from "@/lib/repositories";
import { AppError, ERROR_CODES, handlePrismaError } from "@/lib/errors";
import { STATUS_CODES } from "@/constants/status-codes";
import { IdFieldType, SchemaFieldType, Prisma } from "@prisma/client";
import { FakerService } from "./faker.service";
import { generateUUID } from "@/lib/utils";
import { schemaRepository as schemaRepo, projectRepository as projectRepo } from "@/lib/repositories";
import { PrismaIncludes } from "@/lib/repositories/prisma-includes";
import { endpointRepository } from "@/lib/repositories";

export class SchemaService {
  constructor(
    private readonly schemaRepository: SchemaRepository = schemaRepo,
    private readonly projectRepository: ProjectRepository = projectRepo
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
      const hasAccess = await this.projectRepository.existsByIdAndUserId(projectId, userId);
      if (!hasAccess) {
        throw new AppError(
          "Project not found or access denied",
          STATUS_CODES.NOT_FOUND,
          ERROR_CODES.NOT_FOUND
        );
      }

      // Convert SchemaSchemaType to Prisma.SchemaCreateInput
      const schemaData: Prisma.SchemaCreateInput = {
        name: data.name,
        jsonSchema: data.jsonSchema as any,
        project: {
          connect: { id: projectId },
        },
      };

      const createdSchema = await this.schemaRepository.create(schemaData);
      
      // Fetch with full relations and map to domain type
      const fullSchema = await this.schemaRepository.findById(
        createdSchema.id,
        PrismaIncludes.schemaInclude
      );

      if (!fullSchema) {
        throw new AppError(
          "Failed to retrieve created schema",
          STATUS_CODES.INTERNAL_SERVER_ERROR,
          ERROR_CODES.DATABASE_ERROR
        );
      }

      return fullSchema;
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Enrich a schema by populating nested schema references in jsonSchema
   */
  private async enrichSchemaWithNestedSchemas(schema: ISchema): Promise<ISchema> {
    if (!schema.jsonSchema || schema.jsonSchema.length === 0) {
      return schema;
    }

    const enrichedJsonSchema = await Promise.all(
      schema.jsonSchema.map(async (field) => {
        const enrichedField: any = { ...field };

        // Enrich OBJECT type fields
        if (field.type === 'OBJECT' && field.objectSchemaId) {
          try {
            const nestedSchema = await this.schemaRepository.findById(field.objectSchemaId);
            if (nestedSchema) {
              enrichedField.objectSchema = nestedSchema;
            }
          } catch (error) {
            console.error(`Failed to load nested schema ${field.objectSchemaId}:`, error);
          }
        }

        // Enrich ARRAY<OBJECT> type fields
        if (field.type === 'ARRAY' && field.arrayType?.objectSchemaId) {
          try {
            const nestedSchema = await this.schemaRepository.findById(field.arrayType.objectSchemaId);
            if (nestedSchema) {
              enrichedField.arrayType = {
                ...field.arrayType,
                objectSchema: nestedSchema,
              };
            }
          } catch (error) {
            console.error(`Failed to load array nested schema ${field.arrayType.objectSchemaId}:`, error);
          }
        }

        return enrichedField;
      })
    );

    return {
      ...schema,
      jsonSchema: enrichedJsonSchema as any,
    };
  }

  /**
   * Get all schemas for a project with ownership validation
   */
  async getProjectSchemas(projectId: string, userId: string): Promise<ISchema[]> {
    try {
      // Verify project ownership
      const hasAccess = await this.projectRepository.existsByIdAndUserId(projectId, userId);
      if (!hasAccess) {
        throw new AppError(
          "Project not found or access denied",
          STATUS_CODES.NOT_FOUND,
          ERROR_CODES.NOT_FOUND
        );
      }

      const schemas = await this.schemaRepository.findByProjectId(
        projectId,
        PrismaIncludes.schemaInclude
      );
      
      // Enrich all schemas with nested schema data
      const enrichedSchemas = await Promise.all(
        schemas.map(schema => this.enrichSchemaWithNestedSchemas(schema))
      );
      
      return enrichedSchemas;
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Get a specific schema with ownership validation
   */
  async getSchema(schemaId: number, userId: string): Promise<ISchema> {
    try {
      const schema = await this.schemaRepository.findById(
        schemaId,
        PrismaIncludes.schemaInclude
      );
      
      if (!schema) {
        throw new AppError(
          "Schema not found",
          STATUS_CODES.NOT_FOUND,
          ERROR_CODES.NOT_FOUND
        );
      }

      // Verify project ownership if schema has projectId
      if (schema.projectId) {
        const hasAccess = await this.projectRepository.existsByIdAndUserId(schema.projectId, userId);
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
   * AUTOMATICALLY regenerates staticResponse for all endpoints using this schema
   */
  async updateSchema(
    schemaId: number,
    data: SchemaSchemaType,
    userId: string
  ): Promise<ISchema> {
    try {
      // Verify ownership first
      await this.getSchema(schemaId, userId);
      
      // Convert SchemaSchemaType to Prisma.SchemaUpdateInput
      const schemaData: Prisma.SchemaUpdateInput = {
        name: data.name,
        jsonSchema: data.jsonSchema as any,
      };

      await this.schemaRepository.update(schemaId, schemaData);
      
      // Fetch with full relations and map to domain type
      const updatedSchema = await this.schemaRepository.findById(
        schemaId,
        PrismaIncludes.schemaInclude
      );

      if (!updatedSchema) {
        throw new AppError(
          "Failed to retrieve updated schema",
          STATUS_CODES.INTERNAL_SERVER_ERROR,
          ERROR_CODES.DATABASE_ERROR
        );
      }

      // AUTO-REGENERATE: Update staticResponse for all endpoints using this schema
      await this.regenerateEndpointResponsesForSchema(schemaId, updatedSchema);

      return updatedSchema;
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Regenerate staticResponse for all endpoints using a specific schema
   * Called automatically when schema is updated
   */
  private async regenerateEndpointResponsesForSchema(
    schemaId: number,
    schema: ISchema
  ): Promise<void> {
    try {
      // Find all endpoints that use this schema
      const endpoints = await endpointRepository.findMany({
        where: { schemaId: schemaId },
      });

      if (endpoints.length === 0) {
        return;
      }

      // Regenerate staticResponse for each endpoint
      for (const endpoint of endpoints) {
        // Generate new response from updated schema
        const newStaticResponse = await this.generateResponseFromSchema(
          schema,
          endpoint.isDataList ?? false,
          endpoint.numberOfData ?? undefined
        );

        // Update endpoint with new staticResponse
        await endpointRepository.update(endpoint.id, {
          staticResponse: newStaticResponse as Prisma.InputJsonValue,
        });
      }
    } catch (error) {
      console.error("❌ [Schema Service] Error regenerating endpoint responses:", error);
      // Don't throw - we don't want to fail the schema update if regeneration fails
      // Just log the error
    }
  }

  /**
   * Delete a schema with ownership validation
   */
  async deleteSchema(schemaId: number, userId: string): Promise<Partial<ISchema>> {
    try {
      // Verify ownership first
      await this.getSchema(schemaId, userId);
      
      const deletedSchema = await this.schemaRepository.delete(schemaId);
      
      return {
        id: deletedSchema.id,
        name: deletedSchema.name,
        projectId: deletedSchema.projectId ?? undefined,
      };
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
      
      return await this.projectRepository.existsByIdAndUserId(schema.projectId, userId);
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
      const objectFields = field.objectSchema ? (field.objectSchema.jsonSchema || field.objectSchema.fields || []) : [];
      for (const subField of objectFields) {
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
          const arrayObjectFields = field.arrayType.objectSchema ? (field.arrayType.objectSchema.jsonSchema || field.arrayType.objectSchema.fields || []) : [];
          for (const subField of arrayObjectFields) {
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
   * Resolve nested schemas for fields with objectSchemaId references
   * This fetches the actual schema data for OBJECT and ARRAY<OBJECT> types
   */
  private async resolveNestedSchemas(fields: ISchemaField[]): Promise<ISchemaField[]> {
    const resolvedFields: ISchemaField[] = [];

    for (const field of fields) {
      const resolvedField = { ...field };
      
      // Resolve OBJECT type with objectSchemaId
      if (field.type === SchemaFieldType.OBJECT && field.objectSchemaId && !field.objectSchema) {
        try {
          const objectSchema = await this.schemaRepository.findById(field.objectSchemaId);
          if (objectSchema) {
            resolvedField.objectSchema = objectSchema;
          } else {
            console.warn('⚠️ [resolveNestedSchemas] Object schema not found for ID:', field.objectSchemaId);
          }
        } catch (error) {
          console.error(`❌ [resolveNestedSchemas] Failed to resolve object schema ${field.objectSchemaId}:`, error);
        }
      }
      
      // Resolve ARRAY type with OBJECT elements
      if (field.type === SchemaFieldType.ARRAY && field.arrayType?.objectSchemaId && !field.arrayType.objectSchema) {
        try {
          const arrayObjectSchema = await this.schemaRepository.findById(field.arrayType.objectSchemaId);
          if (arrayObjectSchema) {
            resolvedField.arrayType = {
              id: field.arrayType.id || 0,
              elementType: field.arrayType.elementType,
              objectSchemaId: field.arrayType.objectSchemaId,
              fakerType: field.arrayType.fakerType,
              objectSchema: arrayObjectSchema,
            };
          } else {
            console.warn('⚠️ [resolveNestedSchemas] Array object schema not found for ID:', field.arrayType.objectSchemaId);
          }
        } catch (error) {
          console.error(`❌ [resolveNestedSchemas] Failed to resolve array object schema ${field.arrayType.objectSchemaId}:`, error);
        }
      }
      
      resolvedFields.push(resolvedField);
    }
    
    return resolvedFields;
  }

  /**
   * Generate a response from a schema
   * Used for creating mock/fake data for endpoints
   */
  async generateResponseFromSchema(
    schema: ISchema,
    isList: boolean = false,
    numberOfData?: number,
  ) {
    const fields = schema.jsonSchema || schema.fields || [];
    
    // Resolve any nested schema references
    const resolvedFields = await this.resolveNestedSchemas(fields as ISchemaField[]);

    if (isList) {
      // Generate array of items for list endpoints
      const count = numberOfData ?? 3;
      const response = [];
      for (let i = 0; i < count; i++) {
        const item: any = {};
        for (const field of resolvedFields) {
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
      for (const field of resolvedFields) {
        response[field.name] = this.generateSchemaFieldValue(
          field as ISchemaField
        );
      }
      return response;
    }
  }

  /**
   * Bulk create schemas with fields
   */
  async bulkCreateSchemas(
    schemasData: SchemaSchemaType[],
    projectId: string,
    userId: string
  ): Promise<ISchema[]> {
    try {
      // Verify project ownership
      const hasAccess = await this.projectRepository.existsByIdAndUserId(projectId, userId);
      if (!hasAccess) {
        throw new AppError(
          "Project not found or access denied",
          STATUS_CODES.NOT_FOUND,
          ERROR_CODES.NOT_FOUND
        );
      }

      const createdSchemas: ISchema[] = [];

      for (const schemaData of schemasData) {
        const created = await this.createSchema(schemaData, projectId, userId);
        createdSchemas.push(created);
      }

      return createdSchemas;
    } catch (error) {
      throw handlePrismaError(error);
    }
  }
}

// Export singleton instance
export const schemaService = new SchemaService();
