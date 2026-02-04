
import { GoogleGenAI } from "@google/genai";
import { EventData } from "../types";

export interface AIResponse {
  text: string;
  sources: { title: string; uri: string }[];
}

export const queryAIAboutEvents = async (query: string, events: EventData[]): Promise<AIResponse> => {
  // Use the API key exclusively from process.env.API_KEY as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const eventContext = events.map(e => 
    `- ${e.title} (${e.type}) on ${e.date} at ${e.time}. Location: ${e.room || 'N/A'}, ${e.location || 'N/A'}. Details: ${e.description}`
  ).join('\n');
  
  const systemInstruction = `
    You are the CSE Department's "Vision AI". 
    Context: Today is ${new Date().toLocaleDateString()}.
    Current Departmental Schedule:
    ${eventContext}
    
    Tasks:
    1. Answer queries about the schedule.
    2. If the user asks for study resources, maps, or general knowledge related to their subjects (e.g. "What is Operating Systems?"), use Google Search.
    3. Be professional and concise.
  `;

  try {
    // Calling generateContent directly on ai.models
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: query,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        temperature: 0.7,
      },
    });
    
    // Using the .text property directly as recommended
    const text = response.text || "I couldn't process that request.";
    // Extracting grounding chunks for search sources
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web)
      .filter((web: any) => web && web.uri) || [];

    return { text, sources };
  } catch (error) {
    console.error("AI Query Error:", error);
    return { 
      text: "The high-performance AI engine is currently processing a heavy load. Please try your request again shortly.", 
      sources: [] 
    };
  }
};
