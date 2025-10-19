import { IResponseWrapper } from "@/types";
import { ResponseWrapperSchemaType } from "@/zod-schemas/response-wrapper.schema";
import { ResponseWrapperRepository } from "@/lib/repositories";
import { AppError, ERROR_CODES, handlePrismaError } from "@/lib/errors";
import { STATUS_CODES } from "@/constants/status-codes";
import { ProjectService } from "./project.service";
import { projectService as projectSvc } from "./project.service";
import { responseWrapperRepository as responseWrapperRepo } from "@/lib/repositories";

export class ResponseWrapperService {
  constructor(
    private readonly responseWrapperRepository: ResponseWrapperRepository = responseWrapperRepo,
    private readonly projectService: ProjectService = projectSvc
  ) {}

  /**
   * Create a new response wrapper with project ownership validation
   */
  async createResponseWrapper(
    data: ResponseWrapperSchemaType,
    projectId: string,
    userId: string
  ): Promise<IResponseWrapper> {
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

      return await this.responseWrapperRepository.createWrapper(data, projectId);
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Get all response wrappers for a project with ownership validation
   */
  async getProjectResponseWrappers(projectId: string, userId: string): Promise<IResponseWrapper[]> {
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

      return await this.responseWrapperRepository.findByProjectId(projectId);
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Get all response wrappers for user's projects
   */
  async getUserResponseWrappers(userId: string): Promise<IResponseWrapper[]> {
    try {
      const userProjects = await this.projectService.getUserProjects(userId);
      const projectIds = userProjects.map((p) => p.id);
      
      if (projectIds.length === 0) {
        return [];
      }

      // Get all response wrappers for user's projects efficiently
      return await this.responseWrapperRepository.findByProjectIds(projectIds);
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Get a specific response wrapper with ownership validation
   */
  async getResponseWrapper(responseWrapperId: number, userId: string): Promise<IResponseWrapper> {
    try {
      const responseWrapper = await this.responseWrapperRepository.findById(responseWrapperId);
      
      if (!responseWrapper) {
        throw new AppError(
          "Response wrapper not found",
          STATUS_CODES.NOT_FOUND,
          ERROR_CODES.NOT_FOUND
        );
      }

      // Verify project ownership if the response wrapper has a projectId
      if (responseWrapper.projectId) {
        const hasAccess = await this.projectService.verifyProjectOwnership(responseWrapper.projectId, userId);
        if (!hasAccess) {
          throw new AppError(
            "Access denied",
            STATUS_CODES.FORBIDDEN,
            ERROR_CODES.AUTH_ERROR
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
  async updateResponseWrapper(
    responseWrapperId: number,
    data: Partial<ResponseWrapperSchemaType>,
    userId: string
  ): Promise<IResponseWrapper> {
    try {
      // Verify ownership first
      await this.getResponseWrapper(responseWrapperId, userId);
      
      return await this.responseWrapperRepository.updateWrapper(responseWrapperId, data);
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Delete a response wrapper with ownership validation
   */
  async deleteResponseWrapper(responseWrapperId: number, userId: string): Promise<IResponseWrapper> {
    try {
      // Verify ownership first
      await this.getResponseWrapper(responseWrapperId, userId);
      
      return await this.responseWrapperRepository.deleteWrapper(responseWrapperId);
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Verify if user has access to a response wrapper
   */
  async verifyResponseWrapperAccess(responseWrapperId: number, userId: string): Promise<boolean> {
    try {
      const ownership = await this.responseWrapperRepository.getOwnership(responseWrapperId);
      if (!ownership) {
        return false;
      }

      return await this.projectService.verifyProjectOwnership(ownership.projectId, userId);
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const responseWrapperService = new ResponseWrapperService();
