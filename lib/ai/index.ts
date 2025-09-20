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
export { AIServiceManager, getAIServiceManager, resetAIServiceManager } from './ai-service-manager';

// Convenience functions
export { createAIServiceManager } from './utils';