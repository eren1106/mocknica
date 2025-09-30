import {
  AIProvider,
  AIProviderType,
  AIProviderConfig,
  AIGenerationRequest,
  AIGenerationResponse,
  AIModel,
  AIProviderError,
  AIConfigurationError
} from './types';
import { GeminiProvider } from './providers/gemini.provider';
import { OpenAIProvider } from './providers/openai.provider';
import { OllamaProvider } from './providers/ollama.provider';

/**
 * AI Service Manager
 * 
 * Implements the Factory pattern to manage different AI providers.
 * Automatically determines the correct provider based on the model ID,
 * eliminating the need for manual provider selection.
 */
export class AIServiceManager {
  private providers: Map<AIProviderType, AIProvider> = new Map();

  constructor() {
    this.initializeProviders();
  }

  /**
   * Initialize AI providers based on available configurations
   */
  private initializeProviders(): void {
    // Initialize Gemini provider
    if (process.env.GEMINI_API_KEY) {
      try {
        this.providers.set(AIProviderType.GEMINI, new GeminiProvider());
      } catch (error) {
        console.warn('Failed to initialize Gemini provider:', error);
      }
    }

    // Initialize OpenAI provider
    if (process.env.OPENAI_API_KEY) {
      try {
        this.providers.set(AIProviderType.OPENAI, new OpenAIProvider());
      } catch (error) {
        console.warn('Failed to initialize OpenAI provider:', error);
      }
    }

    // Initialize Ollama provider (always available if baseUrl is accessible)
    try {
      this.providers.set(AIProviderType.OLLAMA, new OllamaProvider());
    } catch (error) {
      console.warn('Failed to initialize Ollama provider:', error);
    }

    if (this.providers.size === 0) {
      console.warn(
        'No AI providers could be initialized. AI features will be unavailable. ' +
        'Please configure at least one provider: GEMINI_API_KEY, OPENAI_API_KEY, or run Ollama locally.'
      );
    }
  }

  /**
   * Get a specific provider by type
   */
  getProvider(type: AIProviderType): AIProvider {
    const provider = this.providers.get(type);
    if (!provider) {
      throw new AIConfigurationError(
        `Provider ${type} is not available or configured`,
        type
      );
    }
    return provider;
  }

