import prisma from "@/lib/db";
import { Endpoint } from "@/models/endpoint.model";
import { Prisma } from "@prisma/client";

export class EndpointData {
  static async createEndpoint(data: {
    name: string;
    description?: string;
    method: string;
    path: string;
    responseGen: string;
    staticResponse?: string | null;
    schemaId?: number | null;
  }): Promise<Partial<Endpoint>> {
    return prisma.endpoint.create({
      data: {
        name: data.name,
        description: data.description,
        method: data.method as any,
        path: data.path,
        responseGen: data.responseGen as any,
        staticResponse: data.staticResponse
          ? (JSON.parse(data.staticResponse) as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        ...(data.schemaId && { schema: { connect: { id: data.schemaId } } }),
      },
    });
  }

  static async getEndpoints({where}: {where?: Prisma.EndpointWhereInput} = {}): Promise<Endpoint[]> {
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
      },
    });
  }
}
