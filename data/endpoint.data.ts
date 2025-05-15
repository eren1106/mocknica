import prisma from "@/lib/db";
import { Endpoint } from "@/models/endpoint.model";
import { Endpoint as EndpointPrisma } from "@prisma/client";
import { Prisma } from "@prisma/client";

export class EndpointData {
  static async createEndpoint(
    data: Prisma.EndpointCreateInput
  ): Promise<EndpointPrisma> {
    return prisma.endpoint.create({
      data,
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
    data: Prisma.EndpointUpdateInput,
  ): Promise<EndpointPrisma> {
    return prisma.endpoint.update({
      where: {
        id,
      },
      data,
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
