import prisma from "@/lib/db";
import { SchemaField } from "@prisma/client";
import { SchemaSchemaType } from "@/zod-schemas/schema.schema";
import { PrismaIncludes, SchemaWithFields } from "./helpers/prisma-includes";

export class SchemaData {
  static async createSchema(
    data: SchemaSchemaType,
    projectId: string
  ): Promise<SchemaWithFields> {
    return prisma.schema.create({
      data: {
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
      },
      ...PrismaIncludes.schemaInclude,
    });
  }

  static async getSchema(id: number): Promise<SchemaWithFields | null> {
    return prisma.schema.findUnique({
      where: { id },
      ...PrismaIncludes.schemaInclude,
    });
  }

  static async getAllSchemas(projectId?: string): Promise<SchemaWithFields[]> {
    return prisma.schema.findMany({
      ...(projectId && { where: { projectId } }),
      ...PrismaIncludes.schemaInclude,
      orderBy: {
        name: "asc",
      },
    });
  }
  
  static async updateSchema(
    id: number,
    data: SchemaSchemaType
  ): Promise<SchemaWithFields> {
    // First delete existing fields
    await prisma.schemaField.deleteMany({
      where: { schemaId: id },
    });

    // Then update schema with new fields
    return prisma.schema.update({
      where: { id },
      data: {
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
      },
      ...PrismaIncludes.schemaInclude,
    });
  }

  static async deleteSchema(id: number): Promise<Partial<SchemaWithFields>> {
    return prisma.schema.delete({
      where: { id },
      select: { id: true, name: true },
    });
  }

  static async removeFieldFromSchema(fieldId: number): Promise<SchemaField> {
    return prisma.schemaField.delete({
      where: { id: fieldId },
    });
  }

  // Light version for ownership checks
  static async getSchemaOwnership(
    id: number
  ): Promise<{ id: number; projectId: string } | null> {
    const result = await prisma.schema.findUnique({
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
