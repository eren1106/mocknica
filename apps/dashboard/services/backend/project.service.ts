import { ProjectData } from "@/data/project.data";
import { SchemaData } from "@/data/schema.data";
import { EndpointData } from "@/data/endpoint.data";
import { Project } from "@/models/project.model";
import { ProjectSchemaType } from "@/zod-schemas/project.schema";
import { AppError, ERROR_CODES, handlePrismaError } from "@/data/helpers/error-handler";
import { STATUS_CODES } from "@/constants/status-codes";
import { Schema } from "@/models/schema.model";
import { SchemaService } from "../schema.service";
import { WRAPPER_DATA_STR } from "@/constants";
import { ResponseWrapperData } from "@/data/response-wrapper.data";

export class ProjectService {
  /**
   * Create a new project for a user
   */
  static async createProject(data: ProjectSchemaType, userId: string): Promise<Project> {
    try {
      // If AI-generated data is provided, create everything step by step
      if (data.aiGeneratedData) {        
        // First create the project without AI data
        const { aiGeneratedData, ...projectData } = data;
        const project = await ProjectData.createProject({ ...projectData, userId });

        try {
          // Create schemas
          const createdSchemas: Schema[] = [];
          for (const schemaData of aiGeneratedData.schemas) {
            const createdSchema = await SchemaData.createSchema(
              {
                name: schemaData.name,
                fields: schemaData.fields
              },
              project.id
            );
            createdSchemas.push(createdSchema as Schema);
          }

          // Create default response wrapper
          const responseWrapperJSON = {
            data: WRAPPER_DATA_STR,
            status: 200,
            message: "Success"
          }
          const responseWrapper = await ResponseWrapperData.createResponseWrapper({
            name: "Default Response Wrapper",
            // we want send this "data": $data , not this "data": "$data"
            json: JSON.stringify(responseWrapperJSON).replaceAll(`"${WRAPPER_DATA_STR}"`, WRAPPER_DATA_STR),
          }, project.id);

          // Create endpoints
          for (const endpointData of aiGeneratedData.endpoints) {
            if(!endpointData.schemaId) {
              throw new AppError(
                "Schema ID is missing in endpoint data",
                STATUS_CODES.BAD_REQUEST,
                ERROR_CODES.VALIDATION_ERROR
              );
            }
            
            let schemaId: number | null = null;
            let schema: Schema | null = null;
            
            // Find the schema by index (1-based in AI response)
            if (endpointData.schemaId && endpointData.schemaId > 0 && endpointData.schemaId <= createdSchemas.length) {
              schema = createdSchemas[endpointData.schemaId - 1];
              schemaId = schema.id;
            }

            const endpointResponse = schema ? SchemaService.generateResponseFromSchema(
              schema,
              endpointData.isDataList || false,
              endpointData.numberOfData || undefined
            ) : null;

            await EndpointData.createEndpoint({
              path: endpointData.path,
              method: endpointData.method,
              description: endpointData.description,
              projectId: project.id,
              schemaId,
              isDataList: endpointData.isDataList || false,
              numberOfData: endpointData.numberOfData || null,
              responseWrapperId: responseWrapper.id,
              staticResponse: endpointResponse,
            });
          }

          // Return the project with all related data
          const finalProject = await ProjectData.getProject(project.id);
          if (!finalProject) {
            throw new AppError(
              "Failed to retrieve created project",
              STATUS_CODES.INTERNAL_SERVER_ERROR,
              ERROR_CODES.DATABASE_ERROR
            );
          }
          return finalProject;
        } catch (error) {
          // If schemas/endpoints creation fails, delete the project to maintain consistency
          await ProjectData.deleteProject(project.id);
          throw error;
        }
      } else {
        // Regular project creation without AI data
        return await ProjectData.createProject({ ...data, userId });
      }
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
