import prisma from '@/lib/db';
import { Project } from '@/models/project.model';
import { ProjectSchemaType } from '@/zod-schemas/project.schema';

export class ProjectData {
  static async createProject(
    data: ProjectSchemaType & { userId: string }
  ): Promise<Project> {
    return prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        permission: data.permission,
        userId: data.userId,
      },
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
    return prisma.project.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.permission && { permission: data.permission }),
      },
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
