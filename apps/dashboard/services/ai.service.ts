import { apiRequest } from "@/helpers/api-request";
import { IEndpoint, ISchemaField, ISchema } from "@/types";

interface GenerateEndpointsAndSchemasByAIResponse {
  endpoints: IEndpoint[];
  schemas: ISchema[];
}

export class AIService {
  static async generateResponseByAI(prompt: string, model?: string): Promise<any> {
    const res = await apiRequest.post("ai/endpoint-response", { prompt, model });
    return res.data;
  }

  static async generateSchemaByAI(prompt: string, model?: string): Promise<ISchemaField[]> {
    const res = await apiRequest.post("ai/schema", { prompt, model });
    return res.data;
  }

  static async generateEndpointsAndSchemasByAI(prompt: string, model?: string): Promise<GenerateEndpointsAndSchemasByAIResponse> {
    const res = await apiRequest.post("ai/project", { prompt, model });
    return res.data;
  }
}
