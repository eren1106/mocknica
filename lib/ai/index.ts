/**
 * AI Module Exports
 * 
 * Centralized exports for the AI provider system
 */

// Core types and interfaces
export * from './types';

// Provider implementations
export { GeminiProvider } from './providers/gemini.provider';
export { OpenAIProvider } from './providers/openai.provider';
export { OllamaProvider } from './providers/ollama.provider';

// Service manager
export { AIServiceManager } from './ai-service-manager';

// Singleton instance (recommended for most use cases)
export { default as aiServiceManager } from './ai-service-manager';