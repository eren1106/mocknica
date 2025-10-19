import { Prisma, Project } from "@prisma/client";
import { IProject, IProjectLight } from "@/types";
import { PrismaIncludes } from "./prisma-includes";
import { mapProject, mapProjectLight } from "./type-mappers";
import { ProjectSchemaType } from "@/zod-schemas/project.schema";
import { generateApiToken } from "@/lib/utils";
import { BaseRepository } from "./base.repository";

export class ProjectRepository extends BaseRepository<
  IProject,
  Prisma.ProjectCreateInput,
  Prisma.ProjectUpdateInput,
  Prisma.ProjectWhereInput,
  Prisma.ProjectWhereUniqueInput,
  typeof PrismaIncludes.projectInclude.include,
  Prisma.ProjectOrderByWithRelationInput
> {
  constructor() {
    super("Project");
  }

  protected mapToDomain(entity: any): IProject {
    return mapProject(entity);
  }

  protected getDefaultInclude() {
    return PrismaIncludes.projectInclude.include;
  }

  protected getDefaultOrderBy() {
    return { name: "asc" } as const;
  }
  /**
   * Create a new project
   */
  async createProject(
    data: ProjectSchemaType & { userId: string }
  ): Promise<IProject> {
    const projectData: Prisma.ProjectCreateInput = {
      name: data.name,
      description: data.description,
      isNeedToken: data.isNeedToken || false,
      user: { connect: { id: data.userId } },
      token: data.isNeedToken ? generateApiToken() : undefined,
    };

    return await this.create(projectData);
  }

  /**
   * Find a project by ID with full relations
   */
  async findById(id: string): Promise<IProject | null> {
    return await this.findUnique({ id });
  }

  /**
   * Find all projects (light version for list views)
   */
  async findManyLight(where?: Prisma.ProjectWhereInput): Promise<IProjectLight[]> {
    const entities = await this.prisma.project.findMany({
      where,
      ...PrismaIncludes.projectLightInclude,
      orderBy: { name: "asc" },
    });
    
    return entities.map(mapProjectLight);
  }

  /**
   * Find projects by user ID (light version)
   */
  async findByUserId(userId: string): Promise<IProjectLight[]> {
    return await this.findManyLight({ userId });
  }

  /**
   * Find a project by ID and user ID
   */
  async findByIdAndUserId(id: string, userId: string): Promise<IProject | null> {
    return await this.findFirst({ id, userId });
  }

  /**
   * Update a project with token logic
   */
  async updateProject(
    id: string,
    data: Partial<ProjectSchemaType>
  ): Promise<IProject> {
    // Get current project to check if we need to generate/remove token
    const currentProject = await this.prisma.project.findUnique({
      where: { id },
      select: { token: true, isNeedToken: true },
    });

    const updateData: Prisma.ProjectUpdateInput = {
      ...data,
      token: data.isNeedToken ? (currentProject?.token || generateApiToken()) : null,
    };

    return await this.update({ id }, updateData);
  }

  /**
   * Check if a project exists and belongs to a user
   */
  async existsByIdAndUserId(id: string, userId: string): Promise<boolean> {
    return await this.exists({ id, userId });
  }

  /**
   * Get project ownership info (lightweight query)
   */
  async getOwnership(id: string, userId: string): Promise<{ id: string } | null> {
    return this.prisma.project.findFirst({
      where: { id, userId },
      select: { id: true },
    });
  }
}

export const projectRepository = new ProjectRepository();
