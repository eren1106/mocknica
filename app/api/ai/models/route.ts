import { NextRequest } from "next/server";
import { apiResponse, errorResponse } from "../../_helpers/api-response";
import { AIModel } from "@/lib/ai/types";
import { aiServiceManager } from "@/lib/ai";

export async function GET(req: NextRequest) {
  try {
    const aiManager = aiServiceManager;
    
    // Get all available models from all providers
    const models = await aiManager.getAllAvailableModels();
    
    // Get health status to filter out unavailable providers
    const healthStatus = await aiManager.getHealthStatus();
    
    // Filter models to only include those from available providers
    const availableModels = models.filter((model: AIModel) => 
      healthStatus[model.provider]?.available
    );

    // Get the default model
    const defaultModel = await aiManager.getDefaultModel();

    return apiResponse(req, { 
      data: {
        models: availableModels,
        providers: aiManager.getAvailableProviders(),
        health: healthStatus,
        defaultModel
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