import { NextRequest } from "next/server";
import { apiResponse, errorResponse } from "../../_helpers/api-response";
import { AIModel } from "@/lib/ai/types";
import { AIServiceManager } from "@/lib/ai/ai-service-manager";
import { extractApiKeysFromHeaders } from "@/lib/ai/helpers";

export async function GET(req: NextRequest) {
  try {
    // Create AI service manager with custom keys from headers
    // This allows users to provide their own API keys via session storage
    const customKeys = extractApiKeysFromHeaders(req);
    const manager = new AIServiceManager(customKeys);
    
    if (!manager) {
      return apiResponse(req, { 
        data: {
          models: [],
          providers: [],
          health: {},
          defaultModel: null,
          instructions: {
            gemini: 'Get your API key from https://aistudio.google.com/app/apikey',
            openai: 'Get your API key from https://platform.openai.com/api-keys',
            ollama: 'Download and install from https://ollama.ai/download'
          }
        }
      });
    }
    
    // Get all available models from all providers
    const models = await manager.getAllAvailableModels();
    
    // Get health status to filter out unavailable providers
    const healthStatus = await manager.getHealthStatus();
    
    // Filter models to only include those from available providers
    const availableModels = models.filter((model: AIModel) => 
      healthStatus[model.provider]?.available
    );

    // Get the default model
    const defaultModel = await manager.getDefaultModel();

    // Filter providers to only include those that are actually available
    const availableProviders = manager.getAvailableProviders()
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