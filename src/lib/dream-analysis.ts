import { Dream, Symbol, Theme, Emotion, User, Prisma, DreamPattern, MentalStateSnapshot, DreamCheckpoint } from '@prisma/client';
import { db } from './prisma';

// Move AI client initialization to server-side only
let openai: any;
let gemini: any;
if (typeof window === 'undefined') {
  const OpenAI = require('openai');
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
}

export interface DreamAnalysis {
  narrative: {
    setting: string;
    characters: Array<{
      type: 'person' | 'creature' | 'object';
      description: string;
      familiarity: number;
    }>;
    actions: string[];
    timeline: 'past' | 'present' | 'future' | 'mixed';
  };
  emotions: Array<{
    name: string;
    intensity: number;
    valence: number;
    triggers: string[];
  }>;
  symbols: Array<{
    name: string;
    type: 'personal' | 'cultural' | 'archetypal';
    meaning: string;
    significance: number;
  }>;
  themes: Array<{
    name: string;
    category: string;
    description: string;
    confidence: number;
  }>;
  patterns: Array<{
    type: 'recurring' | 'evolving' | 'cyclical';
    elements: string[];
    confidence: number;
    description: string;
  }>;
  psychologicalInsights: Array<{
    title: string;
    description: string;
    category: string;
    confidence: number;
    actionable: boolean;
    recommendation?: string;
  }>;
  mentalState: {
    stressLevel: number;
    anxietyLevel: number;
    moodScore: number;
    dominantEmotions: string[];
    notes?: string;
  };
}

type DreamWithRelations = Dream & {
  symbols: Symbol[];
  themes: Theme[];
  emotions: Emotion[];
};

interface DreamCheckpointData {
  type: 'initial' | 'followup' | 'reflection';
  analysis: DreamAnalysis;
  similarities: Array<{
    dreamId: string;
    score: number;
    commonElements: {
      symbols: string[];
      themes: string[];
      emotions: string[];
    };
  }>;
}

// Add these interfaces at the top of the file with other interfaces
interface GeminiEmotion {
  name?: string;
  intensity?: number;
  valence?: number;
  triggers?: string[];
}

interface GeminiSymbol {
  name?: string;
  type?: 'personal' | 'cultural' | 'archetypal';
  meaning?: string;
  significance?: number;
}

interface GeminiTheme {
  name?: string;
  category?: string;
  description?: string;
  confidence?: number;
}

interface GeminiPattern {
  type?: 'recurring' | 'evolving' | 'cyclical';
  elements?: string[];
  confidence?: number;
  description?: string;
}

interface GeminiInsight {
  title?: string;
  description?: string;
  category?: string;
  confidence?: number;
  actionable?: boolean;
  recommendation?: string;
}

// Add theme category validation
const VALID_THEME_CATEGORIES = [
  'relationships',
  'career',
  'personal_growth',
  'spirituality',
  'health',
  'adventure',
  'fear',
  'conflict',
  'success',
  'family',
  'education',
  'creativity'
] as const;

type ThemeCategory = typeof VALID_THEME_CATEGORIES[number];

function validateThemeCategory(category: string): ThemeCategory {
  const normalizedCategory = category.toLowerCase().replace(/\s+/g, '_');
  if (VALID_THEME_CATEGORIES.includes(normalizedCategory as ThemeCategory)) {
    return normalizedCategory as ThemeCategory;
  }
  // Map similar categories to valid ones
  const categoryMap: Record<string, ThemeCategory> = {
    'work': 'career',
    'learning': 'education',
    'school': 'education',
    'growth': 'personal_growth',
    'spiritual': 'spirituality',
    'religious': 'spirituality',
    'romance': 'relationships',
    'love': 'relationships',
    'achievement': 'success',
    'anxiety': 'fear',
    'stress': 'fear',
    'art': 'creativity',
    'expression': 'creativity'
  };
  
  return categoryMap[normalizedCategory] || 'personal_growth';
}

