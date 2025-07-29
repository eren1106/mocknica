import prisma from '@/lib/db';
import { Schema } from '@/models/schema.model';
import { SchemaField } from '@prisma/client';
import { SchemaSchemaType } from '@/zod-schemas/schema.schema';

export class SchemaData {
    static async createSchema(data: SchemaSchemaType & { projectId?: string }): Promise<Schema> {
        return prisma.schema.create({
            data: {
                name: data.name,
                ...(data.projectId && { project: { connect: { id: data.projectId } } }),
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
                        objectSchema: {
                            include: {
                                fields: true
                            }
                        },
                        arrayType: {
                            include: {
                                objectSchema: {
                                    include: {
                                        fields: true
                                    }
                                }
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
                        objectSchema: {
                            include: {
                                fields: true
                            }
                        },
                        arrayType: {
                            include: {
                                objectSchema: {
                                    include: {
                                        fields: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
    }

    static async getAllSchemas(projectId?: string): Promise<Schema[]> {
        return prisma.schema.findMany({
            where: projectId ? { projectId } : undefined,
            include: {
                fields: {
                    include: {
                        objectSchema: {
                            include: {
                                fields: true
                            }
                        },
                        arrayType: {
                            include: {
                                objectSchema: {
                                    include: {
                                        fields: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                name: "asc"
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
                        objectSchema: {
                            include: {
                                fields: true
                            }
                        },
                        arrayType: {
                            include: {
                                objectSchema: {
                                    include: {
                                        fields: true
                                    }
                                }
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