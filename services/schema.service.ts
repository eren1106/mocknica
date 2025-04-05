import { apiRequest } from "@/helpers/api-request";
import { Schema } from "@/models/schema.model";
import { SchemaSchemaType } from "@/zod-schemas/schema.schema";

export class SchemaService {
    static async getAllSchemas(): Promise<Schema[]> {
        const res = await apiRequest.get('schema');
        return res.data;
    }

    static async createSchema(data: SchemaSchemaType): Promise<Schema> {
        const res = await apiRequest.post('schema', data);
        return res.data;
    }

    static async updateSchema(id: number, data: SchemaSchemaType): Promise<Schema> {
        const res = await apiRequest.put(`schema/${id}`, data);
        return res.data;
    }

    static async deleteSchema(id: number): Promise<void> {
        await apiRequest.delete(`schema/${id}`);
    }   
}