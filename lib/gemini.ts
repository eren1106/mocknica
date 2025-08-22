import { GoogleGenAI } from '@google/genai';

const createGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }
  
  return new GoogleGenAI({ apiKey });
};

declare global {
  // eslint-disable-next-line no-var
  var __gemini: GoogleGenAI | undefined;
}

// Lazy initialization - only create client when accessed
const getGeminiClient = () => {
  if (globalThis.__gemini) {
    return globalThis.__gemini;
  }
  
  const client = createGeminiClient();
  
  if (process.env.NODE_ENV !== 'production') {
    globalThis.__gemini = client;
  }
  
  return client;
};

export default getGeminiClient;
