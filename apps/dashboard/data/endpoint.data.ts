import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";
import { PrismaIncludes, EndpointWithRelations } from "./helpers/prisma-includes";
import { IEndpoint } from "@/types";
import { mapEndpoint } from "./helpers/type-mappers";

export class EndpointData {
  static async createEndpoint(data: Omit<IEndpoint, "id" | "updatedAt" | "createdAt">): Promise<IEndpoint> {
    const { schemaId, responseWrapperId, staticResponse, projectId, method, schema, responseWrapper, isDataList, numberOfData, ...restData } = data;
    
    const endpoint = await prisma.endpoint.create({
      data: {
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
      },
    });
    
    return mapEndpoint(endpoint);
  }

  static async getEndpoints({
    where,
  }: { where?: Prisma.EndpointWhereInput } = {}): Promise<EndpointWithRelations[]> {
    const endpoints = await prisma.endpoint.findMany({
      where,
      ...PrismaIncludes.endpointInclude,
      orderBy: {
        path: "asc",
      },
    });
    
    return endpoints.map(mapEndpoint);
  }

  static async getEndpointById(id: string): Promise<EndpointWithRelations | null> {
    const endpoint = await prisma.endpoint.findUnique({
      where: {
        id,
      },
      ...PrismaIncludes.endpointInclude,
    });
    
    return endpoint ? mapEndpoint(endpoint) : null;
  }

  static async updateEndpoint(
    id: string,
    data: Partial<IEndpoint>
  ): Promise<IEndpoint> {
    const { schemaId, responseWrapperId, staticResponse, projectId, method, schema, responseWrapper, isDataList, numberOfData, ...restData } = data;
    
    const endpoint = await prisma.endpoint.update({
      where: {
        id,
      },
      data: {
        ...restData,
        ...(method && { method: method as any }), // Prisma expects its own HttpMethod enum
        ...(isDataList !== undefined && { isDataList: isDataList ?? false }), // Convert null to false for Prisma
        ...(numberOfData !== undefined && { numberOfData: numberOfData ?? undefined }), // Convert null to undefined for Prisma
        ...(schemaId ? { schema: { connect: { id: schemaId } } } : {schema: { disconnect: true }}),
        ...(responseWrapperId ? { responseWrapper: { connect: { id: responseWrapperId } } } : {responseWrapper: { disconnect: true }}),
        staticResponse: staticResponse === null 
        ? Prisma.JsonNull 
        : staticResponse as Prisma.InputJsonValue,
      },
    });
    
    return mapEndpoint(endpoint);
  }

  static async deleteEndpoint(id: string): Promise<void> {
    await prisma.endpoint.delete({
      where: {
        id,
      },
    });
  }

  // Light version for ownership checks
  static async getEndpointOwnership(id: string): Promise<{ id: string; projectId: string } | null> {
    return prisma.endpoint.findUnique({
      where: { id },
      select: { id: true, projectId: true },
    });
  }
}
