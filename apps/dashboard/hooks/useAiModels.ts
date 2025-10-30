import { AIModel } from "@/lib/ai";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/helpers/api-request";
import { getApiKey } from "@/lib/ai/session-storage";
import { AIProviderType } from "@/lib/ai/types";

export const AI_MODELS_QUERY_KEY = "ai-models";

interface AIModelsResponse {
  models: AIModel[];
  providers: string[];
  defaultModel: string | null;
}

export const useAiModels = () => {
  return useQuery<AIModelsResponse>({
    queryKey: [AI_MODELS_QUERY_KEY],
    queryFn: async () => {
      const headers: Record<string, string> = {};
      
      // Get API keys from session storage
      const geminiKey = getApiKey(AIProviderType.GEMINI);
      const openaiKey = getApiKey(AIProviderType.OPENAI);
      
      // Add session storage API keys to headers
      if (geminiKey) headers['X-Gemini-API-Key'] = geminiKey;
      if (openaiKey) headers['X-OpenAI-API-Key'] = openaiKey;
      
      const res = await apiRequest.get("ai/models", undefined, headers);
      return res.data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    // retry: 1,
  });
};
