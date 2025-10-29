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

  console.log('🔍 Extracting API keys from headers...');
  console.log('- X-Gemini-API-Key header:', geminiKey ? `Found (${geminiKey.substring(0, 10)}...)` : 'Not found');
  console.log('- X-OpenAI-API-Key header:', openaiKey ? `Found (${openaiKey.substring(0, 10)}...)` : 'Not found');

  if (geminiKey) {
    keys[AIProviderType.GEMINI] = geminiKey;
  }

  if (openaiKey) {
    keys[AIProviderType.OPENAI] = openaiKey;
  }

  return keys;
}
