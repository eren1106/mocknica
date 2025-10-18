import prisma from "@/lib/db";
import { ProjectSchemaType } from "@/zod-schemas/project.schema";
import { generateApiToken } from "@/lib/utils";
import { PrismaIncludes, ProjectWithRelations, ProjectLight } from "./helpers/prisma-includes";
import { mapProject, mapProjectLight } from "./helpers/type-mappers";

export class ProjectData {
  static async createProject(
    data: ProjectSchemaType & { userId: string }
  ): Promise<ProjectWithRelations> {
    const projectData = {
      name: data.name,
      description: data.description,
      // permission: data.permission,
      isNeedToken: data.isNeedToken || false,
      userId: data.userId,
      token: data.isNeedToken ? generateApiToken() : undefined,
    };

    const project = await prisma.project.create({
      data: projectData,
      ...PrismaIncludes.projectInclude,
    });
    
    return mapProject(project);
  }

  static async getProject(id: string): Promise<ProjectWithRelations | null> {
    const project = await prisma.project.findUnique({
      where: { id },
      ...PrismaIncludes.projectInclude,
    });
    
    return project ? mapProject(project) : null;
  }

  static async getAllProjects(userId?: string): Promise<ProjectLight[]> {
    const projects = await prisma.project.findMany({
      where: userId ? { userId } : undefined,
      ...PrismaIncludes.projectLightInclude,
      orderBy: {
        name: "asc",
      },
    });
    
    return projects.map(mapProjectLight);
  }

  static async getUserProjects(userId: string): Promise<ProjectLight[]> {
    const projects = await prisma.project.findMany({
      where: { userId },
      ...PrismaIncludes.projectLightInclude,
      orderBy: {
        name: "asc",
      },
    });
    
    return projects.map(mapProjectLight);
  }

  static async getProjectByUserAndId(id: string, userId: string): Promise<ProjectWithRelations | null> {
    const project = await prisma.project.findFirst({
      where: { 
        id,
        userId 
      },
      ...PrismaIncludes.projectInclude,
    });
    
    return project ? mapProject(project) : null;
  }

  static async updateProject(
    id: string,
    data: Partial<ProjectSchemaType>
  ): Promise<ProjectWithRelations> {
    // Get current project to check if we need to generate/remove token
    const currentProject = await prisma.project.findUnique({
      where: { id },
      select: { token: true, isNeedToken: true },
    });

    const updateData = {
      ...data,
      token: data.isNeedToken ? (currentProject?.token || generateApiToken()) : null,
    };

    const project = await prisma.project.update({
      where: { id },
      data: updateData,
      ...PrismaIncludes.projectInclude,
    });
    
    return mapProject(project);
  }

  static async deleteProject(id: string): Promise<void> {
    await prisma.project.delete({
      where: { id },
    });
  }

  // Light version for ownership checks
  static async getProjectOwnership(id: string, userId: string): Promise<{ id: string } | null> {
    return prisma.project.findFirst({
      where: { id, userId },
      select: { id: true },
    });
  }
}
