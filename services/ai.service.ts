import { apiRequest } from "@/helpers/api-request";
import { Endpoint } from "@/models/endpoint.model";
import { SchemaField } from "@/models/schema-field.model";
import { Schema } from "@/models/schema.model";

interface GenerateEndpointsAndSchemasByAIResponse {
  endpoints: Endpoint[];
  schemas: Schema[];
}

export class AIService {
  static async generateResponseByAI(prompt: string): Promise<any> {
    const res = await apiRequest.post("ai/endpoint-response", { prompt });
    return res.data;
  }

  static async generateSchemaByAI(prompt: string): Promise<SchemaField[]> {
    const res = await apiRequest.post("ai/schema", { prompt });
    return res.data;
  }

  static async generateEndpointsAndSchemasByAI(prompt: string): Promise<GenerateEndpointsAndSchemasByAIResponse> {
    const res = await apiRequest.post("ai/project", { prompt });
    return res.data;
  }
}