export async function analyzeDream(dream: DreamWithRelations, userId: string): Promise<DreamAnalysis> {
  if (typeof window !== 'undefined') {
    throw new Error('analyzeDream must be called from server-side code');
  }

  try {
    // 1. Get user's dream history and patterns
    const [userDreams, existingPatterns] = await Promise.all([
      db.dream.findMany({
        where: { userId },
        include: {
          symbols: true,
          themes: true,
          emotions: true,
          mentalState: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      db.dreamPattern.findMany({
        where: { userId },
        include: { dreams: true },
      })
    ]);

    // 2. Prepare comprehensive context including patterns
    const dreamContext = prepareDreamContext(userDreams, existingPatterns);
    
    // 3. Perform initial AI analysis
    const analysis = await performAIAnalysis(dream, dreamContext);

    // Use a transaction to ensure all updates are atomic
    const result = await db.$transaction(async (tx) => {
      console.log('Starting transaction for dream analysis...');
      
      try {
        // 4. Process and store basic elements first
        const [symbols, themes, emotions] = await Promise.all([
          processSymbolsWithTx(tx, analysis.symbols),
          processThemesWithTx(tx, analysis.themes),
          processEmotionsWithTx(tx, analysis.emotions),
        ]);

        console.log(`Processed elements: ${symbols.length} symbols, ${themes.length} themes, ${emotions.length} emotions`);

        // 5. Create initial checkpoint
        const checkpoint = await tx.dreamCheckpoint.create({
          data: {
            dreamId: dream.id,
            type: 'initial',
            content: analysis as unknown as Prisma.InputJsonValue,
            similarity: null,
          },
        });

        // 6. Update or create patterns
        const patterns = await updateDreamPatternsWithTx(tx, dream, analysis, existingPatterns);

        // 7. Create mental state snapshot
        const mentalState = await tx.mentalStateSnapshot.create({
          data: {
            dreamId: dream.id,
            stressLevel: analysis.mentalState.stressLevel,
            anxietyLevel: analysis.mentalState.anxietyLevel,
            moodScore: analysis.mentalState.moodScore,
            triggers: analysis.mentalState.dominantEmotions as unknown as Prisma.InputJsonValue,
          },
        });

        // 8. Update dream with all new data
        const updatedDream = await tx.dream.update({
          where: { id: dream.id },
          data: {
            analysis: analysis as unknown as Prisma.InputJsonValue,
            rawAnalysis: JSON.stringify(analysis),
            symbols: {
              set: [], // First disconnect all existing symbols
              connect: symbols.map(s => ({ id: s.id })) // Then connect the new ones
            },
            themes: {
              set: [], // First disconnect all existing themes
              connect: themes.map(t => ({ id: t.id })) // Then connect the new ones
            },
            emotions: {
              set: [], // First disconnect all existing emotions
              connect: emotions.map(e => ({ id: e.id })) // Then connect the new ones
            },
            patterns: {
              connect: patterns.map(p => ({ id: p.id }))
            },
            mentalState: {
              connect: { id: mentalState.id }
            },
            checkpoints: {
              connect: { id: checkpoint.id }
            }
          },
          include: {
            symbols: true,
            themes: true,
            emotions: true,
            patterns: true,
            mentalState: true,
            checkpoints: true
          }
        });

        return { analysis, updatedDream };
      } catch (error) {
        console.error('Error in transaction:', error);
        throw error;
      }
    });

    return result.analysis;
  } catch (error) {
    console.error('Error in analyzeDream:', error);
    throw error;
  }
}

function cleanResponseText(text: string): string {
  // Remove any markdown code block indicators
  text = text.replace(/```json\s*/g, '');
  text = text.replace(/```\s*$/g, '');
  
  // Remove any trailing commas before closing braces/brackets
  text = text.replace(/,(\s*[}\]])/g, '$1');
  
  // Remove any non-JSON content after the main JSON object
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    text = text.substring(firstBrace, lastBrace + 1);
  }

  // Ensure all properties are properly quoted
  text = text.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');
  
  return text.trim();
}

