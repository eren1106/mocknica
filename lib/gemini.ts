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

const gemini = globalThis.__gemini ?? createGeminiClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__gemini = gemini;
}

export default gemini;
