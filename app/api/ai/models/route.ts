import { NextRequest } from "next/server";
import { apiResponse, errorResponse } from "../../_helpers/api-response";
import { AIModel } from "@/lib/ai/types";
import { aiServiceManager } from "@/lib/ai";

export async function GET(req: NextRequest) {
  try {
    if (!aiServiceManager) {
      return errorResponse(req, { 
        message: 'AI services are not available. Please configure at least one AI provider (GEMINI_API_KEY, OPENAI_API_KEY, or run Ollama locally).',
        statusCode: 503
      });
    }
    
    // Get all available models from all providers
    const models = await aiServiceManager.getAllAvailableModels();
    
    // Get health status to filter out unavailable providers
    const healthStatus = await aiServiceManager.getHealthStatus();
    
    // Filter models to only include those from available providers
    const availableModels = models.filter((model: AIModel) => 
      healthStatus[model.provider]?.available
    );

    // Get the default model
    const defaultModel = await aiServiceManager.getDefaultModel();

    // Filter providers to only include those that are actually available
    const availableProviders = aiServiceManager.getAvailableProviders()
      .filter(provider => healthStatus[provider]?.available);

    return apiResponse(req, { 
      data: {
        models: availableModels,
        providers: availableProviders,
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