async function performAIAnalysis(dream: DreamWithRelations, context: ReturnType<typeof prepareDreamContext>): Promise<DreamAnalysis> {
  let responseContent = '';
  
  if (process.env.AI_MODEL === 'openai') {
    const prompt = `Analyze this dream in detail, considering the following context: ${context}\n\nDream Content: ${dream.content}`;
    
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert dream analyst with deep knowledge of psychology, symbolism, and pattern recognition. Analyze dreams in the context of the user's dream history, identifying patterns, progressions, and psychological developments. Return ONLY valid JSON matching the specified structure exactly."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    responseContent = response.choices[0]?.message?.content || '';
  } else {
    // Use Gemini
    const model = gemini.getGenerativeModel({ model: "gemini-pro" });
    
    const contextString = JSON.stringify({
      dreamFrequency: context.frequency.averageDreamsPerWeek,
      commonSymbols: context.commonElements.symbols,
      commonThemes: context.commonElements.themes,
      emotionalPatterns: context.patterns.emotions,
      previousInsights: context.previousInsights
    });
    
    const systemPrompt = `You are a dream analysis AI that provides structured analysis of dreams. 
Your responses must be valid JSON objects with the following structure:
{
  "narrative": {
    "setting": string,
    "characters": Array<{type: string, description: string, familiarity: number}>,
    "actions": string[],
    "timeline": "past" | "present" | "future" | "mixed"
  },
  "emotions": Array<{
    name: string,
    intensity: number,
    valence: number,
    triggers: string[]
  }>,
  "symbols": Array<{
    name: string,
    type: "personal" | "cultural" | "archetypal",
    meaning: string,
    significance: number,
    description: string
  }>,
  "themes": Array<{
    name: string,
    category: string,
    description: string,
    confidence: number
  }>,
  "patterns": Array<{
    type: "recurring" | "evolving" | "cyclical",
    elements: string[],
    confidence: number,
    description: string
  }>,
  "psychologicalInsights": Array<{
    title: string,
    description: string,
    category: string,
    confidence: number,
    actionable: boolean,
    recommendation?: string
  }>,
  "mentalState": {
    stressLevel: number,
    anxietyLevel: number,
    moodScore: number,
    dominantEmotions: string[],
    notes?: string
  }
}

Ensure all themes and symbols are meaningful and specific to the dream content.
Do not include any markdown formatting or code blocks in your response.
Pay special attention to recurring symbols and themes that could create connections between dreams.
Respond ONLY with the JSON object, no additional text or formatting.`;
    
    const prompt = `Analyze this dream in detail, considering the following context: ${contextString}\n\nDream Content: ${dream.content}`;
    
    try {
      const result = await model.generateContent([
        { text: systemPrompt },
        { text: prompt }
      ]);
      const response = await result.response;
      responseContent = cleanResponseText(response.text());
      
      // Validate JSON structure
      try {
        const parsed = JSON.parse(responseContent);
        console.log('Successfully parsed Gemini response');
        
        // Ensure all required fields exist with proper structure
        const validatedResponse = {
          narrative: {
            setting: parsed.narrative?.setting || '',
            characters: Array.isArray(parsed.narrative?.characters) ? parsed.narrative.characters : [],
            actions: Array.isArray(parsed.narrative?.actions) ? parsed.narrative.actions : [],
            timeline: parsed.narrative?.timeline || 'present'
          },
          emotions: Array.isArray(parsed.emotions) ? parsed.emotions.map((e: GeminiEmotion) => ({
            name: e.name || '',
            intensity: typeof e.intensity === 'number' ? e.intensity : 0.5,
            valence: typeof e.valence === 'number' ? e.valence : 0,
            triggers: Array.isArray(e.triggers) ? e.triggers : []
          })) : [],
          symbols: Array.isArray(parsed.symbols) ? parsed.symbols.map((s: GeminiSymbol) => ({
            name: s.name || '',
            type: s.type || 'cultural',
            meaning: s.meaning || '',
            significance: typeof s.significance === 'number' ? s.significance : 0.5,
            description: s.meaning || ''
          })) : [],
          themes: Array.isArray(parsed.themes) ? parsed.themes.map((t: GeminiTheme) => {
            const validatedCategory = validateThemeCategory(t.category || 'personal_growth');
            return {
              name: t.name || '',
              category: validatedCategory,
              description: t.description || '',
              confidence: typeof t.confidence === 'number' ? t.confidence : 0.5
            };
          }) : [],
          patterns: Array.isArray(parsed.patterns) ? parsed.patterns : [],
          psychologicalInsights: Array.isArray(parsed.psychologicalInsights) ? parsed.psychologicalInsights : [],
          mentalState: {
            stressLevel: typeof parsed.mentalState?.stressLevel === 'number' ? parsed.mentalState.stressLevel : 5,
            anxietyLevel: typeof parsed.mentalState?.anxietyLevel === 'number' ? parsed.mentalState.anxietyLevel : 5,
            moodScore: typeof parsed.mentalState?.moodScore === 'number' ? parsed.mentalState.moodScore : 5,
            dominantEmotions: Array.isArray(parsed.mentalState?.dominantEmotions) ? parsed.mentalState.dominantEmotions : [],
            notes: parsed.mentalState?.notes || ''
          }
        };
        
        return validatedResponse;
      } catch (parseError) {
        console.error('Error parsing Gemini response:', parseError);
        console.error('Raw response:', responseContent);
        throw new Error('Invalid response structure from Gemini');
      }
    } catch (error) {
      console.error('Error generating content with Gemini:', error);
      throw error;
    }
  }

  throw new Error('No AI model configured');
}

