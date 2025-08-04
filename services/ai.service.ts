import { apiRequest } from "@/helpers/api-request";
import { SchemaField } from "@/models/schema-field.model";

export class AIService {
  static async generateResponseByAI(prompt: string): Promise<any> {
    const res = await apiRequest.post("ai/endpoint-response", { prompt });
    return res.data;
  }

  static async generateSchemaByAI(prompt: string): Promise<SchemaField[]> {
    const res = await apiRequest.post("ai/schema", { prompt });
    return res.data;
  }
}
