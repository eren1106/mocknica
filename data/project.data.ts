import prisma from "@/lib/db";
import { Project } from "@/models/project.model";
import { ProjectSchemaType } from "@/zod-schemas/project.schema";
import { generateApiToken } from "@/lib/utils";

export class ProjectData {
  static async createProject(
    data: ProjectSchemaType & { userId: string }
  ): Promise<Project> {
    const projectData = {
      name: data.name,
      description: data.description,
      permission: data.permission,
      isNeedToken: data.isNeedToken || false,
      userId: data.userId,
      token: data.isNeedToken ? generateApiToken() : undefined,
    };

    return prisma.project.create({
      data: projectData,
      include: {
        user: true,
        endpoints: true,
        schemas: true,
        responseWrappers: true,
      },
    });
  }

  static async getProject(id: string): Promise<Project | null> {
    return prisma.project.findUnique({
      where: { id },
      include: {
        user: true,
        endpoints: {
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
        },
        schemas: {
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
        responseWrappers: true,
      },
    });
  }

  static async getAllProjects(userId?: string): Promise<Project[]> {
    return prisma.project.findMany({
      where: userId ? { userId } : undefined,
      include: {
        user: true,
        endpoints: true,
        schemas: true,
        responseWrappers: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  static async getUserProjects(userId: string): Promise<Project[]> {
    return prisma.project.findMany({
      where: { userId },
      include: {
        user: true,
        endpoints: true,
        schemas: true,
        responseWrappers: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  static async updateProject(
    id: string,
    data: Partial<ProjectSchemaType>
  ): Promise<Project> {
    // Get current project to check if we need to generate/remove token
    const currentProject = await prisma.project.findUnique({
      where: { id },
      select: { token: true, isNeedToken: true },
    });

    const updateData = {
      ...data,
      token: data.isNeedToken ? (currentProject?.token || generateApiToken()) : null,
    };

    return prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
        endpoints: true,
        schemas: true,
        responseWrappers: true,
      },
    });
  }

  static async deleteProject(id: string): Promise<void> {
    await prisma.project.delete({
      where: { id },
    });
  }
}
