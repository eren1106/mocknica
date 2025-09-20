import { NextRequest } from "next/server";
import { apiResponse, errorResponse } from "../../_helpers/api-response";
import { createAIServiceManager } from "@/lib/ai";
import { AIModel } from "@/lib/ai/types";

export async function GET(req: NextRequest) {
  try {
    const aiManager = createAIServiceManager();
    
    // Get all available models from all providers
    const models = await aiManager.getAllAvailableModels();
    
    // Get health status to filter out unavailable providers
    const healthStatus = await aiManager.getHealthStatus();
    
    // Filter models to only include those from available providers
    const availableModels = models.filter((model: AIModel) => 
      healthStatus[model.provider]?.available
    );

    return apiResponse(req, { 
      data: {
        models: availableModels,
        providers: aiManager.getAvailableProviders(),
        health: healthStatus
      }
    });
  } catch (error) {
    console.error('Error fetching AI models:', error);
    return errorResponse(req, { 
      error,
      message: 'Failed to fetch available AI models'
    });
  }
}