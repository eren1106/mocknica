import OpenAI from "openai";
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
 * OpenAI AI Provider Implementation
 *
 * Implements the AIProvider interface for OpenAI's GPT models
 * Uses the official OpenAI Node.js SDK for better reliability and features
 */
export class OpenAIProvider extends AIProvider {
  private client: OpenAI | null = null;

  constructor(config: AIProviderConfig = {}) {
    super(AIProviderType.OPENAI, {
      apiKey: process.env.OPENAI_API_KEY,
      defaultModel: (process.env.OPENAI_MODE as AIModelId) || "gpt-4o-mini",
      baseUrl: "https://api.openai.com/v1",
      timeout: 30000,
      maxRetries: 3,
      ...config,
    });
    this.validateConfig();
  }

  protected validateConfig(): void {
    if (!this.config.apiKey) {
      throw new AIConfigurationError(
        "OpenAI API key is required",
        AIProviderType.OPENAI
      );
    }
  }

  private getClient(): OpenAI {
    if (!this.client) {
      this.client = new OpenAI({
        apiKey: this.config.apiKey!,
        baseURL: this.config.baseUrl,
        timeout: this.config.timeout || 30000,
        maxRetries: this.config.maxRetries || 3,
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

      // Prepare messages using OpenAI's message format
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

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

      // Use the official OpenAI SDK
      const completion = await client.chat.completions.create({
        model,
        messages,
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 4096,
      });

      const choice = completion.choices[0];
      if (!choice?.message?.content) {
        throw new AIGenerationError(
          "No content in OpenAI response",
          AIProviderType.OPENAI
        );
      }

      return {
        content: choice.message.content,
        model: model,
        provider: AIProviderType.OPENAI,
        usage: {
          promptTokens: completion.usage?.prompt_tokens,
          completionTokens: completion.usage?.completion_tokens,
          totalTokens: completion.usage?.total_tokens,
        },
      };
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        throw new AIGenerationError(
          `OpenAI API error: ${error.status} ${error.message}`,
          AIProviderType.OPENAI,
          error
        );
      }

      throw new AIGenerationError(
        `OpenAI generation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        AIProviderType.OPENAI,
        error
      );
    }
  }

  async getAvailableModels(): Promise<AIModel[]> {
    try {
      const available = await this.isAvailable();
      if (!available) return [];

      return [
        {
          id: "gpt-4o",
          name: "GPT-4o",
          provider: AIProviderType.OPENAI,
          description: "Most advanced multimodal flagship model",
          maxTokens: 128000,
          isLocal: false,
        },
        {
          id: "gpt-4o-mini",
          name: "GPT-4o Mini",
          provider: AIProviderType.OPENAI,
          description: "Affordable and intelligent small model",
          maxTokens: 128000,
          isLocal: false,
        },
        {
          id: "gpt-4-turbo",
          name: "GPT-4 Turbo",
          provider: AIProviderType.OPENAI,
          description: "Previous generation flagship model",
          maxTokens: 128000,
          isLocal: false,
        },
        {
          id: "gpt-3.5-turbo",
          name: "GPT-3.5 Turbo",
          provider: AIProviderType.OPENAI,
          description: "Fast, cost-effective model",
          maxTokens: 16385,
          isLocal: false,
        },
      ];
    } catch (error) {
      console.warn("Could not fetch OpenAI models:", error);
      return [];
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      if (!this.config.apiKey) {
        return false;
      }

      const client = this.getClient();

      // Try a simple API call to verify the key works
      await client.models.list();
      return true;
    } catch (error) {
      console.warn("OpenAI provider not available:", error);
      return false;
    }
  }
}
