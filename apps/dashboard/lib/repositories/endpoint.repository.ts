import { Prisma } from "@prisma/client";
import { IEndpoint } from "@/types";
import { PrismaIncludes } from "./prisma-includes";
import { mapEndpoint } from "./type-mappers";
import { BaseRepository } from "./base.repository";

export class EndpointRepository extends BaseRepository<
  IEndpoint,
  Prisma.EndpointCreateInput,
  Prisma.EndpointUpdateInput,
  Prisma.EndpointWhereInput,
  Prisma.EndpointWhereUniqueInput,
  typeof PrismaIncludes.endpointInclude.include,
  Prisma.EndpointOrderByWithRelationInput
> {
  constructor() {
    super("Endpoint");
  }

  protected mapToDomain(entity: any): IEndpoint {
    return mapEndpoint(entity);
  }

  protected getDefaultInclude() {
    return PrismaIncludes.endpointInclude.include;
  }

  protected getDefaultOrderBy() {
    return { path: "asc" } as const;
  }
  /**
   * Create a new endpoint
   */
  async createEndpoint(data: Omit<IEndpoint, "id" | "updatedAt" | "createdAt">): Promise<IEndpoint> {
    const { schemaId, responseWrapperId, staticResponse, projectId, method, schema, responseWrapper, isDataList, numberOfData, ...restData } = data;
    
    const endpointData: Prisma.EndpointCreateInput = {
      ...restData,
      method: method as any, // Prisma expects its own HttpMethod enum
      isDataList,
      numberOfData,
      ...(schemaId && { schema: { connect: { id: schemaId } } }),
      ...(responseWrapperId && {
        responseWrapper: {
          connect: { id: responseWrapperId },
        },
      }),
      project: { connect: { id: projectId } },
      staticResponse: staticResponse === null 
        ? Prisma.JsonNull 
        : staticResponse as Prisma.InputJsonValue,
    };
    
    return await this.create(endpointData);
  }

  /**
   * Find endpoints by project ID
   */
  async findByProjectId(projectId: string): Promise<IEndpoint[]> {
    return await this.findMany({ projectId });
  }

  /**
   * Find endpoints by multiple project IDs
   */
  async findByProjectIds(projectIds: string[]): Promise<IEndpoint[]> {
    return await this.findMany({ projectId: { in: projectIds } });
  }

  /**
   * Find an endpoint by ID
   */
  async findById(id: string): Promise<IEndpoint | null> {
    return await this.findUnique({ id });
  }

  /**
   * Update an endpoint
   */
  async updateEndpoint(
    id: string,
    data: Partial<IEndpoint>
  ): Promise<IEndpoint> {
    const { schemaId, responseWrapperId, staticResponse, projectId, method, schema, responseWrapper, isDataList, numberOfData, ...restData } = data;
    
    const updateData: Prisma.EndpointUpdateInput = {
      ...restData,
      ...(method && { method: method as any }), // Prisma expects its own HttpMethod enum
      ...(isDataList !== undefined && { isDataList: isDataList ?? false }), // Convert null to false for Prisma
      ...(numberOfData !== undefined && { numberOfData: numberOfData ?? undefined }), // Convert null to undefined for Prisma
      ...(schemaId ? { schema: { connect: { id: schemaId } } } : {schema: { disconnect: true }}),
      ...(responseWrapperId ? { responseWrapper: { connect: { id: responseWrapperId } } } : {responseWrapper: { disconnect: true }}),
      staticResponse: staticResponse === null 
        ? Prisma.JsonNull 
        : staticResponse as Prisma.InputJsonValue,
    };
    
    return await this.update({ id }, updateData);
  }

  /**
   * Get endpoint ownership info (lightweight query)
   */
  async getOwnership(id: string): Promise<{ id: string; projectId: string } | null> {
    return this.prisma.endpoint.findUnique({
      where: { id },
      select: { id: true, projectId: true },
    });
  }
}
