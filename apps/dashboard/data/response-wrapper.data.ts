import prisma from "@/lib/db";
import { IResponseWrapper } from "@/types";
import { ResponseWrapperSchemaType } from "@/zod-schemas/response-wrapper.schema";
import { WRAPPER_DATA_STR } from "@/constants";
import { mapResponseWrapper } from "./helpers/type-mappers";

export class ResponseWrapperData {
  static async createResponseWrapper(
    data: ResponseWrapperSchemaType,
    projectId: string
  ): Promise<IResponseWrapper> {
    const wrapper = await prisma.responseWrapper.create({
      data: {
        name: data.name,
        json: data.json ? JSON.parse(data.json.replaceAll(WRAPPER_DATA_STR, `"${WRAPPER_DATA_STR}"`)) : null,
        project: { connect: { id: projectId } },
      },
    });
    
    return mapResponseWrapper(wrapper);
  }

  static async getResponseWrappers(projectId?: string): Promise<IResponseWrapper[]> {
    const wrappers = await prisma.responseWrapper.findMany({
      where: projectId ? { projectId } : undefined,
      orderBy: { createdAt: 'asc' },
    });
    
    return wrappers.map(mapResponseWrapper);
  }

  static async getResponseWrappersByProjectIds(projectIds: string[]): Promise<IResponseWrapper[]> {
    const wrappers = await prisma.responseWrapper.findMany({
      where: { projectId: { in: projectIds } },
      orderBy: { createdAt: 'asc' },
    });
    
    return wrappers.map(mapResponseWrapper);
  }

  static async getResponseWrapperById(id: number): Promise<IResponseWrapper | null> {
    const wrapper = await prisma.responseWrapper.findUnique({
      where: { id },
    });
    
    return wrapper ? mapResponseWrapper(wrapper) : null;
  }

  static async updateResponseWrapper(
    id: number,
    data: Partial<ResponseWrapperSchemaType>
  ): Promise<IResponseWrapper> {
    const wrapper = await prisma.responseWrapper.update({
      where: { id },
      data: {
        ...data,
        json: data.json ? JSON.parse(data.json.replaceAll(WRAPPER_DATA_STR, `"${WRAPPER_DATA_STR}"`)) : null,
      },
    });
    
    return mapResponseWrapper(wrapper);
  }

  static async deleteResponseWrapper(id: number): Promise<IResponseWrapper> {
    const wrapper = await prisma.responseWrapper.delete({
      where: { id },
    });
    
    return mapResponseWrapper(wrapper);
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
