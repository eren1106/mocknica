import { IEndpoint } from "@/types";
import { EndpointRepository, ProjectRepository, SchemaRepository } from "@/lib/repositories";
import { PrismaIncludes } from "@/lib/repositories/prisma-includes";
import { AppError, ERROR_CODES, handlePrismaError } from "@/lib/errors";
import { STATUS_CODES } from "@/constants/status-codes";
import { endpointRepository as endpointRepo, projectRepository as projectRepo, schemaRepository as schemaRepo } from "@/lib/repositories";
import { Prisma, HttpMethod } from "@prisma/client";
import { SchemaService } from "@/services/schema.service";

export class EndpointService {
  constructor(
    private readonly endpointRepository: EndpointRepository = endpointRepo,
    private readonly projectRepository: ProjectRepository = projectRepo,
    private readonly schemaRepository: SchemaRepository = schemaRepo
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
      const hasAccess = await this.projectRepository.existsByIdAndUserId(projectId, userId);
      if (!hasAccess) {
        throw new AppError(
          "Project not found or access denied",
          STATUS_CODES.NOT_FOUND,
          ERROR_CODES.NOT_FOUND
        );
      }

      const entities = await this.endpointRepository.findByProjectId(projectId, PrismaIncludes.endpointInclude);
      return entities;
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Get all endpoints for user's projects
   */
  async getUserEndpoints(userId: string): Promise<IEndpoint[]> {
    try {
      const userProjects = await this.projectRepository.findByUserId(userId, { select: { id: true } });
      const projectIds = userProjects.map((p) => p.id);

      if (projectIds.length === 0) {
        return [];
      }

      const entities = await this.endpointRepository.findByProjectIds(projectIds, PrismaIncludes.endpointInclude);
      return entities;
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
      const endpoint = await this.endpointRepository.findById(endpointId, PrismaIncludes.endpointInclude);

      if (!endpoint) {
        throw new AppError(
          "Endpoint not found",
          STATUS_CODES.NOT_FOUND,
          ERROR_CODES.NOT_FOUND
        );
      }

      // Verify project ownership
      const hasAccess = await this.projectRepository.existsByIdAndUserId(endpoint.projectId, userId);
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
      const hasAccess = await this.projectRepository.existsByIdAndUserId(data.projectId, userId);
      if (!hasAccess) {
        throw new AppError(
          "Project not found or access denied",
          STATUS_CODES.NOT_FOUND,
          ERROR_CODES.NOT_FOUND
        );
      }

      // Business logic: convert domain type to Prisma input
      // CRITICAL FIX: Handle undefined staticResponse
      // Prisma requires staticResponse to always be present (not undefined)
      // If undefined, we need to explicitly set it to JsonNull or a valid value
      let staticResponseValue: Prisma.InputJsonValue | Prisma.NullTypes.JsonNull;
      if (data.staticResponse === null || data.staticResponse === undefined) {
        staticResponseValue = Prisma.JsonNull;
        // TODO: REMOVE LOG
        console.log("⚠️ [Endpoint Service] staticResponse is null/undefined, using Prisma.JsonNull");
      } else {
        staticResponseValue = data.staticResponse as Prisma.InputJsonValue;
        // TODO: REMOVE LOG
        console.log("✅ [Endpoint Service] staticResponse has value:", staticResponseValue);
      }

      const endpointData: Prisma.EndpointCreateInput = {
        path: data.path,
        method: data.method as any, // Prisma HttpMethod enum
        description: data.description,
        isDataList: data.isDataList ?? null,
        numberOfData: data.numberOfData ?? null,
        staticResponse: staticResponseValue,
        project: { connect: { id: data.projectId } },
        ...(data.schemaId && { schema: { connect: { id: data.schemaId } } }),
        ...(data.responseWrapperId && { responseWrapper: { connect: { id: data.responseWrapperId } } }),
      };

      const entity = await this.endpointRepository.create(endpointData);
      
      if (!entity) {
        throw new AppError("Failed to create endpoint", STATUS_CODES.INTERNAL_SERVER_ERROR, ERROR_CODES.INTERNAL_ERROR);
      }

      return entity;
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Create multiple endpoints based on a schema (CRUD operations)
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
      const hasAccess = await this.projectRepository.existsByIdAndUserId(data.projectId, userId);
      if (!hasAccess) {
        throw new AppError(
          "Project not found or access denied",
          STATUS_CODES.NOT_FOUND,
          ERROR_CODES.NOT_FOUND
        );
      }

      // Verify schema exists and belongs to the project
      const schema = await this.schemaRepository.findById(data.schemaId, PrismaIncludes.schemaInclude);
      if (!schema || schema.projectId !== data.projectId) {
        throw new AppError(
          "Schema not found or does not belong to this project",
          STATUS_CODES.NOT_FOUND,
          ERROR_CODES.NOT_FOUND
        );
      }

      // Create CRUD endpoints
      const basePath = data.basePath.startsWith('/') ? data.basePath : `/${data.basePath}`;
      const singleResponse = SchemaService.generateResponseFromSchema(schema, false, 1);
      const listResponse = SchemaService.generateResponseFromSchema(schema, true, 3);
      const endpoints: Prisma.EndpointCreateInput[] = [
        {
          path: basePath,
          method: HttpMethod.GET,
          description: `Get all ${schema.name}`,
          isDataList: true,
          numberOfData: 3,
          staticResponse: listResponse,
          project: { connect: { id: data.projectId } },
          schema: { connect: { id: data.schemaId } },
          ...(data.responseWrapperId && { responseWrapper: { connect: { id: data.responseWrapperId } } }),
        },
        {
          path: `${basePath}/:id`,
          method: HttpMethod.GET,
          description: `Get ${schema.name} by ID`,
          isDataList: false,
          staticResponse: singleResponse,
          project: { connect: { id: data.projectId } },
          schema: { connect: { id: data.schemaId } },
          ...(data.responseWrapperId && { responseWrapper: { connect: { id: data.responseWrapperId } } }),
        },
        {
          path: basePath,
          method: HttpMethod.POST,
          description: `Create new ${schema.name}`,
          isDataList: false,
          staticResponse: singleResponse,
          project: { connect: { id: data.projectId } },
          schema: { connect: { id: data.schemaId } },
          ...(data.responseWrapperId && { responseWrapper: { connect: { id: data.responseWrapperId } } }),
        },
        {
          path: `${basePath}/:id`,
          method: HttpMethod.PUT,
          description: `Update ${schema.name}`,
          isDataList: false,
          staticResponse: singleResponse,
          project: { connect: { id: data.projectId } },
          schema: { connect: { id: data.schemaId } },
          ...(data.responseWrapperId && { responseWrapper: { connect: { id: data.responseWrapperId } } }),
        },
        {
          path: `${basePath}/:id`,
          method: HttpMethod.DELETE,
          description: `Delete ${schema.name}`,
          isDataList: false,
          staticResponse: singleResponse,
          project: { connect: { id: data.projectId } },
          schema: { connect: { id: data.schemaId } },
          ...(data.responseWrapperId && { responseWrapper: { connect: { id: data.responseWrapperId } } }),
        },
      ];

      // Create all endpoints
      const createdEndpoints: IEndpoint[] = [];
      for (const endpointData of endpoints) {
        const entity = await this.endpointRepository.create(endpointData);
        
        if (entity) {
          createdEndpoints.push(entity);
        }
      }

      return createdEndpoints;
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

      // Business logic: convert domain type to Prisma input
      const updateData: Prisma.EndpointUpdateInput = {
        ...(data.path !== undefined && { path: data.path }),
        ...(data.method !== undefined && { method: data.method as any }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.isDataList !== undefined && { isDataList: data.isDataList ?? null }),
        ...(data.numberOfData !== undefined && { numberOfData: data.numberOfData ?? null }),
        ...(data.staticResponse !== undefined && { 
          staticResponse: data.staticResponse === null ? Prisma.JsonNull : (data.staticResponse as Prisma.InputJsonValue) 
        }),
        ...(data.schemaId !== undefined && (data.schemaId ? { schema: { connect: { id: data.schemaId } } } : { schema: { disconnect: true } })),
        ...(data.responseWrapperId !== undefined && (data.responseWrapperId ? { responseWrapper: { connect: { id: data.responseWrapperId } } } : { responseWrapper: { disconnect: true } })),
      };

      const entity = await this.endpointRepository.update(endpointId, updateData);
      
      if (!entity) {
        throw new AppError("Failed to update endpoint", STATUS_CODES.INTERNAL_SERVER_ERROR, ERROR_CODES.INTERNAL_ERROR);
      }

      return entity;
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

      await this.endpointRepository.delete(endpointId);
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Bulk create endpoints
   */
  async bulkCreateEndpoints(
    endpointsData: Array<{
      path: string;
      method: any; // Will be cast to HttpMethod
      description: string;
      projectId: string;
      schemaId?: number;
      responseWrapperId?: number;
      staticResponse?: any;
      numberOfData?: number | null;
      isDataList?: boolean | null;
    }>,
    userId: string
  ): Promise<IEndpoint[]> {
    try {
      // Verify all endpoints belong to projects owned by the user
      const projectIds = [...new Set(endpointsData.map(e => e.projectId))];
      
      for (const projectId of projectIds) {
        const hasAccess = await this.projectRepository.existsByIdAndUserId(projectId, userId);
        if (!hasAccess) {
          throw new AppError(
            "Project not found or access denied",
            STATUS_CODES.NOT_FOUND,
            ERROR_CODES.NOT_FOUND
          );
        }
      }

      // Create all endpoints
      const createdEndpoints: IEndpoint[] = [];

      for (const endpointData of endpointsData) {
        const created = await this.createEndpoint(endpointData as any, userId);
        createdEndpoints.push(created);
      }

      return createdEndpoints;
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

}

// Export singleton instance
export const endpointService = new EndpointService();
