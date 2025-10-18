import { PrismaClient, Prisma } from "@prisma/client";
import prisma from "@/lib/db";

/**
 * BaseRepository
 * Generic repository providing common CRUD operations
 * Follows the repository pattern and DRY principles
 * 
 * @template TModel - The Prisma model type
 * @template TCreateInput - The create input type
 * @template TUpdateInput - The update input type
 * @template TWhereInput - The where input type
 * @template TWhereUniqueInput - The where unique input type
 * @template TInclude - The include type for relations
 * @template TOrderBy - The order by type
 */
export abstract class BaseRepository<
  TModel,
  TCreateInput,
  TUpdateInput,
  TWhereInput,
  TWhereUniqueInput,
  TInclude = undefined,
  TOrderBy = any
> {
  protected prisma: PrismaClient;
  protected modelName: Prisma.ModelName;

  constructor(modelName: Prisma.ModelName) {
    this.prisma = prisma;
    this.modelName = modelName;
  }

  /**
   * Get the Prisma delegate for this model
   */
  protected get delegate(): any {
    return (this.prisma as any)[this.modelName.toLowerCase()];
  }

  /**
   * Get default include configuration for this model
   * Override in subclasses to provide specific includes
   */
  protected getDefaultInclude(): TInclude | undefined {
    return undefined;
  }

  /**
   * Get default order by configuration for this model
   * Override in subclasses to provide specific ordering
   */
  protected getDefaultOrderBy(): TOrderBy | undefined {
    return undefined;
  }

  /**
   * Map database entity to domain model
   * Override in subclasses to provide custom mapping
   */
  protected abstract mapToDomain(entity: any): TModel;

  /**
   * Create a new record
   */
  async create(
    data: TCreateInput,
    include?: TInclude
  ): Promise<TModel> {
    const entity = await this.delegate.create({
      data,
      ...(include !== undefined && { include }),
      ...(include === undefined && this.getDefaultInclude() && { include: this.getDefaultInclude() }),
    });

    return this.mapToDomain(entity);
  }

  /**
   * Find a single record by unique identifier
   */
  async findUnique(
    where: TWhereUniqueInput,
    include?: TInclude
  ): Promise<TModel | null> {
    const entity = await this.delegate.findUnique({
      where,
      ...(include !== undefined && { include }),
      ...(include === undefined && this.getDefaultInclude() && { include: this.getDefaultInclude() }),
    });

    return entity ? this.mapToDomain(entity) : null;
  }

  /**
   * Find the first record matching criteria
   */
  async findFirst(
    where?: TWhereInput,
    include?: TInclude,
    orderBy?: TOrderBy
  ): Promise<TModel | null> {
    const entity = await this.delegate.findFirst({
      where,
      ...(include !== undefined && { include }),
      ...(include === undefined && this.getDefaultInclude() && { include: this.getDefaultInclude() }),
      ...(orderBy && { orderBy }),
    });

    return entity ? this.mapToDomain(entity) : null;
  }

  /**
   * Find many records matching criteria
   */
  async findMany(
    where?: TWhereInput,
    include?: TInclude,
    orderBy?: TOrderBy,
    skip?: number,
    take?: number
  ): Promise<TModel[]> {
    const entities = await this.delegate.findMany({
      where,
      ...(include !== undefined && { include }),
      ...(include === undefined && this.getDefaultInclude() && { include: this.getDefaultInclude() }),
      ...(orderBy !== undefined ? { orderBy } : this.getDefaultOrderBy() && { orderBy: this.getDefaultOrderBy() }),
      ...(skip !== undefined && { skip }),
      ...(take !== undefined && { take }),
    });

    return entities.map((entity: any) => this.mapToDomain(entity));
  }

  /**
   * Update a single record
   */
  async update(
    where: TWhereUniqueInput,
    data: TUpdateInput,
    include?: TInclude
  ): Promise<TModel> {
    const entity = await this.delegate.update({
      where,
      data,
      ...(include !== undefined && { include }),
      ...(include === undefined && this.getDefaultInclude() && { include: this.getDefaultInclude() }),
    });

    return this.mapToDomain(entity);
  }

  /**
   * Delete a single record
   */
  async delete(where: TWhereUniqueInput): Promise<void> {
    await this.delegate.delete({ where });
  }

  /**
   * Count records matching criteria
   */
  async count(where?: TWhereInput): Promise<number> {
    return await this.delegate.count({ where });
  }

  /**
   * Check if a record exists
   */
  async exists(where: TWhereInput): Promise<boolean> {
    const count = await this.count(where);
    return count > 0;
  }

  /**
   * Delete many records
   */
  async deleteMany(where?: TWhereInput): Promise<number> {
    const result = await this.delegate.deleteMany({ where });
    return result.count;
  }

  /**
   * Update many records
   */
  async updateMany(
    where: TWhereInput,
    data: TUpdateInput
  ): Promise<number> {
    const result = await this.delegate.updateMany({
      where,
      data,
    });
    return result.count;
  }
}
