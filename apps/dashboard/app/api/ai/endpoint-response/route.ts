import { aiServiceManager } from "@/lib/ai";
import { apiResponse, errorResponse } from "../../_helpers/api-response";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt: userInput, model } = await req.json();

    if (!aiServiceManager) {
      return errorResponse(req, { 
        message: 'AI services are not available. Please configure at least one AI provider (GEMINI_API_KEY, OPENAI_API_KEY, or run Ollama locally).',
        statusCode: 503
      });
    }

    const systemPrompt = `
  You are a JSON-only generator. You must output only valid JSON—no markdown, no code fences, no explanations, no \`\`\`json blocks.
  
  Example of correct response format:
  {"name": "John Doe", "age": 30, "email": "john@example.com"}
  
  Your response must start with { and end with } - nothing else.
  `;
    const prompt = [
      systemPrompt.trim(),
      `User request: ${userInput.trim()}`,
    ].join("\n\n");

    const completion = await aiServiceManager.generateText({
      prompt,
      model,
    });

    if (!completion.content) {
      throw new Error("No response from AI service");
    }

    console.log("AI response:", completion.content);

    // Clean the response content to handle any remaining formatting issues
    const cleanedContent = completion.content
      .replace(/<think>[\s\S]*?<\/think>/gi, '') // Remove <think></think> tags
      .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '') // Remove <thinking></thinking> tags
      .trim(); // Remove leading/trailing whitespace

    console.log("Cleaned response:", cleanedContent);

    let response;
    try {
      // Try to parse the response as JSON directly
      response = JSON.parse(cleanedContent);
    } catch (parseError) {
      // If JSON parsing fails, try to extract JSON from markdown code blocks
      const jsonMatch = cleanedContent.match(/```json\s*([\s\S]*?)\s*```/) || 
                       cleanedContent.match(/```\s*([\s\S]*?)\s*```/) ||
                       cleanedContent.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        try {
          let jsonContent = jsonMatch[1] || jsonMatch[0];
          // Additional cleaning for extracted JSON
          jsonContent = jsonContent
            .replace(/<think>[\s\S]*?<\/think>/gi, '')
            .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
            .trim();
          response = JSON.parse(jsonContent);
        } catch (extractError) {
          throw new Error(
            `AI returned invalid JSON after extraction. Original: ${completion.content.substring(0, 200)}... Cleaned: ${cleanedContent.substring(0, 200)}...`
          );
        }
      } else {
        throw new Error(
          `AI response does not contain valid JSON. Original: ${completion.content.substring(0, 200)}... Cleaned: ${cleanedContent.substring(0, 200)}...`
        );
      }
    }

    return apiResponse(req, { data: response });
  } catch (error) {
    return errorResponse(req, { error });
  }
}
