import prisma from "@/lib/db";
import { ResponseWrapper } from "@prisma/client";
import { ResponseWrapperSchemaType } from "@/zod-schemas/response-wrapper.schema";
import { WRAPPER_DATA_STR } from "@/constants";

export class ResponseWrapperData {
  static async createResponseWrapper(
    data: ResponseWrapperSchemaType,
    projectId: string
  ): Promise<ResponseWrapper> {
    console.log("JSONNN", data.json)
    return prisma.responseWrapper.create({
      data: {
        name: data.name,
        json: data.json ? JSON.parse(data.json.replaceAll(WRAPPER_DATA_STR, `"${WRAPPER_DATA_STR}"`)) : null,
        project: { connect: { id: projectId } },
      },
    });
  }

  static async getResponseWrappers(projectId?: string): Promise<ResponseWrapper[]> {
    return prisma.responseWrapper.findMany({
      where: projectId ? { projectId } : undefined,
      orderBy: { createdAt: 'asc' },
    });
  }

  static async getResponseWrappersByProjectIds(projectIds: string[]): Promise<ResponseWrapper[]> {
    return prisma.responseWrapper.findMany({
      where: { projectId: { in: projectIds } },
      orderBy: { createdAt: 'asc' },
    });
  }

  static async getResponseWrapperById(id: number): Promise<ResponseWrapper | null> {
    return prisma.responseWrapper.findUnique({
      where: { id },
    });
  }

  static async updateResponseWrapper(
    id: number,
    data: Partial<ResponseWrapperSchemaType>
  ): Promise<ResponseWrapper> {
    return prisma.responseWrapper.update({
      where: { id },
      data: {
        ...data,
        json: data.json ? JSON.parse(data.json.replaceAll(WRAPPER_DATA_STR, `"${WRAPPER_DATA_STR}"`)) : null,
      },
    });
  }

  static async deleteResponseWrapper(id: number): Promise<ResponseWrapper> {
    return prisma.responseWrapper.delete({
      where: { id },
    });
  }

  // Light version for ownership checks
  static async getResponseWrapperOwnership(id: number): Promise<{ id: number; projectId: string } | null> {
    const result = await prisma.responseWrapper.findUnique({
      where: { id },
      select: { id: true, projectId: true },
    });
    
    // Filter out null projectId cases
    if (!result || !result.projectId) {
      return null;
    }
    
    return { id: result.id, projectId: result.projectId };
  }
}
