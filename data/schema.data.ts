import prisma from '@/lib/db';
import { Schema } from '@/models/schema.model';
import { SchemaField, SchemaFieldType, FakerType, IdFieldType } from '@prisma/client';

export class SchemaData {
    static async createSchema(data: {
        name: string;
        fields: Array<{
            name: string;
            type: SchemaFieldType;
            idFieldType?: IdFieldType;
            fakerType?: FakerType;
            objectSchemaId?: number;
            arrayType?: {
                elementType: SchemaFieldType;
                objectSchemaId?: number;
            };
        }>;
    }): Promise<Schema> {
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

    static async updateSchema(id: number, data: {
        name?: string;
        fields?: Array<{
            id?: number;
            name: string;
            type: SchemaFieldType;
            fakerType?: FakerType;
            objectSchemaId?: number;
            arrayType?: {
                elementType: SchemaFieldType;
                objectSchemaId?: number;
            };
        }>;
    }): Promise<Schema> {
        const updatedSchema = await prisma.schema.update({
            where: { id },
            data: {
                name: data.name,
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

        if (data.fields) {
            await prisma.schemaField.deleteMany({
                where: { schemaId: id },
            });

            await prisma.schema.update({
                where: { id },
                data: {
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
                }
            });
        }

        return this.getSchema(id) as Promise<Schema>;
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