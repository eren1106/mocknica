import { GoogleGenAI } from "@google/genai";
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
 * Gemini AI Provider Implementation
 *
 * Implements the AIProvider interface for Google's Gemini AI service
 */
export class GeminiProvider extends AIProvider {
  private client: GoogleGenAI | null = null;

  constructor(config: AIProviderConfig = {}) {
    super(AIProviderType.GEMINI, {
      apiKey: process.env.GEMINI_API_KEY,
      defaultModel: (process.env.GEMINI_MODEL as AIModelId) || "gemini-2.0-flash",
      timeout: 30000,
      maxRetries: 3,
      ...config,
    });
    this.validateConfig();
  }

  protected validateConfig(): void {
    if (!this.config.apiKey) {
      throw new AIConfigurationError(
        "Gemini API key is required",
        AIProviderType.GEMINI
      );
    }
  }

  private getClient(): GoogleGenAI {
    if (!this.client) {
      this.client = new GoogleGenAI({
        apiKey: this.config.apiKey!,
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

      // Prepare the prompt with system context if provided
      const prompt = request.systemPrompt
        ? `${request.systemPrompt}\n\n${request.prompt}`
        : request.prompt;

      const completion = await client.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      });

      if (!completion.text) {
        throw new AIGenerationError(
          "No response generated from Gemini",
          AIProviderType.GEMINI
        );
      }

      return {
        content: completion.text,
        model: model,
        provider: AIProviderType.GEMINI,
      };
    } catch (error) {
      throw new AIGenerationError(
        `Gemini generation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        AIProviderType.GEMINI,
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
          id: 'gemini-2.0-flash',
          name: 'Gemini 2.0 Flash',
          provider: AIProviderType.GEMINI,
          description: 'Fast and efficient for most tasks',
          maxTokens: 8192,
          isLocal: false
        },
        // {
        //   id: 'gemini-2.0-flash-exp',
        //   name: 'Gemini 2.0 Flash (Experimental)',
        //   provider: AIProviderType.GEMINI,
        //   description: 'Experimental version with latest features',
        //   maxTokens: 8192,
        //   isLocal: false
        // },
        {
          id: 'gemini-1.5-pro',
          name: 'Gemini 1.5 Pro',
          provider: AIProviderType.GEMINI,
          description: 'High-performance model for complex tasks',
          maxTokens: 2048000,
          isLocal: false
        },
        {
          id: 'gemini-pro',
          name: 'Gemini Pro',
          provider: AIProviderType.GEMINI,
          description: 'Balanced performance for general tasks',
          maxTokens: 1048576,
          isLocal: false
        }
      ];
    } catch (error) {
      console.warn("Could not fetch Gemini models, using defaults:", error);
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
      console.warn("Gemini provider not available:", error);
      return false;
    }
  }
}
