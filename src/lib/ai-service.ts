import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { VertexAI } from '@google-cloud/vertexai';
import { GoogleAuth } from 'google-auth-library';

// Initialize AI clients
const openai = new OpenAI();
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const vertex = new VertexAI({project: process.env.GOOGLE_CLOUD_PROJECT || '', location: process.env.GOOGLE_CLOUD_LOCATION || ''});
const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-platform']
});

interface AIResponse {
  text: string;
  tokens?: number;
  model: string;
}

interface ImageResponse {
  url: string;
  provider: string;
}

interface StorySection {
  title?: string;
  content?: string;
  imagePrompt?: string;
}

interface ParsedStoryJson {
  title?: string;
  subtitle?: string;
  introduction?: string;
  themes?: string[];
  sections?: StorySection[];
  conclusion?: string;
  interpretation?: string;
}

export async function generateText(prompt: string): Promise<AIResponse> {
  const provider = process.env.AI_PROVIDER || 'openai';
  
  if (provider === 'openai') {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    });
    
    return {
      text: response.choices[0]?.message?.content || '',
      tokens: response.usage?.total_tokens,
      model: response.model
    };
  } else {
    const model = gemini.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return {
      text: response.text(),
      model: 'gemini-pro'
    };
  }
}

export async function generateImage(prompt: string): Promise<ImageResponse> {
  const provider = process.env.IMAGE_PROVIDER || 'dalle';
  
  if (provider === 'dalle') {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      response_format: 'url'
    });
    
    return {
      url: response.data[0]?.url || '',
      provider: 'dall-e-3'
    };
  } else {
    // Use Vertex AI for Imagen
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || '';
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    
    const response = await fetch(
      `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/imagen-3.0-generate-002:predict`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: "1:1"
          }
        })
      }
    );

    const result = await response.json();
    const image = result.predictions?.[0]?.bytesBase64Encoded;
    
    return {
      url: `data:image/png;base64,${image}` || '',
      provider: 'imagen-3'
    };
  }
}

export async function analyzeDreamContent(content: string): Promise<AIResponse> {
  const prompt = `Analyze this dream and provide insights about its symbols, themes, and potential meanings:\n\n${content}`;
  const provider = process.env.AI_PROVIDER || 'openai';
  
  if (provider === 'openai') {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    });
    
    return {
      text: response.choices[0]?.message?.content || '',
      tokens: response.usage?.total_tokens,
      model: response.model
    };
  } else {
    const model = gemini.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return {
      text: response.text(),
      model: 'gemini-pro'
    };
  }
}

export async function generateStoryFromDream(dream: any): Promise<AIResponse> {
  const systemPrompt = `You are a creative dream storyteller. Create an engaging story based on the dream, following these requirements:
1. Format the response as a valid JSON object
2. Extract 2-3 key themes from the dream
3. Divide the story into 2-3 sections
4. Each section must have a clear title, engaging narrative content, and a detailed image prompt
5. Include a meaningful introduction and conclusion
6. Add a thoughtful dream interpretation
7. Do not use markdown formatting in the content
8. Keep all content in plain text format

Return ONLY valid JSON matching this structure:
{
  "title": "Story Title",
  "subtitle": "A brief subtitle for the story",
  "introduction": "An introduction paragraph",
  "themes": ["theme1", "theme2", "theme3"],
  "sections": [
    {
      "title": "Section Title",
      "content": "Section content here...",
      "imagePrompt": "Description for image generation"
    }
  ],
  "conclusion": "A concluding paragraph",
  "interpretation": "Dream interpretation and analysis"
}`;

  const prompt = `${systemPrompt}

Dream Title: ${dream.title}
Dream Content: ${dream.content}`;

  const provider = process.env.AI_PROVIDER || 'openai';

  if (provider === 'openai') {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: "json_object" }
    });
    
    return {
      text: response.choices[0]?.message?.content || '',
      tokens: response.usage?.total_tokens,
      model: response.model
    };
  } else {
    const model = gemini.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      // Clean up any markdown formatting
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      
      // Parse the JSON response
      const parsedJson = JSON.parse(cleanedText);
      
      // Validate and ensure all required fields exist
      const validatedJson = {
        title: parsedJson.title || dream.title,
        subtitle: parsedJson.subtitle || "A journey through the dreamscape",
        introduction: parsedJson.introduction?.replace(/\*\*/g, '') || "Let's explore this fascinating dream...",
        themes: Array.isArray(parsedJson.themes) ? parsedJson.themes.map((t: string) => t.replace(/\*\*/g, '')) : ["Mystery", "Journey", "Discovery"],
        sections: Array.isArray(parsedJson.sections) && parsedJson.sections.length > 0
          ? parsedJson.sections.map((section: StorySection) => ({
              title: section.title?.replace(/\*\*/g, '') || "Dream Sequence",
              content: section.content?.replace(/\*\*/g, '') || "A mysterious scene unfolds...",
              imagePrompt: section.imagePrompt || `A dreamlike scene depicting: ${section.title || dream.title}`
            }))
          : [{
              title: "Dream Sequence",
              content: dream.content,
              imagePrompt: `A dreamlike scene depicting: ${dream.title}`
            }],
        conclusion: parsedJson.conclusion?.replace(/\*\*/g, '') || "As we reflect on this dream...",
        interpretation: parsedJson.interpretation?.replace(/\*\*/g, '') || "This dream suggests..."
      };
      
      return {
        text: JSON.stringify(validatedJson),
        model: 'gemini-pro'
      };
    } catch (error) {
      console.error('Error processing Gemini response:', error);
      // Fallback to a properly structured response
      const formattedText = {
        title: dream.title,
        subtitle: "A journey through the dreamscape",
        introduction: "Let's explore this fascinating dream...",
        themes: ["Mystery", "Journey", "Discovery"],
        sections: [{
          title: "Dream Sequence",
          content: dream.content,
          imagePrompt: `A dreamlike scene depicting: ${dream.title}`
        }],
        conclusion: "As we reflect on this dream...",
        interpretation: "This dream suggests..."
      };
      return {
        text: JSON.stringify(formattedText),
        model: 'gemini-pro'
      };
    }
  }
}

export async function generateDreamImage(description: string): Promise<ImageResponse> {
  const prompt = `Create a dreamlike, artistic interpretation of this scene: ${description}. Make it ethereal and surreal, using soft colors and mystical elements.`;
  const provider = process.env.IMAGE_PROVIDER || 'dalle';
  
  if (provider === 'dalle') {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      response_format: 'url'
    });
    
    return {
      url: response.data[0]?.url || '',
      provider: 'dall-e-3'
    };
  } else {
    // Use Vertex AI for Imagen
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || '';
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    
    const response = await fetch(
      `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/imagen-3.0-generate-002:predict`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: "1:1",
            imageSize: "1024x1024"
          }
        })
      }
    );

    const result = await response.json();
    const image = result.predictions?.[0]?.bytesBase64Encoded;
    
    return {
      url: `data:image/png;base64,${image}` || '',
      provider: 'imagen-3'
    };
  }
} 