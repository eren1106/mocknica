import prisma from '@/lib/db';
import { Schema } from '@/models/schema.model';
import { SchemaField, SchemaFieldType, FakerType } from '@prisma/client';

export class SchemaData {
    static async createSchema(data: {
        name: string;
        fields: Array<{
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
        return prisma.schema.create({
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
                        arrayType: true,
                        objectSchema: true
                    }
                }
            }
        });
    }

    static async getSchema(id: number): Promise<Schema | null> {
        return prisma.schema.findUnique({
            where: { id },
            include: {
                fields: true,
            },
        });
    }

    static async getAllSchemas(): Promise<Schema[]> {
        return prisma.schema.findMany({
            include: {
                fields: true,
            },
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
        });

        if (data.fields) {
            await prisma.schemaField.deleteMany({
                where: { schemaId: id },
            });

            await prisma.schema.update({
                where: { id },
                data: {
                    fields: {
                        create: data.fields,
                    },
                },
            });
        }

        return this.getSchema(id) as Promise<Schema>;
    }

    static async deleteSchema(id: number): Promise<Partial<Schema>> {
        await prisma.schemaField.deleteMany({
            where: { schemaId: id },
        });

        return prisma.schema.delete({
            where: { id },
        });
    }

    // static async addFieldToSchema(
    //     schemaId: number,
    //     fieldData: {
    //         name: string;
    //         type: SchemaFieldType;
    //         fakerType?: FakerType;
    //         objectSchemaId?: number;
    //         arrayType?: {
    //             elementType: SchemaFieldType;
    //             objectSchemaId?: number;
    //         };
    //     }
    // ): Promise<SchemaField> {
    //     return prisma.schemaField.create({
    //         data: {
    //             ...fieldData,
    //             schemaId,
    //         },
    //     });
    // }

    static async removeFieldFromSchema(fieldId: number): Promise<SchemaField> {
        return prisma.schemaField.delete({
            where: { id: fieldId },
        });
    }
}