async function processSymbolsWithTx(tx: Prisma.TransactionClient, symbols: GeminiSymbol[]): Promise<Symbol[]> {
  const processedSymbols = [];
  
  for (const symbol of symbols) {
    if (!symbol.name) continue;
    
    // First try to find an exact match
    let existingSymbol = await tx.symbol.findFirst({
      where: {
        name: {
          equals: symbol.name,
          mode: 'insensitive'
        },
        type: symbol.type || 'personal'
      }
    });
    
    if (!existingSymbol) {
      // Create new symbol if none exists
      existingSymbol = await tx.symbol.create({
        data: {
          name: symbol.name,
          type: symbol.type || 'personal',
          description: symbol.meaning || '',
          frequency: 1
        }
      });
      console.log('Created new symbol:', { name: symbol.name, type: symbol.type });
    } else {
      // Update existing symbol with new information
      existingSymbol = await tx.symbol.update({
        where: { id: existingSymbol.id },
        data: {
          description: symbol.meaning || existingSymbol.description,
          frequency: { increment: 1 }
        }
      });
      console.log('Updated existing symbol:', { name: symbol.name, frequency: existingSymbol.frequency + 1 });
    }
    
    processedSymbols.push(existingSymbol);
  }
  
  return processedSymbols;
}

async function processThemesWithTx(tx: Prisma.TransactionClient, themes: GeminiTheme[]): Promise<Theme[]> {
  const processedThemes = [];
  
  for (const theme of themes) {
    if (!theme.name) continue;
    
    const validatedCategory = validateThemeCategory(theme.category || 'personal_growth');
    console.log('Processing theme:', { name: theme.name, category: validatedCategory });
    
    // First try to find an exact match by name and category
    let existingTheme = await tx.theme.findFirst({
      where: {
        name: {
          equals: theme.name,
          mode: 'insensitive'
        },
        category: validatedCategory
      }
    });

    if (!existingTheme) {
      // Create new theme if none exists
      existingTheme = await tx.theme.create({
        data: {
          name: theme.name,
          category: validatedCategory,
          description: theme.description || '',
          frequency: 1
        }
      });
      console.log('Created new theme:', { name: theme.name, category: validatedCategory });
    } else {
      // Update existing theme with new information
      existingTheme = await tx.theme.update({
        where: { id: existingTheme.id },
        data: {
          description: theme.description || existingTheme.description,
          frequency: { increment: 1 }
        }
      });
      console.log('Updated existing theme:', { name: theme.name, category: validatedCategory, frequency: existingTheme.frequency + 1 });
    }
    
    processedThemes.push(existingTheme);
  }
  
  return processedThemes;
}