  /**
   * Get all available providers
   */
  getAvailableProviders(): AIProviderType[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Get all available models from all providers
   */
  async getAllAvailableModels(): Promise<AIModel[]> {
    const allModels: AIModel[] = [];
    
    for (const [providerType, provider] of this.providers) {
      try {
        const isAvailable = await provider.isAvailable();
        if (isAvailable) {
          const models = await provider.getAvailableModels();
          allModels.push(...models);
        }
      } catch (error) {
        console.warn(`Failed to get models from ${providerType}:`, error);
      }
    }

    return allModels;
  }

  /**
   * Find the provider type for a given model ID using static definitions first,
   * then falling back to dynamic lookup
   */
  private async findProviderForModel(modelId: string): Promise<AIProviderType> {
    // First, try to determine provider from static model definitions
    const staticProvider = this.getProviderFromStaticModel(modelId);
    if (staticProvider && this.providers.has(staticProvider)) {
      return staticProvider;
    }

    // Fallback: Check each provider's available models dynamically
    for (const [providerType, provider] of this.providers) {
      try {
        const isAvailable = await provider.isAvailable();
        if (isAvailable) {
          const models = await provider.getAvailableModels();
          if (models.some(model => model.id === modelId)) {
            return providerType;
          }
        }
      } catch (error) {
        console.warn(`Failed to check models from ${providerType}:`, error);
      }
    }
    
    throw new AIProviderError(
      `Model '${modelId}' is not available from any configured provider`,
      AIProviderType.GEMINI, // Fallback provider type for error
      'MODEL_NOT_FOUND'
    );
  }

  /**
   * Determine provider from static model definitions for better performance
   */
  private getProviderFromStaticModel(modelId: string): AIProviderType | null {
    // TODO: enhancement: dont hard code
    
    // Gemini models
    if (modelId.includes("gemini")) {
      return AIProviderType.GEMINI;
    }

    // OpenAI models
    if (modelId.includes("gpt")) {
      return AIProviderType.OPENAI;
    }

    // Ollama models
    if (modelId.includes("llama")) {
      return AIProviderType.OLLAMA;
    }

    return null;
  }

  /**
   * Get the provider type for a model ID (synchronous static lookup)
   * Returns null if the model is not in the static definitions
   */
  getProviderForModel(modelId: string): AIProviderType | null {
    return this.getProviderFromStaticModel(modelId);
  }

  /**
   * Check if a model is supported by checking static definitions first
   */
  isModelSupported(modelId: string): boolean {
    const staticProvider = this.getProviderFromStaticModel(modelId);
    return staticProvider !== null && this.providers.has(staticProvider);
  }

  /**
   * Generate text using the specified model (provider determined automatically)
   */
  async generateText(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    if (!request.model) {
      throw new AIProviderError(
        'Model is required for text generation',
        AIProviderType.GEMINI, // Fallback provider type for error
        'MODEL_REQUIRED'
      );
    }

    const providerType = await this.findProviderForModel(request.model);
    
    if (!this.providers.has(providerType)) {
      throw new AIProviderError(
        `Provider ${providerType} is not configured`,
        providerType,
        'PROVIDER_NOT_CONFIGURED'
      );
    }

    return this.generateWithProvider(request, providerType);
  }

  /**
   * Generate text with a specific provider and model
   */
  private async generateWithProvider(
    request: AIGenerationRequest,
    providerType: AIProviderType
  ): Promise<AIGenerationResponse> {
    const provider = this.providers.get(providerType);
    if (!provider) {
      throw new AIProviderError(
        `Provider ${providerType} is not available or configured`,
        providerType,
        'PROVIDER_NOT_CONFIGURED'
      );
    }

    // Check if provider is available
    const isAvailable = await provider.isAvailable();
    if (!isAvailable) {
      throw new AIProviderError(
        `Provider ${providerType} is not available`,
        providerType,
        'PROVIDER_UNAVAILABLE'
      );
    }

    // Attempt generation
    return await provider.generateText(request);
  }

  /**
   * Generate text with a specific provider type (provider determined automatically from model)
   * This is an alternative method if you want to specify the provider explicitly
   */
  async generateTextWithProvider(
    request: AIGenerationRequest,
    providerType: AIProviderType
  ): Promise<AIGenerationResponse> {
    return this.generateWithProvider(request, providerType);
  }

  /**
   * Get model information by model ID
   */
  async getModelInfo(modelId: string): Promise<AIModel | null> {
    const allModels = await this.getAllAvailableModels();
    return allModels.find(model => model.id === modelId) || null;
  }

  /**
   * Validate that a model is available
   */
  async isModelAvailable(modelId: string): Promise<boolean> {
    const modelInfo = await this.getModelInfo(modelId);
    if (!modelInfo) return false;

    const provider = this.providers.get(modelInfo.provider);
    if (!provider) return false;

    return await provider.isAvailable();
  }

  /**
   * Get provider configuration
   */
  getProviderConfig(type: AIProviderType): AIProviderConfig | null {
    const provider = this.providers.get(type);
    return provider ? { ...provider['config'] } : null;
  }

  /**
   * Update provider configuration
   */
  updateProviderConfig(type: AIProviderType, config: Partial<AIProviderConfig>): void {
    const provider = this.providers.get(type);
    if (provider) {
      provider.updateConfig(config);
    }
  }

  /**
   * Get the default model based on provider priority and availability
   * Priority order: gemini > openai > ollama
   */
  async getDefaultModel(): Promise<string | null> {
    const providerPriority: AIProviderType[] = [
      AIProviderType.GEMINI,
      AIProviderType.OPENAI,
      AIProviderType.OLLAMA
    ];

    for (const providerType of providerPriority) {
      const provider = this.providers.get(providerType);
      if (!provider) continue;

      try {
        const isAvailable = await provider.isAvailable();
        if (isAvailable) {
          // Get the default model from provider using the proper method
          const defaultModel = provider.getDefaultModel();
          if (defaultModel) {
            return defaultModel;
          }
        }
      } catch (error) {
        // Continue to next provider if current one fails
        continue;
      }
    }

    return null;
  }

  /**
   * Get health status of all providers
   */
  async getHealthStatus(): Promise<Record<AIProviderType, { available: boolean; error?: string }>> {
    const status: Record<string, { available: boolean; error?: string }> = {};

    for (const [providerType, provider] of this.providers) {
      try {
        const available = await provider.isAvailable();
        status[providerType] = { available };
      } catch (error) {
        status[providerType] = { 
          available: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }
    }

    return status as Record<AIProviderType, { available: boolean; error?: string }>;
  }
}

/**
 * Global AI Service Manager Instance
 * Singleton pattern for shared usage across the application
 */

// Factory function to create a new AIServiceManager instance safely
const aiServiceManagerSingleton = () => {
  try {
    return new AIServiceManager();
  } catch (error) {
    console.error('Failed to initialize AI Service Manager:', error);
    console.warn('AI features will be unavailable. Please configure at least one AI provider.');
    return null;
  }
}

// Extend globalThis type to include our singleton instance
// This provides TypeScript typing for the global variable
declare const globalThis: {
  aiServiceManagerGlobal: ReturnType<typeof aiServiceManagerSingleton>;
} & typeof global;

// Singleton implementation:
// - First check if instance exists on globalThis (for development hot reloads)
// - If not found, create a new instance using the factory function
// - This ensures only one instance exists across the entire application
// - Returns null if initialization fails to prevent application crashes
const aiServiceManager = globalThis.aiServiceManagerGlobal ?? aiServiceManagerSingleton();

// Export the singleton instance directly (not a function)
// Usage: import aiServiceManager from './ai-service-manager'
export default aiServiceManager;

// Development optimization: Store instance on globalThis to persist across hot reloads
// This prevents losing provider initialization and state during development
// In production, we don't store on globalThis to keep the global namespace clean
if (process.env.NODE_ENV !== 'production') {
  globalThis.aiServiceManagerGlobal = aiServiceManager;
}