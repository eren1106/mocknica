import { Ollama } from 'ollama';

const createOllamaClient = () => {
  return new Ollama({
    host: process.env.OLLAMA_HOST || "http://localhost:11434",
  });
};

declare global {
  var __ollama: Ollama | undefined;
}

const ollama = globalThis.__ollama ?? createOllamaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__ollama = ollama;
}

export default ollama;