async function processEmotionsWithTx(tx: Prisma.TransactionClient, emotions: DreamAnalysis['emotions']) {
  const processedEmotions: Emotion[] = [];
  
  for (const emotion of emotions) {
    const existing = await tx.emotion.findFirst({
      where: { name: emotion.name }
    });
    
    if (existing) {
      const updated = await tx.emotion.update({
        where: { id: existing.id },
        data: {
          valence: emotion.valence,
          arousal: emotion.intensity,
          frequency: { increment: 1 }
        }
      });
      processedEmotions.push(updated);
    } else {
      const newEmotion = await tx.emotion.create({
        data: {
          name: emotion.name,
          valence: emotion.valence,
          arousal: emotion.intensity,
          frequency: 1,
          category: 'primary'
        }
      });
      processedEmotions.push(newEmotion);
    }
  }
  
  return processedEmotions;
}

async function updateDreamPatternsWithTx(
  tx: Prisma.TransactionClient,
  dream: DreamWithRelations,
  analysis: DreamAnalysis,
  existingPatterns: Array<DreamPattern & { dreams: Dream[] }>
): Promise<DreamPattern[]> {
  const patterns: DreamPattern[] = [];
  
  // Update existing patterns
  for (const pattern of existingPatterns) {
    const matchesPattern = analysis.patterns.some(p => 
      p.type === pattern.type && 
      hasCommonElements(p.elements, JSON.parse(pattern.elements as string))
    );
    
    if (matchesPattern) {
      const updatedPattern = await tx.dreamPattern.update({
        where: { id: pattern.id },
        data: {
          frequency: { increment: 1 },
          lastSeen: new Date(),
          dreams: { connect: { id: dream.id } },
        },
      });
      patterns.push(updatedPattern);
    }
  }
  
  // Create new patterns
  for (const newPattern of analysis.patterns) {
    const existingPattern = patterns.find(p => p.type === newPattern.type);
    if (!existingPattern) {
      const pattern = await tx.dreamPattern.create({
        data: {
          userId: dream.userId,
          type: newPattern.type,
          elements: JSON.stringify(newPattern.elements),
          confidence: newPattern.confidence,
          firstSeen: new Date(),
          lastSeen: new Date(),
          frequency: 1,
          impact: 0,
          dreams: { connect: { id: dream.id } },
        },
      });
      patterns.push(pattern);
    }
  }
  
  return patterns;
}

function hasCommonElements(arr1: string[], arr2: string[] | Prisma.JsonValue): boolean {
  if (Array.isArray(arr2)) {
    return arr1.some(el => arr2.includes(el));
  }
  try {
    const arr2Strings = typeof arr2 === 'string' ? 
      JSON.parse(arr2) as string[] : 
      Array.isArray(arr2) ? arr2 : [];
    return arr1.some(el => arr2Strings.includes(el));
  } catch (e) {
    console.error('Error parsing pattern elements:', e);
    return false;
  }
}

