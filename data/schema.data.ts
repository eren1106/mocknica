import prisma from '@/lib/db';
import { Schema } from '@/models/schema.model';
import { SchemaField, SchemaFieldType, FakerType, IdFieldType } from '@prisma/client';
import { SchemaSchemaType } from '@/zod-schemas/schema.schema';

export class SchemaData {
    static async createSchema(data: SchemaSchemaType): Promise<Schema> {
        return prisma.schema.create({
            data: {
                name: data.name,
                fields: {
                    create: data.fields.map(field => ({
                        name: field.name,
                        type: field.type,
                        ...(field.idFieldType && { idFieldType: field.idFieldType }),
                        ...(field.fakerType && { fakerType: field.fakerType }),
                        ...(field.objectSchemaId && { objectSchema: { connect: { id: field.objectSchemaId } } }),
                        ...(field.arrayType && {
                            arrayType: {
                                create: {
                                    elementType: field.arrayType.elementType,
                                    ...(field.arrayType.objectSchemaId && { objectSchema: { connect: { id: field.arrayType.objectSchemaId } } })
                                }
                            }
                        })
                    }))
                }
            },
            include: {
                fields: {
                    include: {
                        objectSchema: true,
                        arrayType: {
                            include: {
                                objectSchema: true
                            }
                        }
                    }
                }
            }
        });
    }

    static async getSchema(id: number): Promise<Schema | null> {
        return prisma.schema.findUnique({
            where: { id },
            include: {
                fields: {
                    include: {
                        objectSchema: true,
                        arrayType: {
                            include: {
                                objectSchema: true
                            }
                        }
                    }
                }
            }
        });
    }

    static async getAllSchemas(): Promise<Schema[]> {
        return prisma.schema.findMany({
            include: {
                fields: {
                    include: {
                        objectSchema: true,
                        arrayType: {
                            include: {
                                objectSchema: true
                            }
                        }
                    }
                }
            }
        });
    }

    static async updateSchema(id: number, data: SchemaSchemaType): Promise<Schema> {
        // Delete all fields associated with the schema
        await prisma.schemaField.deleteMany({
            where: { schemaId: id },
        });

        const updatedSchema = await prisma.schema.update({
            where: { id },
            data: {
                name: data.name,
                fields: {
                    create: data.fields.map(field => ({
                        name: field.name,
                        type: field.type,
                        ...(field.fakerType && { fakerType: field.fakerType }),
                        ...(field.objectSchemaId && { objectSchema: { connect: { id: field.objectSchemaId } } }),
                        ...(field.arrayType && {
                            arrayType: {
                                create: {
                                    elementType: field.arrayType.elementType,
                                    ...(field.arrayType.objectSchemaId && { objectSchema: { connect: { id: field.arrayType.objectSchemaId } } })
                                }
                            }
                        })
                    }))
                }
            },
            include: {
                fields: {
                    include: {
                        objectSchema: true,
                        arrayType: {
                            include: {
                                objectSchema: true
                            }
                        }
                    }
                }
            }
        });

        return updatedSchema;
    }

    static async deleteSchema(id: number): Promise<Partial<Schema>> {
        return prisma.schema.delete({
            where: { id },
            select: {
                id: true,
                name: true
            }
        });
    }

    static async removeFieldFromSchema(fieldId: number): Promise<SchemaField> {
        return prisma.schemaField.delete({
            where: { id: fieldId }
        });
    }
}