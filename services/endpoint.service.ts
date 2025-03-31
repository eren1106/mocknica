import { apiRequest } from "@/helpers/api-request";
import { Endpoint } from "@prisma/client";

export class EndpointService {
    static async getAllEndpoints(): Promise<Endpoint[]> {
        const res = await apiRequest.get('endpoints');
        return res.data;
    }

    static async createEndpoint(data: {
        name: string;
        description?: string;
        method: string;
        path: string;
        responseGen: string;
        staticResponse?: string | null;
        schemaId?: number | null;
    }): Promise<Endpoint> {
        const res = await apiRequest.post('endpoints', data);
        return res.data;
    }

    static async createEndpointsBySchema(data: {
        schemaId: number;
        basePath: string;
    }): Promise<Endpoint[]> {
        const res = await apiRequest.post('endpoints/schema', data);
        return res.data;
    }
}