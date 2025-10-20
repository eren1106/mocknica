import { Prisma, Project, User, Endpoint, Schema, SchemaField, ResponseWrapper } from "@prisma/client";
import { BaseRepository } from "./base.repository";
import prisma from "../db";

// Define the Prisma entity type with relations
type ProjectWithRelations = Project & {
  user?: User;
  endpoints?: (Endpoint & {
    schema?: (Schema & { fields: SchemaField[] }) | null;
    responseWrapper?: ResponseWrapper | null;
  })[];
  schemas?: (Schema & { fields: SchemaField[] })[];
  responseWrappers?: ResponseWrapper[];
};

export class ProjectRepository extends BaseRepository<
  ProjectWithRelations,
  Prisma.ProjectCreateInput,
  Prisma.ProjectCreateManyInput,
  Prisma.ProjectUpdateInput,
  Prisma.ProjectWhereInput,
  Prisma.ProjectWhereUniqueInput
> {
  protected delegate = prisma.project;

  /**
   * Find projects by user ID
   */
  async findByUserId(userId: string, options?: { select?: Prisma.ProjectSelect; include?: Prisma.ProjectInclude }): Promise<ProjectWithRelations[]> {
    return this.findMany({
      where: { userId },
      ...options,
      orderBy: { name: "asc" },
    });
  }

  /**
   * Find a project by ID and user ID
   */
  async findByIdAndUserId(id: string, userId: string, options?: { select?: Prisma.ProjectSelect; include?: Prisma.ProjectInclude }): Promise<ProjectWithRelations | null> {
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
