import { apiRequest } from "@/helpers/api-request";
import { SchemaFieldType, IdFieldType, FakerType } from "@prisma/client";
import { Schema } from "zod";

export class SchemaService {
    static async getAllSchemas() {
        const res = await apiRequest.get('/schema');
        return res.data;
    }

    static async createSchema(data: {
        name: string;
        fields: Array<{
            name: string;
            type: SchemaFieldType;
            idFieldType?: IdFieldType;
            fakerType?: FakerType;
        }>;
    }): Promise<Schema> {
        const res = await apiRequest.post('/schema', data);
        return res.data;
    }

    static async updateSchema(id: number, data: {
        name: string;
        fields: Array<{
            name: string;
            type: SchemaFieldType;
            idFieldType?: IdFieldType;
            fakerType?: FakerType;
        }>;
    }): Promise<Schema> {
        const res = await apiRequest.put(`/schema/${id}`, data);
        return res.data;
    }

    static async deleteSchema(id: number): Promise<void> {
        await apiRequest.delete(`/schema/${id}`);
    }   
}