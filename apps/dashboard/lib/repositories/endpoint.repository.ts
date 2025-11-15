import { Prisma, Endpoint, Schema, ResponseWrapper } from "@prisma/client";
import { BaseRepository } from "./base.repository";
import prisma from "../db";
import { IEndpoint } from "@/types";
import { mapEndpoint } from "./type-mappers";

// Define the Prisma entity type with relations
type EndpointWithRelations = Endpoint & {
  schema?: Schema | null;
  responseWrapper?: ResponseWrapper | null;
};

export class EndpointRepository extends BaseRepository<
  EndpointWithRelations,
  Prisma.EndpointCreateInput,
  Prisma.EndpointCreateManyInput,
  Prisma.EndpointUpdateInput,
  Prisma.EndpointWhereInput,
  Prisma.EndpointWhereUniqueInput,
  IEndpoint // MappedType
> {
  protected delegate = prisma.endpoint;
  
  constructor() {
    super(mapEndpoint);
  }

  /**
   * Find endpoints by project ID
   */
  async findByProjectId(projectId: string, options?: { select?: Prisma.EndpointSelect; include?: Prisma.EndpointInclude }): Promise<IEndpoint[]> {
    return this.findMany({
      where: { projectId },
      ...options,
      orderBy: { path: "asc" },
    });
  }

  /**
   * Find endpoints by multiple project IDs
   */
  async findByProjectIds(projectIds: string[], options?: { select?: Prisma.EndpointSelect; include?: Prisma.EndpointInclude }): Promise<IEndpoint[]> {
    return this.findMany({
      where: { projectId: { in: projectIds } },
      ...options,
      orderBy: { path: "asc" },
    });
  }
}

export const endpointRepository = new EndpointRepository();
