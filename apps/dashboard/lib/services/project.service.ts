import { IProject, IProjectLight } from "@/types";
import { ProjectSchemaType } from "@/zod-schemas/project.schema";
import { ProjectRepository } from "@/lib/repositories";
import { AppError, ERROR_CODES, handlePrismaError } from "@/lib/errors";
import { STATUS_CODES } from "@/constants/status-codes";

export class ProjectService {
  constructor(private readonly projectRepository: ProjectRepository = projectRepository) {}

  /**
   * Create a new project for a user
   */
  async createProject(data: ProjectSchemaType, userId: string): Promise<IProject> {
    try {
      return await this.projectRepository.createProject({ ...data, userId });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Get a specific project by ID with ownership validation
   */
  async getProject(projectId: string, userId: string): Promise<IProject> {
    try {
      const project = await this.projectRepository.findByIdAndUserId(projectId, userId);
      
      if (!project) {
        throw new AppError(
          "Project not found or access denied",
          STATUS_CODES.NOT_FOUND,
          ERROR_CODES.NOT_FOUND
        );
      }

      return project;
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Get all projects for a user
   * Returns light version for better performance in list views
   */
  async getUserProjects(userId: string): Promise<IProjectLight[]> {
    try {
      return await this.projectRepository.findByUserId(userId);
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Update a project with ownership validation
   */
  async updateProject(
    projectId: string, 
    data: Partial<ProjectSchemaType>, 
    userId: string
  ): Promise<IProject> {
    try {
      // Verify ownership first
      await this.getProject(projectId, userId);
      
      return await this.projectRepository.updateProject(projectId, data);
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Delete a project with ownership validation
   */
  async deleteProject(projectId: string, userId: string): Promise<void> {
    try {
      // Verify ownership first
      await this.getProject(projectId, userId);
      
      await this.projectRepository.delete({ id: projectId });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Verify if user owns a project
   */
  async verifyProjectOwnership(projectId: string, userId: string): Promise<boolean> {
    try {
      return await this.projectRepository.existsByIdAndUserId(projectId, userId);
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const projectService = new ProjectService();
