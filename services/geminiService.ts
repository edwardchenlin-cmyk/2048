import { GoogleGenAI } from "@google/genai";
import { Grid } from "../types";

const API_KEY = process.env.API_KEY;

// We wrap this in a try-catch block to handle cases where the key might be missing in certain envs
let ai: GoogleGenAI | null = null;
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
}

export const getGeminiHint = async (grid: Grid, score: number): Promise<string> => {
  if (!ai) {
    return "API Key missing. Cannot generate hint.";
  }

  try {
    const flatGrid = grid.map(row => row.join(',')).join('\n');
    
    const prompt = `
      I am playing 2048. Here is the current state of the 4x4 board (0 represents an empty cell):
      
      ${flatGrid}
      
      Current Score: ${score}.
      
      Analyze the board. Provide a very short, strategic hint (max 15 words) and suggest the single best next move (UP, DOWN, LEFT, or RIGHT).
      Format: "Move [DIRECTION]: [Reason]"
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        maxOutputTokens: 50,
        temperature: 0.2, // Low temperature for deterministic strategy
      }
    });

    return response.text || "Could not generate a hint.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The AI is currently offline or encountered an error.";
  }
};