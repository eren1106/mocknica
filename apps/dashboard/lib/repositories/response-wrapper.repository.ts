import { Prisma, ResponseWrapper } from "@prisma/client";
import { BaseRepository } from "./base.repository";
import prisma from "../db";

export class ResponseWrapperRepository extends BaseRepository<
  ResponseWrapper,
  Prisma.ResponseWrapperCreateInput,
  Prisma.ResponseWrapperCreateManyInput,
  Prisma.ResponseWrapperUpdateInput,
  Prisma.ResponseWrapperWhereInput,
  Prisma.ResponseWrapperWhereUniqueInput
> {
  protected delegate = prisma.responseWrapper;

  /**
   * Find response wrappers by project ID
   */
  async findByProjectId(projectId: string, options?: { select?: Prisma.ResponseWrapperSelect; include?: Prisma.ResponseWrapperInclude }): Promise<ResponseWrapper[]> {
    return this.findMany({
      where: { projectId },
      ...options,
      orderBy: { createdAt: "asc" },
    });
  }

  /**
   * Find response wrappers by multiple project IDs
   */
  async findByProjectIds(projectIds: string[], options?: { select?: Prisma.ResponseWrapperSelect; include?: Prisma.ResponseWrapperInclude }): Promise<ResponseWrapper[]> {
    return this.findMany({
      where: { projectId: { in: projectIds } },
      ...options,
      orderBy: { createdAt: "asc" },
    });
  }
}

export const responseWrapperRepository = new ResponseWrapperRepository();