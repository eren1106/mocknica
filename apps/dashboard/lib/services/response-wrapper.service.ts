import { IResponseWrapper } from "@/types";
import { ResponseWrapperSchemaType } from "@/zod-schemas/response-wrapper.schema";
import { ResponseWrapperRepository, ProjectRepository } from "@/lib/repositories";
import { AppError, ERROR_CODES, handlePrismaError } from "@/lib/errors";
import { STATUS_CODES } from "@/constants/status-codes";
import { Prisma } from "@prisma/client";
import { responseWrapperRepository as responseWrapperRepo, projectRepository as projectRepo } from "@/lib/repositories";

export class ResponseWrapperService {
  constructor(
    private readonly responseWrapperRepository: ResponseWrapperRepository = responseWrapperRepo,
    private readonly projectRepository: ProjectRepository = projectRepo
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
      const hasAccess = await this.projectRepository.existsByIdAndUserId(projectId, userId);
      if (!hasAccess) {
        throw new AppError(
          "Project not found or access denied",
          STATUS_CODES.NOT_FOUND,
          ERROR_CODES.NOT_FOUND
        );
      }

      // Convert to Prisma input
      const wrapperData: Prisma.ResponseWrapperCreateInput = {
        name: data.name,
        json: data.json ?? Prisma.JsonNull,
        project: {
          connect: { id: projectId },
        },
      };

      const createdWrapper = await this.responseWrapperRepository.create(wrapperData);
      return createdWrapper;
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
      const hasAccess = await this.projectRepository.existsByIdAndUserId(projectId, userId);
      if (!hasAccess) {
        throw new AppError(
          "Project not found or access denied",
          STATUS_CODES.NOT_FOUND,
          ERROR_CODES.NOT_FOUND
        );
      }

      const wrappers = await this.responseWrapperRepository.findByProjectId(projectId);
      return wrappers;
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Get all response wrappers for user's projects
   */
  async getUserResponseWrappers(userId: string): Promise<IResponseWrapper[]> {
    try {
      const userProjects = await this.projectRepository.findByUserId(userId);
      const projectIds = userProjects.map((p) => p.id);
      
      if (projectIds.length === 0) {
        return [];
      }

      // Get all response wrappers for user's projects efficiently
      const wrappers = await this.responseWrapperRepository.findByProjectIds(projectIds);
      return wrappers;
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
        const hasAccess = await this.projectRepository.existsByIdAndUserId(responseWrapper.projectId, userId);
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
      
      // Convert to Prisma input
      const updateData: Prisma.ResponseWrapperUpdateInput = {};
      if (data.name !== undefined) {
        updateData.name = data.name;
      }
      if (data.json !== undefined) {
        updateData.json = data.json ?? Prisma.JsonNull;
      }

      await this.responseWrapperRepository.update(responseWrapperId.toString(), updateData);
      
      // Fetch updated wrapper
      const updatedWrapper = await this.responseWrapperRepository.findById(responseWrapperId);
      if (!updatedWrapper) {
        throw new AppError(
          "Failed to retrieve updated response wrapper",
          STATUS_CODES.INTERNAL_SERVER_ERROR,
          ERROR_CODES.DATABASE_ERROR
        );
      }

      return updatedWrapper;
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
      
      const deletedWrapper = await this.responseWrapperRepository.delete(responseWrapperId.toString());
      return deletedWrapper;
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Verify if user has access to a response wrapper
   */
  async verifyResponseWrapperAccess(responseWrapperId: number, userId: string): Promise<boolean> {
    try {
      const wrapper = await this.responseWrapperRepository.findById(responseWrapperId);
      if (!wrapper || !wrapper.projectId) {
        return false;
      }

      return await this.projectRepository.existsByIdAndUserId(wrapper.projectId, userId);
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const responseWrapperService = new ResponseWrapperService();
