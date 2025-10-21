import { IProject, ISchema } from "@/types";
import { ProjectSchemaType } from "@/zod-schemas/project.schema";
import { projectRepository as projectRepo, ProjectRepository, schemaRepository as schemaRepo, SchemaRepository, endpointRepository as endpointRepo, EndpointRepository, responseWrapperRepository as responseWrapperRepo, ResponseWrapperRepository } from "@/lib/repositories";
import { PrismaIncludes } from "@/lib/repositories/prisma-includes";
import { AppError, ERROR_CODES, handlePrismaError } from "@/lib/errors";
import { STATUS_CODES } from "@/constants/status-codes";
import { generateApiToken } from "@/lib/utils";
import { Prisma } from "@prisma/client";
import { SchemaService } from "@/services/schema.service";
import { WRAPPER_DATA_STR } from "@/constants";

export class ProjectService {
  constructor(
    private readonly projectRepository: ProjectRepository = projectRepo,
    private readonly schemaRepository: SchemaRepository = schemaRepo,
    private readonly endpointRepository: EndpointRepository = endpointRepo,
    private readonly responseWrapperRepository: ResponseWrapperRepository = responseWrapperRepo
  ) {}

  /**
   * Create a new project for a user
   */
  async createProject(data: ProjectSchemaType, userId: string): Promise<IProject> {
    try {
      // If AI-generated data is provided, create everything step by step
      if (data.aiGeneratedData) {
        // First create the project without AI data
        const { aiGeneratedData, ...projectData } = data;
        const projectCreateData: Prisma.ProjectCreateInput = {
          name: projectData.name,
          description: projectData.description,
          isNeedToken: projectData.isNeedToken || false,
          user: { connect: { id: userId } },
          token: projectData.isNeedToken ? generateApiToken() : undefined,
        };

        const createdProject = await this.projectRepository.create(projectCreateData);
        
        if (!createdProject) {
          throw new AppError("Failed to create project", STATUS_CODES.INTERNAL_SERVER_ERROR, ERROR_CODES.INTERNAL_ERROR);
        }

        try {
          // Create schemas
          const createdSchemas: ISchema[] = [];
          for (const schemaData of aiGeneratedData.schemas) {
            const schemaCreateData: Prisma.SchemaCreateInput = {
              name: schemaData.name,
              project: { connect: { id: createdProject.id } },
              fields: schemaData.fields ? {
                create: schemaData.fields.map((field) => ({
                  name: field.name,
                  type: field.type,
                  idFieldType: field.idFieldType ?? null,
                  fakerType: field.fakerType ?? null,
                  objectSchemaId: field.objectSchemaId ?? null,
                  arrayTypeId: field.arrayTypeId ?? null,
                })),
              } : undefined,
            };

            const createdSchema = await this.schemaRepository.create(schemaCreateData);
            const fullSchema = await this.schemaRepository.findById(
              createdSchema.id,
              PrismaIncludes.schemaInclude
            );
            
            if (fullSchema) {
              createdSchemas.push(fullSchema);
            }
          }

          // Create default response wrapper
          const responseWrapperJSON = {
            data: WRAPPER_DATA_STR,
            status: 200,
            message: "Success"
          };
          
          const responseWrapper = await this.responseWrapperRepository.create({
            name: "Default Response Wrapper",
            json: responseWrapperJSON,
            project: { connect: { id: createdProject.id } },
          });

          // Create endpoints
          for (const endpointData of aiGeneratedData.endpoints) {
            if (!endpointData.schemaId) {
              throw new AppError(
                "Schema ID is missing in endpoint data",
                STATUS_CODES.BAD_REQUEST,
                ERROR_CODES.VALIDATION_ERROR
              );
            }
            
            let schemaId: number | null = null;
            let schema: ISchema | null = null;
            
            // Find the schema by index (1-based in AI response)
            if (endpointData.schemaId && endpointData.schemaId > 0 && endpointData.schemaId <= createdSchemas.length) {
              schema = createdSchemas[endpointData.schemaId - 1];
              schemaId = schema.id;
            }

            // Generate static response for the endpoint
            const endpointResponse = schema ? SchemaService.generateResponseFromSchema(
              schema,
              endpointData.isDataList || false,
              endpointData.numberOfData || undefined
            ) : null;

            await this.endpointRepository.create({
              path: endpointData.path,
              method: endpointData.method as any,
              description: endpointData.description,
              project: { connect: { id: createdProject.id } },
              isDataList: endpointData.isDataList || false,
              numberOfData: endpointData.numberOfData || null,
              staticResponse: endpointResponse ? (endpointResponse as Prisma.InputJsonValue) : Prisma.JsonNull,
              ...(schemaId && { schema: { connect: { id: schemaId } } }),
              responseWrapper: { connect: { id: responseWrapper.id } },
            });
          }

          // Fetch and return the complete project with all relations
          const fullProject = await this.projectRepository.findById(
            createdProject.id,
            PrismaIncludes.projectInclude
          );
          
          if (!fullProject) {
            throw new AppError("Failed to retrieve created project", STATUS_CODES.INTERNAL_SERVER_ERROR, ERROR_CODES.INTERNAL_ERROR);
          }

          return fullProject;
        } catch (aiError) {
          // If AI data creation fails, delete the project to maintain consistency
          await this.projectRepository.delete(createdProject.id);
          throw aiError;
        }
      }

      // Standard project creation without AI data
      const projectData: Prisma.ProjectCreateInput = {
        name: data.name,
        description: data.description,
        isNeedToken: data.isNeedToken || false,
        user: { connect: { id: userId } },
        token: data.isNeedToken ? generateApiToken() : undefined,
      };

      const createdProject = await this.projectRepository.create(projectData);
      
      if (!createdProject) {
        throw new AppError("Failed to create project", STATUS_CODES.INTERNAL_SERVER_ERROR, ERROR_CODES.INTERNAL_ERROR);
      }

      return createdProject;
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Get a specific project by ID with ownership validation
   */
  async getProject(projectId: string, userId: string): Promise<IProject> {
    try {
      const project = await this.projectRepository.findByIdAndUserId(projectId, userId, PrismaIncludes.projectInclude);
      
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
  async getUserProjects(userId: string): Promise<IProject[]> {
    try {
      return await this.projectRepository.findByUserId(userId, PrismaIncludes.projectInclude);
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
      
      // Business logic: handle token generation/removal based on isNeedToken
      const currentProject = await this.projectRepository.findById(projectId, { select: { token: true, isNeedToken: true } });
      
      const updateData: Prisma.ProjectUpdateInput = {
        ...data,
        token: data.isNeedToken !== undefined 
          ? (data.isNeedToken ? (currentProject?.token || generateApiToken()) : null)
          : undefined,
      };

      const updatedProject = await this.projectRepository.update(
        projectId, 
        updateData,
        // PrismaIncludes.projectInclude
      );
      
      if (!updatedProject) {
        throw new AppError("Failed to update project", STATUS_CODES.INTERNAL_SERVER_ERROR, ERROR_CODES.INTERNAL_ERROR);
      }

      return updatedProject;
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
      
      await this.projectRepository.delete(projectId);
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
