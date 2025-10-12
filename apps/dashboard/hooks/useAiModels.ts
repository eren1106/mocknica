import { AIModel } from "@/lib/ai";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/helpers/api-request";

export const AI_MODELS_QUERY_KEY = "ai-models";

interface AIModelsResponse {
  models: AIModel[];
  providers: string[];
  health: Record<string, { available: boolean; error?: string }>;
  defaultModel: string | null;
}

export const useAiModels = () => {
  return useQuery<AIModelsResponse>({
    queryKey: [AI_MODELS_QUERY_KEY],
    queryFn: async () => {
      const res = await apiRequest.get("ai/models");
      return res.data;
    },
    staleTime: Infinity
  });
};
