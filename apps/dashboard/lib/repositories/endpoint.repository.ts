import { Prisma, Endpoint, Schema, SchemaField, ResponseWrapper } from "@prisma/client";
import { BaseRepository } from "./base.repository";
import prisma from "../db";

// Define the Prisma entity type with relations
type EndpointWithRelations = Endpoint & {
  schema?: (Schema & { fields: SchemaField[] }) | null;
  responseWrapper?: ResponseWrapper | null;
};

export class EndpointRepository extends BaseRepository<
  EndpointWithRelations,
  Prisma.EndpointCreateInput,
  Prisma.EndpointCreateManyInput,
  Prisma.EndpointUpdateInput,
  Prisma.EndpointWhereInput,
  Prisma.EndpointWhereUniqueInput
> {
  protected delegate = prisma.endpoint;

  /**
   * Find endpoints by project ID
   */
  async findByProjectId(projectId: string, options?: { select?: Prisma.EndpointSelect; include?: Prisma.EndpointInclude }): Promise<EndpointWithRelations[]> {
    return this.findMany({
      where: { projectId },
      ...options,
      orderBy: { path: "asc" },
    });
  }

  /**
   * Find endpoints by multiple project IDs
   */
  async findByProjectIds(projectIds: string[], options?: { select?: Prisma.EndpointSelect; include?: Prisma.EndpointInclude }): Promise<EndpointWithRelations[]> {
    return this.findMany({
      where: { projectId: { in: projectIds } },
      ...options,
      orderBy: { path: "asc" },
    });
  }
}

export const endpointRepository = new EndpointRepository();
