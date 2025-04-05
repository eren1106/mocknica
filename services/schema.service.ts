import { apiRequest } from "@/helpers/api-request";
import { Schema } from "@/models/schema.model";
import { SchemaFieldType, FakerType, IdFieldType } from "@prisma/client";

export class SchemaService {
    static async getAllSchemas(): Promise<Schema[]> {
        const res = await apiRequest.get('schema');
        return res.data;
    }

    static async createSchema(data: Omit<Schema, 'id'>): Promise<Schema> {
        const res = await apiRequest.post('schema', data);
        return res.data;
    }

    static async updateSchema(id: number, data: Omit<Schema, 'id'>): Promise<Schema> {
        const res = await apiRequest.put(`schema/${id}`, data);
        return res.data;
    }

    static async deleteSchema(id: number): Promise<void> {
        await apiRequest.delete(`schema/${id}`);
    }   
}