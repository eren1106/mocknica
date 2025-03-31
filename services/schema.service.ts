import { apiRequest } from "@/helpers/api-request";
import { SchemaFieldType, FakerType, Schema } from "@prisma/client";

export class SchemaService {
    static async getAllSchemas(): Promise<Schema[]> {
        const res = await apiRequest.get('schema');
        return res.data;
    }

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
        const res = await apiRequest.post('schema', data);
        return res.data;
    }

    static async updateSchema(id: number, data: {
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
        const res = await apiRequest.put(`schema/${id}`, data);
        return res.data;
    }

    static async deleteSchema(id: number): Promise<void> {
        await apiRequest.delete(`schema/${id}`);
    }   
}