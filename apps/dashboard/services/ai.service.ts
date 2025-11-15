// TODO: move the api-call logic to hook, move the getAIHeaders to ai utils file, and finally remove this file

import { apiRequest } from "@/helpers/api-request";
import { IEndpoint, IJsonSchemaField, ISchema } from "@/types";
import { getApiKey } from "@/lib/ai/session-storage";
import { AIProviderType } from "@/lib/ai/types";

interface GenerateEndpointsAndSchemasByAIResponse {
  endpoints: IEndpoint[];
  schemas?: ISchema[];
}

export class AIService {

  static async generateResponseByAI(prompt: string, model?: string): Promise<any> {
    const headers = this.getAIHeaders();
    const res = await apiRequest.post("ai/endpoint-response", { prompt, model }, undefined, headers);
    return res.data;
  }

  static async generateSchemaByAI(prompt: string, model?: string): Promise<IJsonSchemaField[]> {
    const headers = this.getAIHeaders();
    const res = await apiRequest.post("ai/schema", { prompt, model }, undefined, headers);
    return res.data;
  }

  static async generateEndpointsAndSchemasByAI(prompt: string, model?: string, isGenerateSchemas: boolean = true): Promise<GenerateEndpointsAndSchemasByAIResponse> {
    const headers = this.getAIHeaders();
    const res = await apiRequest.post("ai/project", { prompt, model, isGenerateSchemas }, undefined, headers);
    return res.data;
  }

  static getAIHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    
    const geminiKey = getApiKey(AIProviderType.GEMINI);
    const openaiKey = getApiKey(AIProviderType.OPENAI);
    
    if (geminiKey) {
      headers['X-Gemini-API-Key'] = geminiKey;
    }
    
    if (openaiKey) {
      headers['X-OpenAI-API-Key'] = openaiKey;
    }
    
    return headers;
  }
}
