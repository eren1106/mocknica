import { AIModel } from "@/lib/ai";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/helpers/api-request";

export const AI_MODELS_QUERY_KEY = "ai-models";

export const useAiModels = () => {
  return useQuery<AIModel[]>({
    queryKey: [AI_MODELS_QUERY_KEY],
    queryFn: async () => {
      const res = await apiRequest.get("ai/models");
      return res.data.models;
    },
    staleTime: Infinity
  });
};
