import { apiResponse, errorResponse } from "../_helpers/api-response";
import { NextRequest } from "next/server";
import { Ollama } from "ollama";

// Initialize the Ollama client
const ollama = new Ollama({
  host: process.env.OLLAMA_HOST || "http://localhost:11434",
});

export async function POST(req: NextRequest) {
  try {
    const { prompt: userInput } = await req.json();

    const systemPrompt = `
  You are a JSON-only generator. You must output only valid JSON—no markdown, no code fences, no explanations.
  Whenever you respond, produce exactly one JSON object.
  `;
    const prompt = [
      systemPrompt.trim(),
      `User request: ${userInput.trim()}`,
    ].join("\n\n");

    const completion = await ollama.generate({
      model: process.env.OLLAMA_MODEL || "llama3.2",
      prompt,
    });

    const response = JSON.parse(completion.response);
    return apiResponse(req, { data: response });
  } catch (error) {
    return errorResponse(req, { error });
  }
}
