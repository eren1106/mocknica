import { apiResponse, errorResponse } from "../../_helpers/api-response";
import { NextRequest } from "next/server";
import getGeminiClient from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { prompt: userInput } = await req.json();

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

    const gemini = getGeminiClient();
    const completion = await gemini.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
      contents: prompt,
    });

    if (!completion.text) {
      throw new Error("No response from Gemini API");
    }

    console.log("Gemini response:", completion.text);

    let response;
    try {
      // Try to parse the response as JSON directly
      response = JSON.parse(completion.text);
    } catch (parseError) {
      // If JSON parsing fails, try to extract JSON from markdown code blocks
      const jsonMatch = completion.text.match(/```json\s*([\s\S]*?)\s*```/) || 
                       completion.text.match(/```\s*([\s\S]*?)\s*```/) ||
                       completion.text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        try {
          const jsonContent = jsonMatch[1] || jsonMatch[0];
          response = JSON.parse(jsonContent);
        } catch (extractError) {
          throw new Error(
            `AI returned invalid JSON. Response: ${completion.text.substring(0, 200)}...`
          );
        }
      } else {
        throw new Error(
          `AI response does not contain valid JSON. Response: ${completion.text.substring(0, 200)}...`
        );
      }
    }

    return apiResponse(req, { data: response });
  } catch (error) {
    return errorResponse(req, { error });
  }
}
