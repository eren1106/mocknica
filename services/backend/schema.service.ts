import { SchemaData } from "@/data/schema.data";
import { Schema } from "@/models/schema.model";
import { SchemaSchemaType } from "@/zod-schemas/schema.schema";
import { AppError, handlePrismaError } from "@/data/helpers/error-handler";
import { STATUS_CODES } from "@/constants/status-codes";
import { ProjectService } from "./project.service";

export class SchemaService {
  /**
   * Create a new schema with project ownership validation
   */
  static async createSchema(
    data: SchemaSchemaType,
    projectId: string,
    userId: string
  ): Promise<Schema> {
    try {
      // Verify project ownership
      const hasAccess = await ProjectService.verifyProjectOwnership(projectId, userId);
      if (!hasAccess) {
        throw new AppError(
          "Project not found or access denied",
          STATUS_CODES.NOT_FOUND,
          "NOT_FOUND" as any
        );
      }

      return await SchemaData.createSchema(data, projectId);
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Get all schemas for a project with ownership validation
   */
  static async getProjectSchemas(projectId: string, userId: string): Promise<Schema[]> {
    try {
      // Verify project ownership
      const hasAccess = await ProjectService.verifyProjectOwnership(projectId, userId);
      if (!hasAccess) {
        throw new AppError(
          "Project not found or access denied",
          STATUS_CODES.NOT_FOUND,
          "NOT_FOUND" as any
        );
      }

      return await SchemaData.getAllSchemas(projectId);
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Get a specific schema with ownership validation
   */
  static async getSchema(schemaId: number, userId: string): Promise<Schema> {
    try {
      const schema = await SchemaData.getSchema(schemaId);
      
      if (!schema) {
        throw new AppError(
          "Schema not found",
          STATUS_CODES.NOT_FOUND,
          "NOT_FOUND" as any
        );
      }

      // Verify project ownership if schema has projectId
      if (schema.projectId) {
        const hasAccess = await ProjectService.verifyProjectOwnership(schema.projectId, userId);
        if (!hasAccess) {
          throw new AppError(
            "Access denied",
            STATUS_CODES.FORBIDDEN,
            "AUTH_ERROR" as any
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
  static async updateSchema(
    schemaId: number,
    data: SchemaSchemaType,
    userId: string
  ): Promise<Schema> {
    try {
      // Verify ownership first
      await this.getSchema(schemaId, userId);
      
      return await SchemaData.updateSchema(schemaId, data);
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Delete a schema with ownership validation
   */
  static async deleteSchema(schemaId: number, userId: string): Promise<Partial<Schema>> {
    try {
      // Verify ownership first
      await this.getSchema(schemaId, userId);
      
      return await SchemaData.deleteSchema(schemaId);
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Verify if user has access to a schema
   */
  static async verifySchemaAccess(schemaId: number, userId: string): Promise<boolean> {
    try {
      const schema = await SchemaData.getSchema(schemaId);
      if (!schema || !schema.projectId) {
        return false;
      }
      
      return await ProjectService.verifyProjectOwnership(schema.projectId, userId);
    } catch (error) {
      return false;
    }
  }
}
