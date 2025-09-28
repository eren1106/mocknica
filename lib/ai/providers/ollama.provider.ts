import { Ollama } from "ollama";
import {
  AIProvider,
  AIProviderType,
  AIProviderConfig,
  AIGenerationRequest,
  AIGenerationResponse,
  AIModel,
  AIConfigurationError,
  AIGenerationError,
  AIModelId,
} from "../types";

/**
 * Ollama AI Provider Implementation
 *
 * Implements the AIProvider interface for locally hosted Ollama models
 * Uses the official Ollama JavaScript SDK for better reliability and features
 */
export class OllamaProvider extends AIProvider {
  private client: Ollama | null = null;

  constructor(config: AIProviderConfig = {}) {
    super(AIProviderType.OLLAMA, {
      baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
      defaultModel: (process.env.OLLAMA_MODEL as AIModelId) || "llama3.2",
      timeout: 60000, // Longer timeout for local models
      maxRetries: 2,
      ...config,
    });
    this.validateConfig();
  }

  protected validateConfig(): void {
    if (!this.config.baseUrl) {
      throw new AIConfigurationError(
        "Ollama base URL is required",
        AIProviderType.OLLAMA
      );
    }
  }

  private getClient(): Ollama {
    if (!this.client) {
      this.client = new Ollama({
        host: this.config.baseUrl || "http://localhost:11434",
      });
    }
    return this.client;
  }

  async generateText(
    request: AIGenerationRequest
  ): Promise<AIGenerationResponse> {
    try {
      const client = this.getClient();
      const model = request.model || this.config.defaultModel!;

      // Prepare messages for Ollama format
      const messages: any[] = [];

      if (request.systemPrompt) {
        messages.push({
          role: "system",
          content: request.systemPrompt,
        });
      }

      messages.push({
        role: "user",
        content: request.prompt,
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

      let content = response.message?.content;

      if (!content) {
        throw new AIGenerationError(
          "No response from Ollama",
          AIProviderType.OLLAMA
        );
      }

      // Clean up the content by removing <think></think> tags and other potential issues
      content = content
        .replace(/<think>[\s\S]*?<\/think>/gi, '') // Remove <think></think> tags (case insensitive)
        .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '') // Also handle <thinking> tags
        .trim(); // Remove leading/trailing whitespace

      return {
        content,
        model,
        provider: AIProviderType.OLLAMA,
        usage: {
          promptTokens: response.prompt_eval_count,
          completionTokens: response.eval_count,
          totalTokens:
            (response.prompt_eval_count || 0) + (response.eval_count || 0),
        },
      };
    } catch (error) {
      throw new AIGenerationError(
        `Ollama generation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
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

      return [
        {
          id: "llama3.2",
          name: "Llama 3.2",
          provider: AIProviderType.OLLAMA,
          description: "Meta's latest Llama model with improved performance",
          maxTokens: 8192,
          isLocal: true,
        },
        {
          id: "deepseek-r1:7b",
          name: "DeepSeek R1:7B",
          provider: AIProviderType.OLLAMA,
          description: "DeepSeek's latest R1 model",
          maxTokens: 8192,
          isLocal: true,
        },
        {
          id: "deepseek-r1:1.5b",
          name: "DeepSeek R1:1.5B",
          provider: AIProviderType.OLLAMA,
          description: "DeepSeek's latest R1 model",
          maxTokens: 8192,
          isLocal: true,
        },
        {
          id: "llama3.1",
          name: "Llama 3.1",
          provider: AIProviderType.OLLAMA,
          description: "Previous version of Meta's Llama model",
          maxTokens: 8192,
          isLocal: true,
        },
        {
          id: "mistral",
          name: "Mistral 7B",
          provider: AIProviderType.OLLAMA,
          description: "Fast and efficient model from Mistral AI",
          maxTokens: 8192,
          isLocal: true,
        },
      ];
    } catch (error) {
      console.debug(
        "Could not fetch Ollama models:",
        error instanceof Error ? error.message : "Unknown error"
      );
    }

    return [];
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Check if we have a valid configuration first
      if (!this.config.baseUrl) {
        return false;
      }

      const client = this.getClient();

      // Set a timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Connection timeout")), 5000);
      });

      // Try to list models to verify Ollama is running
      await Promise.race([client.list(), timeoutPromise]);

      return true;
    } catch (error) {
      // Don't log as warning since this is expected when Ollama isn't running
      console.debug(
        "Ollama provider not available:",
        error instanceof Error ? error.message : "Unknown error"
      );
      return false;
    }
  }
}
