import { Prisma, Project, User, Endpoint, Schema, ResponseWrapper } from "@prisma/client";
import { BaseRepository } from "./base.repository";
import prisma from "../db";
import { IProject } from "@/types";
import { mapProject } from "./type-mappers";

// Define the Prisma entity type with relations
type ProjectWithRelations = Project & {
  user?: User;
  endpoints?: (Endpoint & {
    schema?: Schema | null;
    responseWrapper?: ResponseWrapper | null;
  })[];
  schemas?: Schema[];
  responseWrappers?: ResponseWrapper[];
};

export class ProjectRepository extends BaseRepository<
  ProjectWithRelations,
  Prisma.ProjectCreateInput,
  Prisma.ProjectCreateManyInput,
  Prisma.ProjectUpdateInput,
  Prisma.ProjectWhereInput,
  Prisma.ProjectWhereUniqueInput,
  IProject // MappedType
> {
  protected delegate = prisma.project;
  
  constructor() {
    super(mapProject);
  }

  /**
   * Find projects by user ID
   */
  async findByUserId(userId: string, options?: { select?: Prisma.ProjectSelect; include?: Prisma.ProjectInclude }): Promise<IProject[]> {
    return this.findMany({
      where: { userId },
      ...options,
      orderBy: { name: "asc" },
    });
  }

  /**
   * Find a project by ID and user ID
   */
  async findByIdAndUserId(id: string, userId: string, options?: { select?: Prisma.ProjectSelect; include?: Prisma.ProjectInclude }): Promise<IProject | null> {
    return this.findFirst({
      where: { id, userId },
      ...options,
    });
  }

  /**
   * Check if a project exists and belongs to a user
   */
  async existsByIdAndUserId(id: string, userId: string): Promise<boolean> {
    return this.exists({ id, userId });
  }
}

export const projectRepository = new ProjectRepository();
