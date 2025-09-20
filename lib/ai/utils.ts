import { AIServiceManager, getAIServiceManager } from './ai-service-manager';
import { AIProviderType, AIProviderConfig, GeminiModelId, OpenAIModelId, OllamaModelId } from './types';

/**
 * Utility functions for AI service management
 */

/**
 * Create a new AI Service Manager with environment-based configuration
 */
export function createAIServiceManager(): AIServiceManager {
  const configs: Partial<Record<AIProviderType, AIProviderConfig>> = {};

  // Auto-configure based on environment variables
  if (process.env.GEMINI_API_KEY) {
    configs.gemini = {
      apiKey: process.env.GEMINI_API_KEY,
      defaultModel: process.env.GEMINI_MODEL as GeminiModelId || 'gemini-2.0-flash'
    };
  }

  if (process.env.OPENAI_API_KEY) {
    configs.openai = {
      apiKey: process.env.OPENAI_API_KEY,
      defaultModel: process.env.OPENAI_MODEL as OpenAIModelId || 'gpt-4o-mini'
    };
  }

  if (process.env.OLLAMA_BASE_URL || process.env.OLLAMA_ENABLED === 'true') {
    configs.ollama = {
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      defaultModel: process.env.OLLAMA_MODEL as OllamaModelId || 'llama3.2'
    };
  }

  return getAIServiceManager(configs);
}

// TODO: move to ai-service-manager.ts is better?
/**
 * Get model provider type from model ID
 */
export function getProviderFromModelId(modelId: string): AIProviderType | null {
  // TODO: enhance this, now is too hard-coded
  // Gemini models
  if (modelId.startsWith('gemini')) return AIProviderType.GEMINI;
  
  // OpenAI models
  if (modelId.startsWith('gpt') || modelId.includes('turbo')) return AIProviderType.OPENAI;
  
  // Ollama models (most other models)
  return AIProviderType.OLLAMA;
}

/**
 * Validate environment configuration for AI providers
 */
export function validateAIConfiguration(): {
  valid: boolean;
  providers: AIProviderType[];
  errors: string[];
} {
  const providers: AIProviderType[] = [];
  const errors: string[] = [];

  // Check Gemini
  if (process.env.GEMINI_API_KEY) {
    providers.push(AIProviderType.GEMINI);
  } else {
    errors.push('GEMINI_API_KEY not found in environment');
  }

  // Check OpenAI
  if (process.env.OPENAI_API_KEY) {
    providers.push(AIProviderType.OPENAI);
  } else {
    errors.push('OPENAI_API_KEY not found in environment');
  }

  // Check Ollama (more lenient as it's local)
  if (process.env.OLLAMA_BASE_URL || process.env.OLLAMA_ENABLED) {
    providers.push(AIProviderType.OLLAMA);
  }

  return {
    valid: providers.length > 0,
    providers,
    errors: providers.length === 0 ? errors : []
  };
}