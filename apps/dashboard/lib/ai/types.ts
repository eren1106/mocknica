/**
 * AI Provider Types and Interfaces
 * 
 * This module defines the core types and interfaces for AI providers
 * following the Strategy pattern for clean architecture.
 */

export enum AIProviderType {
  GEMINI = 'gemini',
  OPENAI = 'openai',
  OLLAMA = 'ollama'
}

export type GeminiModelId = "gemini-2.0-flash" | "gemini-2.0-flash-exp" | "gemini-pro" | "gemini-1.5-pro";
export type OpenAIModelId = "gpt-4o-mini" | "gpt-4o" | "gpt-4-turbo" | "gpt-4" | "gpt-3.5-turbo";
export type OllamaModelId = "llama3.2" | "llama3.1" | "deepseek-r1:7b" | "deepseek-r1:1.5b" | "mistral";
export type AIModelId = GeminiModelId | OpenAIModelId | OllamaModelId;

export interface AIModel {
  id: AIModelId;
  name: string;
  provider: AIProviderType;
  description?: string;
  maxTokens?: number;
  isLocal?: boolean;
}

export interface AIGenerationRequest {
  prompt: string;
  model?: AIModelId;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export interface AIGenerationResponse {
  content: string;
  model: AIModelId;
  provider: AIProviderType;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export interface AIProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: AIModelId;
  timeout?: number;
  maxRetries?: number;
}

/**
 * Abstract base class for AI providers
 * Implements the Strategy pattern for different AI services
 */
export abstract class AIProvider {
  protected config: AIProviderConfig;
  public readonly type: AIProviderType;

  constructor(type: AIProviderType, config: AIProviderConfig) {
    this.type = type;
    this.config = config;
  }

  /**
   * Generate text completion using the AI provider
   */
  abstract generateText(request: AIGenerationRequest): Promise<AIGenerationResponse>;

  /**
   * Get available models for this provider
   */
  abstract getAvailableModels(): Promise<AIModel[]>;

  /**
   * Check if the provider is properly configured and available
   */
  abstract isAvailable(): Promise<boolean>;

  /**
   * Validate provider configuration
   */
  protected abstract validateConfig(): void;

  /**
   * Get the default model for this provider
   */
  public getDefaultModel(): AIModelId | undefined {
    return this.config.defaultModel;
  }

  /**
   * Update provider configuration
   */
  public updateConfig(config: Partial<AIProviderConfig>): void {
    this.config = { ...this.config, ...config };
    this.validateConfig();
  }
}

/**
 * Error types for AI operations
 */
export class AIProviderError extends Error {
  constructor(
    message: string,
    public provider: AIProviderType,
    public code?: string,
    public cause?: unknown
  ) {
    super(message);
    this.name = 'AIProviderError';
  }
}

export class AIConfigurationError extends AIProviderError {
  constructor(message: string, provider: AIProviderType, cause?: unknown) {
    super(message, provider, 'CONFIGURATION_ERROR', cause);
    this.name = 'AIConfigurationError';
  }
}

export class AIGenerationError extends AIProviderError {
  constructor(message: string, provider: AIProviderType, cause?: unknown) {
    super(message, provider, 'GENERATION_ERROR', cause);
    this.name = 'AIGenerationError';
  }
}