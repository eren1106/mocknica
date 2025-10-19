import { IEndpoint, EHttpMethod } from "@/types";
import { EndpointRepository } from "@/lib/repositories";
import { AppError, ERROR_CODES, handlePrismaError } from "@/lib/errors";
import { STATUS_CODES } from "@/constants/status-codes";
import { ProjectService } from "./project.service";
import { SchemaService } from "./schema.service";
import { endpointRepository as endpointRepo } from "@/lib/repositories";
import { projectService as projectSvc } from "./project.service";
import { schemaService as schemaSvc } from "./schema.service";

export class EndpointService {
  constructor(
    private readonly endpointRepository: EndpointRepository = endpointRepo,
    private readonly projectService: ProjectService = projectSvc,
    private readonly schemaService: SchemaService = schemaSvc
  ) {}

  /**
   * Get endpoints for a project with ownership validation
   */
  async getProjectEndpoints(
    projectId: string,
    userId: string
  ): Promise<IEndpoint[]> {
    try {
      // Verify project ownership
      const hasAccess = await this.projectService.verifyProjectOwnership(
        projectId,
        userId
      );
      if (!hasAccess) {
        throw new AppError(
          "Project not found or access denied",
          STATUS_CODES.NOT_FOUND,
          ERROR_CODES.NOT_FOUND
        );
      }

      return await this.endpointRepository.findByProjectId(projectId);
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Get all endpoints for user's projects
   */
  async getUserEndpoints(userId: string): Promise<IEndpoint[]> {
    try {
      const userProjects = await this.projectService.getUserProjects(userId);
      const projectIds = userProjects.map((p) => p.id);

      if (projectIds.length === 0) {
        return [];
      }

      return await this.endpointRepository.findByProjectIds(projectIds);
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Get a specific endpoint with ownership validation
   */
  async getEndpoint(
    endpointId: string,
    userId: string
  ): Promise<IEndpoint> {
    try {
      const endpoint = await this.endpointRepository.findById(endpointId);

      if (!endpoint) {
        throw new AppError(
          "Endpoint not found",
          STATUS_CODES.NOT_FOUND,
          ERROR_CODES.NOT_FOUND
        );
      }

      // Verify project ownership
      const hasAccess = await this.projectService.verifyProjectOwnership(
        endpoint.projectId,
        userId
      );
      if (!hasAccess) {
        throw new AppError(
          "Access denied",
          STATUS_CODES.FORBIDDEN,
          ERROR_CODES.AUTH_ERROR
        );
      }

      return endpoint;
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Create a new endpoint with project ownership validation
   */
  async createEndpoint(
    data: Omit<IEndpoint, "id" | "updatedAt" | "createdAt">,
    userId: string
  ): Promise<IEndpoint> {
    try {
      // Verify project ownership
      await this.projectService.verifyProjectOwnership(data.projectId, userId);

      return await this.endpointRepository.createEndpoint(data);
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Update an endpoint with ownership validation
   */
  async updateEndpoint(
    endpointId: string,
    data: Partial<IEndpoint>,
    userId: string
  ): Promise<IEndpoint> {
    try {
      // Verify ownership first
      await this.getEndpoint(endpointId, userId);

      return await this.endpointRepository.updateEndpoint(endpointId, data);
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Delete an endpoint with ownership validation
   */
  async deleteEndpoint(
    endpointId: string,
    userId: string
  ): Promise<void> {
    try {
      // Verify ownership first
      await this.getEndpoint(endpointId, userId);

      await this.endpointRepository.delete({ id: endpointId });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Create multiple endpoints from schema (CRUD operations)
   */
  async createEndpointsBySchema(
    data: {
      schemaId: number;
      basePath: string;
      responseWrapperId?: number;
      projectId: string;
    },
    userId: string
  ): Promise<IEndpoint[]> {
    try {
      // Verify project ownership
      const hasAccess = await this.projectService.verifyProjectOwnership(
        data.projectId,
        userId
      );
      if (!hasAccess) {
        throw new AppError(
          "Project not found or access denied",
          STATUS_CODES.NOT_FOUND,
          ERROR_CODES.NOT_FOUND
        );
      }

      if (!this.schemaService) {
        throw new AppError(
          "Schema service not available",
          STATUS_CODES.INTERNAL_SERVER_ERROR,
          ERROR_CODES.INTERNAL_ERROR
        );
      }

      const { schemaId, basePath, responseWrapperId, projectId } = data;

      // Create all CRUD endpoints
      const endpoints: IEndpoint[] = [];

      const endpointConfigs: Array<{
        description: string;
        method: EHttpMethod;
        path: string;
        isDataList: boolean;
        numberOfData: number | null;
      }> = [
        {
          description: `GET ${basePath}`,
          method: EHttpMethod.GET,
          path: basePath,
          isDataList: true,
          numberOfData: 3,
        },
        {
          description: `GET ${basePath}/:id`,
          method: EHttpMethod.GET,
          path: `${basePath}/:id`,
          isDataList: false,
          numberOfData: null,
        },
        {
          description: `POST ${basePath}`,
          method: EHttpMethod.POST,
          path: basePath,
          isDataList: false,
          numberOfData: null,
        },
        {
          description: `PUT ${basePath}/:id`,
          method: EHttpMethod.PUT,
          path: `${basePath}/:id`,
          isDataList: false,
          numberOfData: null,
        },
        {
          description: `DELETE ${basePath}/:id`,
          method: EHttpMethod.DELETE,
          path: `${basePath}/:id`,
          isDataList: false,
          numberOfData: null,
        },
      ];

      for (const config of endpointConfigs) {
        // Get schema and generate static response for each endpoint
        const schema = await this.schemaService.getSchema(schemaId, userId);
        const generatedResponse = this.schemaService.generateResponseFromSchema(
          schema,
          config.isDataList || false,
          config.numberOfData || undefined
        );

        const endpoint = await this.createEndpoint({
          ...config,
          schemaId,
          staticResponse: generatedResponse,
          responseWrapperId,
          projectId,
        }, userId);
        endpoints.push(endpoint);
      }

      return endpoints;
    } catch (error) {
      throw handlePrismaError(error);
    }
  }
}

// Export singleton instance
export const endpointService = new EndpointService();
