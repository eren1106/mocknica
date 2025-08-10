import { ProjectData } from "@/data/project.data";
import { Project } from "@/models/project.model";
import { ProjectSchemaType } from "@/zod-schemas/project.schema";
import { AppError, handlePrismaError } from "@/data/helpers/error-handler";
import { STATUS_CODES } from "@/constants/status-codes";

export class ProjectService {
  /**
   * Create a new project for a user
   */
  static async createProject(data: ProjectSchemaType, userId: string): Promise<Project> {
    try {
      return await ProjectData.createProject({ ...data, userId });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Get a specific project by ID with ownership validation
   */
  static async getProject(projectId: string, userId: string): Promise<Project> {
    try {
      const project = await ProjectData.getProjectByUserAndId(projectId, userId);
      
      if (!project) {
        throw new AppError(
          "Project not found or access denied",
          STATUS_CODES.NOT_FOUND,
          "NOT_FOUND" as any
        );
      }

      return project;
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Get all projects for a user
   */
  static async getUserProjects(userId: string): Promise<Project[]> {
    try {
      return await ProjectData.getUserProjects(userId);
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Update a project with ownership validation
   */
  static async updateProject(
    projectId: string, 
    data: Partial<ProjectSchemaType>, 
    userId: string
  ): Promise<Project> {
    try {
      // Verify ownership first
      await this.getProject(projectId, userId);
      
      return await ProjectData.updateProject(projectId, data);
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Delete a project with ownership validation
   */
  static async deleteProject(projectId: string, userId: string): Promise<void> {
    try {
      // Verify ownership first
      await this.getProject(projectId, userId);
      
      await ProjectData.deleteProject(projectId);
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Verify if user owns a project
   */
  static async verifyProjectOwnership(projectId: string, userId: string): Promise<boolean> {
    try {
      const project = await ProjectData.getProjectByUserAndId(projectId, userId);
      return !!project;
    } catch (error) {
      return false;
    }
  }
}
