import { EndpointData } from "@/data/endpoint.data";
import { Endpoint } from "@/models/endpoint.model";
import { Endpoint as EndpointPrisma } from "@prisma/client";
import { AppError, handlePrismaError } from "@/data/helpers/error-handler";
import { STATUS_CODES } from "@/constants/status-codes";
import { ProjectService } from "./project.service";
import { HttpMethod } from "@prisma/client";

export class EndpointService {
  /**
   * Create a new endpoint with project ownership validation
   */
  static async createEndpoint(
    data: Omit<EndpointPrisma, "id" | "updatedAt" | "createdAt">,
    userId: string
  ): Promise<EndpointPrisma> {
    try {
      // Verify project ownership
      await ProjectService.verifyProjectOwnership(data.projectId, userId);
      
      return await EndpointData.createEndpoint(data);
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Get endpoints for a project with ownership validation
   */
  static async getProjectEndpoints(projectId: string, userId: string): Promise<Endpoint[]> {
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

      return await EndpointData.getEndpoints({ where: { projectId } });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Get all endpoints for user's projects
   */
  static async getUserEndpoints(userId: string): Promise<Endpoint[]> {
    try {
      const userProjects = await ProjectService.getUserProjects(userId);
      const projectIds = userProjects.map(p => p.id);
      
      if (projectIds.length === 0) {
        return [];
      }

      return await EndpointData.getEndpoints({ 
        where: { projectId: { in: projectIds } } 
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Get a specific endpoint with ownership validation
   */
  static async getEndpoint(endpointId: string, userId: string): Promise<Endpoint> {
    try {
      const endpoint = await EndpointData.getEndpointById(endpointId);
      
      if (!endpoint) {
        throw new AppError(
          "Endpoint not found",
          STATUS_CODES.NOT_FOUND,
          "NOT_FOUND" as any
        );
      }

      // Verify project ownership
      const hasAccess = await ProjectService.verifyProjectOwnership(endpoint.projectId, userId);
      if (!hasAccess) {
        throw new AppError(
          "Access denied",
          STATUS_CODES.FORBIDDEN,
          "AUTH_ERROR" as any
        );
      }

      return endpoint;
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Update an endpoint with ownership validation
   */
  static async updateEndpoint(
    endpointId: string,
    data: Partial<EndpointPrisma>,
    userId: string
  ): Promise<EndpointPrisma> {
    try {
      // Verify ownership first
      await this.getEndpoint(endpointId, userId);
      
      return await EndpointData.updateEndpoint(endpointId, data);
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Delete an endpoint with ownership validation
   */
  static async deleteEndpoint(endpointId: string, userId: string): Promise<void> {
    try {
      // Verify ownership first
      await this.getEndpoint(endpointId, userId);
      
      await EndpointData.deleteEndpoint(endpointId);
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Create multiple endpoints from schema (CRUD operations)
   */
  static async createEndpointsBySchema(
    data: {
      schemaId: number;
      basePath: string;
      responseWrapperId?: number;
      projectId: string;
    },
    userId: string
  ): Promise<EndpointPrisma[]> {
    try {
      // Verify project ownership
      const hasAccess = await ProjectService.verifyProjectOwnership(data.projectId, userId);
      if (!hasAccess) {
        throw new AppError(
          "Project not found or access denied",
          STATUS_CODES.NOT_FOUND,
          "NOT_FOUND" as any
        );
      }

      const { schemaId, basePath, responseWrapperId, projectId } = data;

      // Create all CRUD endpoints
      const endpoints: EndpointPrisma[] = [];

      const endpointConfigs = [
        {
          name: `GET ${basePath}`,
          description: `GET ${basePath}`,
          method: HttpMethod.GET,
          path: basePath,
          isDataList: true,
          numberOfData: 3,
        },
        {
          name: `GET ${basePath}/:id`,
          description: `GET ${basePath}/:id`,
          method: HttpMethod.GET,
          path: `${basePath}/:id`,
          isDataList: false,
          numberOfData: null,
        },
        {
          name: `POST ${basePath}`,
          description: `POST ${basePath}`,
          method: HttpMethod.POST,
          path: basePath,
          isDataList: false,
          numberOfData: null,
        },
        {
          name: `PUT ${basePath}/:id`,
          description: `PUT ${basePath}/:id`,
          method: HttpMethod.PUT,
          path: `${basePath}/:id`,
          isDataList: false,
          numberOfData: null,
        },
        {
          name: `DELETE ${basePath}/:id`,
          description: `DELETE ${basePath}/:id`,
          method: HttpMethod.DELETE,
          path: `${basePath}/:id`,
          isDataList: false,
          numberOfData: null,
        },
      ];

      for (const config of endpointConfigs) {
        const endpoint = await EndpointData.createEndpoint({
          ...config,
          schemaId,
          staticResponse: null,
          responseWrapperId: responseWrapperId ?? null,
          projectId,
        });
        endpoints.push(endpoint);
      }

      return endpoints;
    } catch (error) {
      throw handlePrismaError(error);
    }
  }
}
