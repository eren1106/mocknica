import { Ollama } from 'ollama';
import {
  AIProvider,
  AIProviderType,
  AIProviderConfig,
  AIGenerationRequest,
  AIGenerationResponse,
  AIModel,
  AIConfigurationError,
  AIGenerationError
} from '../types';

/**
 * Ollama AI Provider Implementation
 * 
 * Implements the AIProvider interface for locally hosted Ollama models
 * Uses the official Ollama JavaScript SDK for better reliability and features
 */
export class OllamaProvider extends AIProvider {
  private client: Ollama | null = null;

  constructor(config: AIProviderConfig) {
    super(AIProviderType.OLLAMA, {
      defaultModel: 'llama3.2',
      baseUrl: 'http://localhost:11434',
      timeout: 60000, // Longer timeout for local models
      maxRetries: 2,
      ...config
    });
    this.validateConfig();
  }

  protected validateConfig(): void {
    if (!this.config.baseUrl) {
      throw new AIConfigurationError(
        'Ollama base URL is required',
        AIProviderType.OLLAMA
      );
    }
  }

  private getClient(): Ollama {
    if (!this.client) {
      this.client = new Ollama({
        host: this.config.baseUrl || 'http://localhost:11434',
      });
    }
    return this.client;
  }

  async generateText(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    try {
      const client = this.getClient();
      const model = request.model || this.config.defaultModel!;

      // Prepare messages for Ollama format
      const messages: any[] = [];
      
      if (request.systemPrompt) {
        messages.push({
          role: 'system',
          content: request.systemPrompt
        });
      }

      messages.push({
        role: 'user',
        content: request.prompt
      });

      // Use the official Ollama SDK
      const response = await client.chat({
        model,
        messages,
        options: {
          temperature: request.temperature || 0.7,
          num_predict: request.maxTokens || 4096,
        },
        stream: false,
      });

      if (!response.message?.content) {
        throw new AIGenerationError(
          'No response from Ollama',
          AIProviderType.OLLAMA
        );
      }

      return {
        content: response.message.content,
        model,
        provider: AIProviderType.OLLAMA,
        usage: {
          promptTokens: response.prompt_eval_count,
          completionTokens: response.eval_count,
          totalTokens: (response.prompt_eval_count || 0) + (response.eval_count || 0),
        }
      };
    } catch (error) {
      throw new AIGenerationError(
        `Ollama generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        AIProviderType.OLLAMA,
        error
      );
    }
  }

  async getAvailableModels(): Promise<AIModel[]> {
    try {
      // Check if provider is available first
      const available = await this.isAvailable();
      if (!available) return []; // Return empty array if Ollama isn't available

      const client = this.getClient();
      
      // Use the official SDK to get models with timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Models fetch timeout')), 10000);
      });

      const response = await Promise.race([
        client.list(),
        timeoutPromise
      ]);
      
      if (response.models && Array.isArray(response.models)) {
        return response.models.map((model) => ({
          id: model.name,
          name: model.name,
          provider: AIProviderType.OLLAMA,
          description: model.name,
          maxTokens: model.size,
          isLocal: true
        }));
      }
    } catch (error) {
      console.debug('Could not fetch Ollama models:', error instanceof Error ? error.message : 'Unknown error');
    }

    return [];
  }

  // private getDefaultModels(): AIModel[] {
  //   return [
  //     {
  //       id: 'llama3.2',
  //       name: 'Llama 3.2',
  //       provider: AIProviderType.OLLAMA,
  //       description: 'Meta\'s latest Llama model with improved performance',
  //       maxTokens: 8192,
  //       isLocal: true
  //     },
  //     {
  //       id: 'llama3.1',
  //       name: 'Llama 3.1',
  //       provider: AIProviderType.OLLAMA,
  //       description: 'Previous version of Meta\'s Llama model',
  //       maxTokens: 8192,
  //       isLocal: true
  //     },
  //     {
  //       id: 'codellama',
  //       name: 'Code Llama',
  //       provider: AIProviderType.OLLAMA,
  //       description: 'Specialized for code generation and understanding',
  //       maxTokens: 4096,
  //       isLocal: true
  //     },
  //     {
  //       id: 'mistral',
  //       name: 'Mistral 7B',
  //       provider: AIProviderType.OLLAMA,
  //       description: 'Fast and efficient model from Mistral AI',
  //       maxTokens: 8192,
  //       isLocal: true
  //     },
  //     {
  //       id: 'neural-chat',
  //       name: 'Neural Chat',
  //       provider: AIProviderType.OLLAMA,
  //       description: 'Optimized for conversational AI tasks',
  //       maxTokens: 4096,
  //       isLocal: true
  //     },
  //     {
  //       id: 'starcode',
  //       name: 'StarCoder',
  //       provider: AIProviderType.OLLAMA,
  //       description: 'Specialized for code completion and generation',
  //       maxTokens: 4096,
  //       isLocal: true
  //     }
  //   ];
  // }

  // private formatModelName(modelName: string): string {
  //   // Clean up model names for display
  //   return modelName
  //     .replace(/:/g, ' ')
  //     .replace(/-/g, ' ')
  //     .split(' ')
  //     .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  //     .join(' ');
  // }

  // private getModelDescription(modelName: string, details?: any): string {
  //   const name = modelName.toLowerCase();
    
  //   if (name.includes('llama')) return 'Meta\'s Llama family model';
  //   if (name.includes('codellama')) return 'Code-specialized Llama model';
  //   if (name.includes('mistral')) return 'Mistral AI language model';
  //   if (name.includes('neural-chat')) return 'Conversational AI model';
  //   if (name.includes('starcode')) return 'Code generation model';
  //   if (name.includes('phi')) return 'Microsoft\'s Phi small language model';
  //   if (name.includes('gemma')) return 'Google\'s Gemma model';
    
  //   return details?.description || `Local Ollama model - ${modelName}`;
  // }

  // private getModelMaxTokens(modelName: string): number {
  //   const name = modelName.toLowerCase();
    
  //   // Estimate based on model name patterns
  //   if (name.includes('32k')) return 32768;
  //   if (name.includes('16k')) return 16384;
  //   if (name.includes('8k')) return 8192;
  //   if (name.includes('llama3')) return 8192;
  //   if (name.includes('mistral')) return 8192;
    
  //   return 4096; // Default
  // }

  async isAvailable(): Promise<boolean> {
    try {
      // Check if we have a valid configuration first
      if (!this.config.baseUrl) {
        return false;
      }

      const client = this.getClient();
      
      // Set a timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout')), 5000);
      });

      // Try to list models to verify Ollama is running
      await Promise.race([
        client.list(),
        timeoutPromise
      ]);
      
      return true;
    } catch (error) {
      // Don't log as warning since this is expected when Ollama isn't running
      console.debug('Ollama provider not available:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }
}