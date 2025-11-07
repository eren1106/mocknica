import { AIProviderType } from './types';
import { NextRequest } from 'next/server';

/**
 * Extract API keys from request headers
 * These keys can be used to create a custom AIServiceManager instance
 * 
 * @example
 * const customKeys = extractApiKeysFromHeaders(req);
 * const manager = new AIServiceManager(customKeys);
 */
export function extractApiKeysFromHeaders(req: NextRequest): Partial<Record<AIProviderType, string>> {
  const keys: Partial<Record<AIProviderType, string>> = {};

  const geminiKey = req.headers.get('X-Gemini-API-Key');
  const openaiKey = req.headers.get('X-OpenAI-API-Key');

  if (geminiKey) {
    keys[AIProviderType.GEMINI] = geminiKey;
  }

  if (openaiKey) {
    keys[AIProviderType.OPENAI] = openaiKey;
  }

  return keys;
}
