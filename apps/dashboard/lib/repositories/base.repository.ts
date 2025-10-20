import { Prisma } from "@prisma/client";
import {
  BaseFindOptions,
  FindManyOptions,
  IBaseRepository,
} from "@/types/repository.types";
import prisma from "../db";

// Define operations interface that matches what we need from Prisma delegates
interface DelegateOperations<T, CreateInput, CreateManyInput, UpdateInput, WhereInput, WhereUniqueInput> {
  findUnique(args: { where: WhereUniqueInput } & BaseFindOptions): Promise<T | null>;
  findMany(args?: FindManyOptions): Promise<T[]>;
  findFirst(args?: FindManyOptions): Promise<T | null>;
  create(args: { data: CreateInput }): Promise<T>;
  createMany(args: { data: CreateManyInput | CreateManyInput[]; skipDuplicates?: boolean }): Promise<Prisma.BatchPayload>;
  update(args: { where: WhereUniqueInput; data: UpdateInput }): Promise<T>;
  updateMany(args: { where: WhereInput; data: UpdateInput }): Promise<Prisma.BatchPayload>;
  delete(args: { where: WhereUniqueInput }): Promise<T>;
  deleteMany(args: { where: WhereInput }): Promise<Prisma.BatchPayload>;
  count(args?: { where?: WhereInput }): Promise<number>;
  upsert(args: { where: WhereUniqueInput; create: CreateInput; update: UpdateInput }): Promise<T>;
}

export abstract class BaseRepository<
  T,
  CreateInput = Prisma.JsonObject,
  CreateManyInput = Prisma.JsonObject,
  UpdateInput = Prisma.JsonObject,
  WhereInput = Prisma.JsonObject,
  WhereUniqueInput = { id: string }
> implements IBaseRepository<T> {
  protected abstract delegate: DelegateOperations<T, CreateInput, CreateManyInput, UpdateInput, WhereInput, WhereUniqueInput>;

  /**
   * Find a single record by ID
   * @param id - The ID of the record
   * @param options - Optional include/select options
   */
  async findById(id: string | number, options?: BaseFindOptions): Promise<T | null> {
    return this.delegate.findUnique({
      where: { id } as WhereUniqueInput,
      ...options,
    });
  }

  /**
   * Find multiple records with optional filtering, pagination, and relations
   * @param options - Query options (where, include, select, pagination, etc.)
   */
  async findMany(options?: FindManyOptions): Promise<T[]> {
    return this.delegate.findMany(options);
  }

  /**
   * Find the first record matching the criteria
   * @param options - Query options
   */
  async findFirst(options?: FindManyOptions): Promise<T | null> {
    return this.delegate.findFirst(options);
  }

  /**
   * Create a new record
   * @param data - The data to create the record with
   */
  async create(data: CreateInput): Promise<T> {
    return this.delegate.create({ data });
  }

  /**
   * Create multiple records at once
   * @param data - Array of data to create records with
   */
  async createMany(data: CreateManyInput[]): Promise<Prisma.BatchPayload> {
    return this.delegate.createMany({
      data,
      skipDuplicates: true,
    });
  }

  /**
   * Update a record by ID
   * @param id - The ID of the record to update
   * @param data - The data to update
   */
  async update(id: string, data: UpdateInput): Promise<T> {
    return this.delegate.update({
      where: { id } as WhereUniqueInput,
      data,
    });
  }

  /**
   * Update multiple records matching the criteria
   * @param where - Filter criteria
   * @param data - The data to update
   */
  async updateMany(where: WhereInput, data: UpdateInput): Promise<Prisma.BatchPayload> {
    return this.delegate.updateMany({
      where,
      data,
    });
  }

  /**
   * Delete a record by ID
   * @param id - The ID of the record to delete
   */
  async delete(id: string): Promise<T> {
    return this.delegate.delete({
      where: { id } as WhereUniqueInput,
    });
  }

  /**
   * Delete multiple records matching the criteria
   * @param where - Filter criteria
   */
  async deleteMany(where: WhereInput): Promise<Prisma.BatchPayload> {
    return this.delegate.deleteMany({ where });
  }

  /**
   * Count records matching the criteria
   * @param where - Optional filter criteria
   */
  async count(where?: WhereInput): Promise<number> {
    return this.delegate.count({ where });
  }

  /**
   * Check if a record exists matching the criteria
   * @param where - Filter criteria
   */
  async exists(where: WhereInput): Promise<boolean> {
    const count = await this.delegate.count({ where });
    return count > 0;
  }

  /**
   * Upsert a record (update if exists, create if not)
   * @param where - Unique identifier
   * @param create - Data to use if creating
   * @param update - Data to use if updating
   */
  async upsert(where: WhereUniqueInput, create: CreateInput, update: UpdateInput): Promise<T> {
    return this.delegate.upsert({
      where,
      create,
      update,
    });
  }

  /**
   * Execute a raw query (use with caution)
   * @param query - Raw SQL query using Prisma.sql template
   */
  protected async executeRaw(query: Prisma.Sql): Promise<number> {
    return prisma.$executeRaw(query);
  }

  /**
   * Query raw SQL and return results (use with caution)
   * @param query - Raw SQL query using Prisma.sql template
   */
  protected async queryRaw<R extends Prisma.JsonObject[]>(query: Prisma.Sql): Promise<R> {
    return prisma.$queryRaw<R>(query);
  }
}