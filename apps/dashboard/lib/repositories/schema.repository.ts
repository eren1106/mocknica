import { Prisma } from "@prisma/client";
import { ISchema, ISchemaField } from "@/types";
import { SchemaSchemaType } from "@/zod-schemas/schema.schema";
import { PrismaIncludes } from "./prisma-includes";
import { mapSchema, mapSchemaField } from "./type-mappers";
import { BaseRepository } from "./base.repository";

export class SchemaRepository extends BaseRepository<
  ISchema,
  Prisma.SchemaCreateInput,
  Prisma.SchemaUpdateInput,
  Prisma.SchemaWhereInput,
  Prisma.SchemaWhereUniqueInput,
  typeof PrismaIncludes.schemaInclude.include,
  Prisma.SchemaOrderByWithRelationInput
> {
  constructor() {
    super("Schema");
  }

  protected mapToDomain(entity: any): ISchema {
    return mapSchema(entity);
  }

  protected getDefaultInclude() {
    return PrismaIncludes.schemaInclude.include;
  }

  protected getDefaultOrderBy() {
    return { name: "asc" } as const;
  }

  /**
   * Create a new schema with fields
   */
  async createSchema(
    data: SchemaSchemaType,
    projectId: string
  ): Promise<ISchema> {
    const schemaData: Prisma.SchemaCreateInput = {
      name: data.name,
      project: { connect: { id: projectId } },
      fields: {
        create: data.fields.map((field) => ({
          name: field.name,
          type: field.type,
          ...(field.idFieldType && { idFieldType: field.idFieldType }),
          ...(field.fakerType && { fakerType: field.fakerType }),
          ...(field.objectSchemaId && {
            objectSchema: { connect: { id: field.objectSchemaId } },
          }),
          ...(field.arrayType && {
            arrayType: {
              create: {
                elementType: field.arrayType.elementType,
                ...(field.arrayType.objectSchemaId && {
                  objectSchema: {
                    connect: { id: field.arrayType.objectSchemaId },
                  },
                }),
              },
            },
          }),
        })),
      },
    };
    
    return await this.create(schemaData);
  }

  /**
   * Find a schema by ID
   */
  async findById(id: number): Promise<ISchema | null> {
    return await this.findUnique({ id });
  }

  /**
   * Find schemas by project ID
   */
  async findByProjectId(projectId: string): Promise<ISchema[]> {
    return await this.findMany({ projectId });
  }

  /**
   * Update a schema and its fields
   */
  async updateSchema(
    id: number,
    data: SchemaSchemaType
  ): Promise<ISchema> {
    // First delete existing fields
    await this.prisma.schemaField.deleteMany({
      where: { schemaId: id },
    });

    // Then update schema with new fields
    const updateData: Prisma.SchemaUpdateInput = {
      name: data.name,
      fields: {
        create: data.fields.map((field) => ({
          name: field.name,
          type: field.type,
          ...(field.idFieldType && { idFieldType: field.idFieldType }),
          ...(field.fakerType && { fakerType: field.fakerType }),
          ...(field.objectSchemaId && {
            objectSchema: { connect: { id: field.objectSchemaId } },
          }),
          ...(field.arrayType && {
            arrayType: {
              create: {
                elementType: field.arrayType.elementType,
                ...(field.arrayType.objectSchemaId && {
                  objectSchema: {
                    connect: { id: field.arrayType.objectSchemaId },
                  },
                }),
              },
            },
          }),
        })),
      },
    };
    
    return await this.update({ id }, updateData);
  }

  /**
   * Delete a schema (returns partial info)
   */
  async deleteSchema(id: number): Promise<Partial<ISchema>> {
    return this.prisma.schema.delete({
      where: { id },
      select: { id: true, name: true },
    });
  }

  /**
   * Delete a field from a schema
   */
  async deleteField(fieldId: number): Promise<ISchemaField> {
    const field = await this.prisma.schemaField.delete({
      where: { id: fieldId },
    });
    
    return mapSchemaField(field);
  }

  /**
   * Get schema ownership info (lightweight query)
   */
  async getOwnership(
    id: number
  ): Promise<{ id: number; projectId: string } | null> {
    const result = await this.prisma.schema.findUnique({
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

export const schemaRepository = new SchemaRepository();
