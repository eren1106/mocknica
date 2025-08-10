import { ResponseWrapperData } from "@/data/response-wrapper.data";
import { ResponseWrapper } from "@prisma/client";
import { ResponseWrapperSchemaType } from "@/zod-schemas/response-wrapper.schema";
import { AppError, handlePrismaError } from "@/data/helpers/error-handler";
import { STATUS_CODES } from "@/constants/status-codes";
import { ProjectService } from "./project.service";

export class ResponseWrapperService {
  /**
   * Create a new response wrapper with project ownership validation
   */
  static async createResponseWrapper(
    data: ResponseWrapperSchemaType,
    projectId: string,
    userId: string
  ): Promise<ResponseWrapper> {
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

      return await ResponseWrapperData.createResponseWrapper(data, projectId);
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Get all response wrappers for a project with ownership validation
   */
  static async getProjectResponseWrappers(projectId: string, userId: string): Promise<ResponseWrapper[]> {
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

      return await ResponseWrapperData.getResponseWrappers(projectId);
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Get all response wrappers for user's projects
   */
  static async getUserResponseWrappers(userId: string): Promise<ResponseWrapper[]> {
    try {
      const userProjects = await ProjectService.getUserProjects(userId);
      const projectIds = userProjects.map((p: any) => p.id);
      
      if (projectIds.length === 0) {
        return [];
      }

      // Get all response wrappers for user's projects efficiently
      return await ResponseWrapperData.getResponseWrappersByProjectIds(projectIds);
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Get a specific response wrapper with ownership validation
   */
  static async getResponseWrapper(responseWrapperId: number, userId: string): Promise<ResponseWrapper> {
    try {
      const responseWrapper = await ResponseWrapperData.getResponseWrapperById(responseWrapperId);
      
      if (!responseWrapper) {
        throw new AppError(
          "Response wrapper not found",
          STATUS_CODES.NOT_FOUND,
          "NOT_FOUND" as any
        );
      }

      // Verify project ownership if the response wrapper has a projectId
      if (responseWrapper.projectId) {
        const hasAccess = await ProjectService.verifyProjectOwnership(responseWrapper.projectId, userId);
        if (!hasAccess) {
          throw new AppError(
            "Access denied",
            STATUS_CODES.FORBIDDEN,
            "AUTH_ERROR" as any
          );
        }
      }

      return responseWrapper;
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Update a response wrapper with ownership validation
   */
  static async updateResponseWrapper(
    responseWrapperId: number,
    data: Partial<ResponseWrapperSchemaType>,
    userId: string
  ): Promise<ResponseWrapper> {
    try {
      // Verify ownership first
      await this.getResponseWrapper(responseWrapperId, userId);
      
      return await ResponseWrapperData.updateResponseWrapper(responseWrapperId, data);
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Delete a response wrapper with ownership validation
   */
  static async deleteResponseWrapper(responseWrapperId: number, userId: string): Promise<ResponseWrapper> {
    try {
      // Verify ownership first
      await this.getResponseWrapper(responseWrapperId, userId);
      
      return await ResponseWrapperData.deleteResponseWrapper(responseWrapperId);
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Verify if user has access to a response wrapper
   */
  static async verifyResponseWrapperAccess(responseWrapperId: number, userId: string): Promise<boolean> {
    try {
      const ownership = await ResponseWrapperData.getResponseWrapperOwnership(responseWrapperId);
      if (!ownership) {
        return false;
      }

      return await ProjectService.verifyProjectOwnership(ownership.projectId, userId);
    } catch (error) {
      return false;
    }
  }
}
