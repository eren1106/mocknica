import { apiRequest } from "@/helpers/api-request";
import { Endpoint } from "@/models/endpoint.model";
import { SchemaField } from "@/models/schema-field.model";
import { Schema } from "@/models/schema.model";

interface GenerateEndpointsAndSchemasByAIResponse {
  endpoints: Endpoint[];
  schemas: Schema[];
}

export class AIService {
  static async generateResponseByAI(prompt: string, model?: string): Promise<any> {
    const res = await apiRequest.post("ai/endpoint-response", { prompt, model });
    return res.data;
  }

  static async generateSchemaByAI(prompt: string, model?: string): Promise<SchemaField[]> {
    const res = await apiRequest.post("ai/schema", { prompt, model });
    return res.data;
  }

  static async generateEndpointsAndSchemasByAI(prompt: string, model?: string): Promise<GenerateEndpointsAndSchemasByAIResponse> {
    const res = await apiRequest.post("ai/project", { prompt, model });
    return res.data;
  }
}
