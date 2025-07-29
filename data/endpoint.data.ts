import prisma from "@/lib/db";
import { Endpoint } from "@/models/endpoint.model";
import { Endpoint as EndpointPrisma } from "@prisma/client";
import { Prisma } from "@prisma/client";

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
  }: { where?: Prisma.EndpointWhereInput } = {}): Promise<Endpoint[]> {
    return prisma.endpoint.findMany({
      where,
      include: {
        schema: {
          include: {
            fields: {
              include: {
                objectSchema: {
                  include: {
                    fields: true,
                  },
                },
                arrayType: {
                  include: {
                    objectSchema: {
                      include: {
                        fields: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responseWrapper: true,
      },
      orderBy: {
        path: "asc",
      },
    });
  }

  static async getEndpointById(id: string): Promise<Endpoint | null> {
    return prisma.endpoint.findUnique({
      where: {
        id,
      },
      include: {
        schema: {
          include: {
            fields: {
              include: {
                objectSchema: {
                  include: {
                    fields: true,
                  },
                },
                arrayType: {
                  include: {
                    objectSchema: {
                      include: {
                        fields: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responseWrapper: true,
      },
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
        ...(schemaId && { schema: { connect: { id: schemaId } } }),
        ...(responseWrapperId && {
          responseWrapper: {
            connect: { id: responseWrapperId },
          },
        }),
        ...(projectId && { project: { connect: { id: projectId } } }),
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
}
