import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Symbol = {
  name: string;
  description: string;
};

type Emotion = {
  name: string;
  intensity: number;
  description: string;
};

type Theme = {
  name: string;
  description: string;
};

type DreamAnalysis = {
  symbols: Symbol[];
  emotions: Emotion[];
  themes: Theme[];
};

export async function analyzeText(content: string): Promise<DreamAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a dream analysis expert. Analyze the provided dream and extract:
          1. Key symbols and their meanings
          2. Emotions present and their intensity (0-1)
          3. Major themes
          
          Format your response as a JSON object with the following structure:
          {
            "symbols": [{ "name": string, "description": string }],
            "emotions": [{ "name": string, "intensity": number, "description": string }],
            "themes": [{ "name": string, "description": string }]
          }`,
        },
        {
          role: "user",
          content: content,
        },
      ],
      response_format: { type: "json_object" },
    });

    const analysis = JSON.parse(
      response.choices[0].message.content || "{}"
    ) as DreamAnalysis;

    return {
      symbols: analysis.symbols || [],
      emotions: analysis.emotions || [],
      themes: analysis.themes || [],
    };
  } catch (error) {
    console.error("Failed to analyze dream:", error);
    return {
      symbols: [],
      emotions: [],
      themes: [],
    };
  }
} 