import { Prisma } from "@prisma/client";
import { IResponseWrapper } from "@/types";
import { ResponseWrapperSchemaType } from "@/zod-schemas/response-wrapper.schema";
import { WRAPPER_DATA_STR } from "@/constants";
import { mapResponseWrapper } from "./type-mappers";
import { BaseRepository } from "./base.repository";

export class ResponseWrapperRepository extends BaseRepository<
  IResponseWrapper,
  Prisma.ResponseWrapperCreateInput,
  Prisma.ResponseWrapperUpdateInput,
  Prisma.ResponseWrapperWhereInput,
  Prisma.ResponseWrapperWhereUniqueInput,
  undefined,
  Prisma.ResponseWrapperOrderByWithRelationInput
> {
  constructor() {
    super("ResponseWrapper");
  }

  protected mapToDomain(entity: any): IResponseWrapper {
    return mapResponseWrapper(entity);
  }

  protected getDefaultOrderBy() {
    return { createdAt: "asc" } as const;
  }

  /**
   * Create a new response wrapper
   */
  async createWrapper(
    data: ResponseWrapperSchemaType,
    projectId: string
  ): Promise<IResponseWrapper> {
    const wrapperData: Prisma.ResponseWrapperCreateInput = {
      name: data.name,
      json: data.json ? JSON.parse(data.json.replaceAll(WRAPPER_DATA_STR, `"${WRAPPER_DATA_STR}"`)) : null,
      project: { connect: { id: projectId } },
    };
    
    return await this.create(wrapperData);
  }

  /**
   * Find response wrappers by project ID
   */
  async findByProjectId(projectId: string): Promise<IResponseWrapper[]> {
    return await this.findMany({ projectId });
  }

  /**
   * Find response wrappers by multiple project IDs
   */
  async findByProjectIds(projectIds: string[]): Promise<IResponseWrapper[]> {
    return await this.findMany({ projectId: { in: projectIds } });
  }

  /**
   * Find a response wrapper by ID
   */
  async findById(id: number): Promise<IResponseWrapper | null> {
    return await this.findUnique({ id });
  }

  /**
   * Update a response wrapper
   */
  async updateWrapper(
    id: number,
    data: Partial<ResponseWrapperSchemaType>
  ): Promise<IResponseWrapper> {
    const updateData: Prisma.ResponseWrapperUpdateInput = {
      ...data,
      json: data.json ? JSON.parse(data.json.replaceAll(WRAPPER_DATA_STR, `"${WRAPPER_DATA_STR}"`)) : null,
    };
    
    return await this.update({ id }, updateData);
  }

  /**
   * Delete a response wrapper
   */
  async deleteWrapper(id: number): Promise<IResponseWrapper> {
    const wrapper = await this.findById(id);
    if (!wrapper) {
      throw new Error("Response wrapper not found");
    }
    
    await this.delete({ id });
    return wrapper;
  }

  /**
   * Get response wrapper ownership info (lightweight query)
   */
  async getOwnership(id: number): Promise<{ id: number; projectId: string } | null> {
    const result = await this.prisma.responseWrapper.findUnique({
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

export const responseWrapperRepository = new ResponseWrapperRepository();