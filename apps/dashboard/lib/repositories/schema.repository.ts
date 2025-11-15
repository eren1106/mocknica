import { Prisma, Schema } from "@prisma/client";
import { BaseRepository } from "./base.repository";
import prisma from "../db";
import { ISchema } from "@/types";
import { mapSchema } from "./type-mappers";

// Define the Prisma entity type with relations
type SchemaWithRelations = Schema;

export class SchemaRepository extends BaseRepository<
  SchemaWithRelations,
  Prisma.SchemaCreateInput,
  Prisma.SchemaCreateManyInput,
  Prisma.SchemaUpdateInput,
  Prisma.SchemaWhereInput,
  Prisma.SchemaWhereUniqueInput,
  ISchema // MappedType
> {
  protected delegate = prisma.schema;
  
  constructor() {
    super(mapSchema);
  }

  /**
   * Find schemas by project ID
   */
  async findByProjectId(projectId: string, options?: { select?: Prisma.SchemaSelect; include?: Prisma.SchemaInclude }): Promise<ISchema[]> {
    return this.findMany({
      where: { projectId },
      ...options,
      orderBy: { name: "asc" },
    });
  }
}

export const schemaRepository = new SchemaRepository();
