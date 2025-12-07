import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Initialize carefully to avoid crashes if key is missing in dev
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const generateDailyBriefing = async (tasks: string[], events: string[]): Promise<string> => {
  if (!ai) return "Gemini API Key not configured. Unable to generate briefing.";

  try {
    const prompt = `
      You are a futuristic Life OS assistant.
      Based on the following tasks: ${JSON.stringify(tasks)}
      And these events: ${JSON.stringify(events)}
      
      Generate a concise, 2-sentence highly motivational morning briefing in a cyberpunk/professional tone.
      Do not use formatting like markdown bolding. Just plain text.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Systems nominal. Ready for input.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Connection to AI Core unstable. Proceed manually.";
  }
};

export const quickCaptureProcess = async (input: string): Promise<{ category: string, suggestedAction: string }> => {
  if (!ai) return { category: 'Unsorted', suggestedAction: 'Review manually' };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Classify this input into a category (Work, Personal, Finance, Idea) and a short 3-word action: "${input}". Return JSON.`,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("No response");
    return JSON.parse(text);
  } catch (e) {
    return { category: 'General', suggestedAction: 'Save Note' };
  }
}

export const parseFinanceInput = async (input: string): Promise<{ title: string, amount: number, type: 'income' | 'expense', category: string }> => {
  if (!ai) return { title: input, amount: 0, type: 'expense', category: 'General' };

  try {
    const prompt = `
      Analyze this financial statement: "${input}".
      Extract the following fields into JSON:
      - title (short description)
      - amount (number only)
      - type ('income' or 'expense')
      - category (e.g., Food, Transport, Work, Tech, Health, Entertainment)
      
      If amount is missing, set to 0. If unsure of type, guess based on context.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    return JSON.parse(text);
  } catch (e) {
    console.error("AI Parse Error", e);
    return { title: input, amount: 0, type: 'expense', category: 'General' };
  }
}