function prepareDreamContext(dreams: DreamWithRelations[], existingPatterns: Array<DreamPattern & { dreams: Dream[] }>): {
  dreamCount: number;
  timespan: {
    start: Date | null;
    end: Date | null;
  };
  patterns: {
    symbols: Record<string, { 
      frequency: number;
      firstSeen: Date;
      lastSeen: Date;
      occurrences: number;
      trend: 'increasing' | 'decreasing' | 'stable';
    }>;
    themes: Record<string, { 
      frequency: number;
      firstSeen: Date;
      lastSeen: Date;
      occurrences: number;
      trend: 'increasing' | 'decreasing' | 'stable';
    }>;
    emotions: Record<string, { 
      frequency: number;
      firstSeen: Date;
      lastSeen: Date;
      occurrences: number;
      trend: 'increasing' | 'decreasing' | 'stable';
    }>;
  };
  commonElements: {
    symbols: Array<{ name: string; count: number }>;
    themes: Array<{ name: string; count: number }>;
    emotions: Array<{ name: string; count: number }>;
  };
  emotionalTrends: Array<{
    date: Date;
    emotions: string[];
    analysis: DreamAnalysis | null;
  }>;
  frequency: {
    averageDreamsPerWeek: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  previousInsights: Array<DreamAnalysis | null>;
} {
  // Analyze patterns across dreams
  const symbolPatterns = analyzePatterns(dreams.map(d => d.symbols));
  const themePatterns = analyzePatterns(dreams.map(d => d.themes));
  const emotionalPatterns = analyzePatterns(dreams.map(d => d.emotions));

  // Extract common elements with their frequencies
  const commonElements = {
    symbols: extractCommonElements(dreams.flatMap(d => d.symbols)),
    themes: extractCommonElements(dreams.flatMap(d => d.themes)),
    emotions: extractCommonElements(dreams.flatMap(d => d.emotions))
  };

  // Analyze emotional trends
  const emotionalTrends = dreams.map(dream => ({
    date: dream.createdAt,
    emotions: dream.emotions.map(e => e.name),
    analysis: dream.analysis ? 
      (typeof dream.analysis === 'string' ? 
        JSON.parse(dream.analysis) : 
        dream.analysis) as DreamAnalysis : 
      null
  }));

  return {
    dreamCount: dreams.length,
    timespan: {
      start: dreams[dreams.length - 1]?.createdAt,
      end: dreams[0]?.createdAt,
    },
    patterns: {
      symbols: symbolPatterns,
      themes: themePatterns,
      emotions: emotionalPatterns
    },
    commonElements,
    emotionalTrends,
    // Calculate frequency of dream occurrence
    frequency: calculateDreamFrequency(dreams),
    // Extract any previous psychological insights
    previousInsights: dreams
      .filter(d => d.analysis)
      .map(d => {
        try {
          return typeof d.analysis === 'string' ? JSON.parse(d.analysis) : d.analysis;
        } catch (e) {
          console.error('Error parsing previous insight:', e);
          return null;
        }
      })
      .filter(Boolean),
  };
}

function analyzePatterns<T extends { name: string }>(items: T[][]) {
  const patterns: Record<string, { 
    frequency: number,
    firstSeen: Date,
    lastSeen: Date,
    occurrences: number,
    trend: 'increasing' | 'decreasing' | 'stable'
  }> = {};

  items.forEach((itemGroup, index) => {
    itemGroup.forEach(item => {
      if (!patterns[item.name]) {
        patterns[item.name] = {
          frequency: 1,
          firstSeen: new Date(),
          lastSeen: new Date(),
          occurrences: 1,
          trend: 'stable'
        };
      } else {
        patterns[item.name].occurrences++;
        patterns[item.name].frequency = patterns[item.name].occurrences / items.length;
        patterns[item.name].lastSeen = new Date();
        
        // Calculate trend based on recent occurrences
        const recentOccurrences = items.slice(Math.max(0, index - 3), index + 1)
          .filter(group => group.some(i => i.name === item.name)).length;
        const trend = recentOccurrences / 4; // Last 4 dreams
        patterns[item.name].trend = trend > 0.5 ? 'increasing' : trend < 0.25 ? 'decreasing' : 'stable';
      }
    });
  });

  return patterns;
}

function calculateDreamFrequency(dreams: DreamWithRelations[]): {
  averageDreamsPerWeek: number;
  trend: 'increasing' | 'decreasing' | 'stable';
} {
  if (dreams.length < 2) {
    return { averageDreamsPerWeek: 0, trend: 'stable' };
  }

  const timeSpanDays = (dreams[0].createdAt.getTime() - dreams[dreams.length - 1].createdAt.getTime()) 
    / (1000 * 60 * 60 * 24);
  const averageDreamsPerWeek = (dreams.length / timeSpanDays) * 7;

  // Calculate trend by comparing recent frequency to overall average
  const halfwayPoint = Math.floor(dreams.length / 2);
  const recentDreams = dreams.slice(0, halfwayPoint);
  const olderDreams = dreams.slice(halfwayPoint);

  const recentTimeSpan = (recentDreams[0].createdAt.getTime() - recentDreams[recentDreams.length - 1].createdAt.getTime())
    / (1000 * 60 * 60 * 24);
  const olderTimeSpan = (olderDreams[0].createdAt.getTime() - olderDreams[olderDreams.length - 1].createdAt.getTime())
    / (1000 * 60 * 60 * 24);

  const recentFrequency = (recentDreams.length / recentTimeSpan) * 7;
  const olderFrequency = (olderDreams.length / olderTimeSpan) * 7;

  let trend: 'increasing' | 'decreasing' | 'stable';
  const difference = recentFrequency - olderFrequency;
  if (difference > 0.5) trend = 'increasing';
  else if (difference < -0.5) trend = 'decreasing';
  else trend = 'stable';

  return { averageDreamsPerWeek, trend };
}

function extractCommonElements<T extends { name: string }>(items: T[]) {
  const frequency = items.reduce((acc, item) => {
    acc[item.name] = (acc[item.name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));
}

function determineEmotionCategory(emotion: string): 'primary' | 'secondary' | 'complex' {
  const primaryEmotions = ['joy', 'sadness', 'anger', 'fear', 'disgust', 'surprise'];
  const secondaryEmotions = ['shame', 'guilt', 'pride', 'anxiety', 'hope'];
  
  if (primaryEmotions.includes(emotion.toLowerCase())) return 'primary';
  if (secondaryEmotions.includes(emotion.toLowerCase())) return 'secondary';
  return 'complex';
}

export function parseAnalysis(analysisString: string | null): DreamAnalysis | null {
  if (!analysisString) return null;
  try {
    return JSON.parse(analysisString) as DreamAnalysis;
  } catch (error) {
    console.error('Error parsing dream analysis:', error);
    return null;
  }
}

async function findSimilarDreams(currentDream: DreamWithRelations, pastDreams: DreamWithRelations[]): Promise<DreamCheckpointData['similarities']> {
  const similarities: DreamCheckpointData['similarities'] = [];
  
  for (const pastDream of pastDreams) {
    if (pastDream.id === currentDream.id) continue;
    
    // Calculate symbol overlap
    const commonSymbols = currentDream.symbols.filter(s1 => 
      pastDream.symbols.some(s2 => s2.name === s1.name)
    );
    
    // Calculate theme overlap
    const commonThemes = currentDream.themes.filter(t1 => 
      pastDream.themes.some(t2 => t2.name === t1.name)
    );
    
    // Calculate emotion overlap
    const commonEmotions = currentDream.emotions.filter(e1 => 
      pastDream.emotions.some(e2 => e2.name === e1.name)
    );
    
    // Calculate similarity score (weighted average)
    const score = (
      (commonSymbols.length / Math.max(currentDream.symbols.length, pastDream.symbols.length)) * 0.4 +
      (commonThemes.length / Math.max(currentDream.themes.length, pastDream.themes.length)) * 0.3 +
      (commonEmotions.length / Math.max(currentDream.emotions.length, pastDream.emotions.length)) * 0.3
    );
    
    if (score > 0.3) { // Only include dreams with significant similarity
      similarities.push({
        dreamId: pastDream.id,
        score,
        commonElements: {
          symbols: commonSymbols.map(s => s.name),
          themes: commonThemes.map(t => t.name),
          emotions: commonEmotions.map(e => e.name),
        },
      });
    }
  }
  
  return similarities.sort((a, b) => b.score - a.score);
} 