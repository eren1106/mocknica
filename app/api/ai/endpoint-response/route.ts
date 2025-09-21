import { apiResponse, errorResponse } from "../../_helpers/api-response";
import { NextRequest } from "next/server";
import { createAIServiceManager } from "@/lib/ai/utils";

export async function POST(req: NextRequest) {
  try {
    const { prompt: userInput, model } = await req.json();

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

    const aiManager = createAIServiceManager();
    const completion = await aiManager.generateText({
      prompt,
      model,
    });

    if (!completion.content) {
      throw new Error("No response from AI service");
    }

    console.log("AI response:", completion.content);

    let response;
    try {
      // Try to parse the response as JSON directly
      response = JSON.parse(completion.content);
    } catch (parseError) {
      // If JSON parsing fails, try to extract JSON from markdown code blocks
      const jsonMatch = completion.content.match(/```json\s*([\s\S]*?)\s*```/) || 
                       completion.content.match(/```\s*([\s\S]*?)\s*```/) ||
                       completion.content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        try {
          const jsonContent = jsonMatch[1] || jsonMatch[0];
          response = JSON.parse(jsonContent);
        } catch (extractError) {
          throw new Error(
            `AI returned invalid JSON. Response: ${completion.content.substring(0, 200)}...`
          );
        }
      } else {
        throw new Error(
          `AI response does not contain valid JSON. Response: ${completion.content.substring(0, 200)}...`
        );
      }
    }

    return apiResponse(req, { data: response });
  } catch (error) {
    return errorResponse(req, { error });
  }
}
