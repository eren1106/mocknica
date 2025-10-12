import prisma from "@/lib/db";
import { Endpoint as EndpointPrisma } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { PrismaIncludes, EndpointWithRelations } from "./helpers/prisma-includes";

export class EndpointData {
  static async createEndpoint(data: Omit<EndpointPrisma, "id" | "updatedAt" | "createdAt">): Promise<EndpointPrisma> {
    const { schemaId, responseWrapperId, staticResponse, projectId, ...restData } = data;
    
    return prisma.endpoint.create({
      data: {
        ...restData,
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
  }

  static async getEndpoints({
    where,
  }: { where?: Prisma.EndpointWhereInput } = {}): Promise<EndpointWithRelations[]> {
    return prisma.endpoint.findMany({
      where,
      ...PrismaIncludes.endpointInclude,
      orderBy: {
        path: "asc",
      },
    });
  }

  static async getEndpointById(id: string): Promise<EndpointWithRelations | null> {
    return prisma.endpoint.findUnique({
      where: {
        id,
      },
      ...PrismaIncludes.endpointInclude,
    });
  }

  static async updateEndpoint(
    id: string,
    data: Partial<EndpointPrisma>
  ): Promise<EndpointPrisma> {
    const { schemaId, responseWrapperId, staticResponse, projectId, ...restData } = data;
    
    return prisma.endpoint.update({
      where: {
        id,
      },
      data: {
        ...restData,
        ...(schemaId ? { schema: { connect: { id: schemaId } } } : {schema: { disconnect: true }}),
        ...(responseWrapperId ? { responseWrapper: { connect: { id: responseWrapperId } } } : {responseWrapper: { disconnect: true }}),
        staticResponse: staticResponse === null 
        ? Prisma.JsonNull 
        : staticResponse as Prisma.InputJsonValue,
      },
    });
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
