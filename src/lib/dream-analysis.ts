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
    return await db.$transaction(async (tx) => {
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
            analysis: JSON.stringify(analysis) as unknown as Prisma.InputJsonValue,
            rawAnalysis: JSON.stringify(analysis),
            // Ensure proper connections by disconnecting old ones first
            symbols: {
              set: [], // Disconnect all existing symbols
              connect: symbols.map(s => ({ id: s.id })), // Connect new ones
            },
            themes: {
              set: [], // Disconnect all existing themes
              connect: themes.map(t => ({ id: t.id })), // Connect new ones
            },
            emotions: {
              set: [], // Disconnect all existing emotions
              connect: emotions.map(e => ({ id: e.id })), // Connect new ones
            },
            patterns: {
              set: [], // Disconnect all existing patterns
              connect: patterns.map(p => ({ id: p.id })), // Connect new ones
            },
          },
          include: {
            symbols: true,
            themes: true,
            emotions: true,
            patterns: true,
          },
        });

        // Add debug logging
        console.log('Dream update details:', {
          dreamId: updatedDream.id,
          symbols: updatedDream.symbols.map(s => ({ id: s.id, name: s.name })),
          themes: updatedDream.themes.map(t => ({ id: t.id, name: t.name, category: t.category })),
          emotions: updatedDream.emotions.map(e => ({ id: e.id, name: e.name })),
          patterns: updatedDream.patterns.map(p => ({ id: p.id, type: p.type }))
        });

        return analysis;
      } catch (error) {
        console.error('Error in transaction:', error);
        throw error;
      }
    });
  } catch (error) {
    console.error('Error in analyzeDream:', error);
    throw error;
  }
}

function cleanResponseText(text: string): string {
  // Remove markdown code block syntax if present
  return text.replace(/^```json\n/, '')
            .replace(/\n```$/, '')
            .replace(/^```\n/, '')
            .replace(/\n```$/, '')
            .trim();
}

async function performAIAnalysis(dream: DreamWithRelations, context: ReturnType<typeof prepareDreamContext>): Promise<DreamAnalysis> {
  const prompt = `Analyze the following dream in detail, considering the user's dream history and patterns:

Dream Content: ${dream.content}

Historical Context:
- Dream Frequency: ${context.frequency.averageDreamsPerWeek.toFixed(1)} dreams per week (${context.frequency.trend} trend)
- Common Symbols: ${JSON.stringify(context.commonElements.symbols)}
- Common Themes: ${JSON.stringify(context.commonElements.themes)}
- Emotional Patterns: ${JSON.stringify(context.patterns.emotions)}
- Previous Insights: ${JSON.stringify(context.previousInsights)}

Consider these patterns when analyzing the current dream. Pay special attention to:
- Recurring symbols and their evolution
- Emotional patterns and their progression
- Theme development over time
- Connections to previous psychological insights

Return a JSON object with EXACTLY this structure:
{
  "narrative": {
    "setting": string,
    "characters": [{ "type": "person" | "creature" | "object", "description": string, "familiarity": number }],
    "actions": string[],
    "timeline": "past" | "present" | "future" | "mixed"
  },
  "emotions": [{
    "name": string,
    "intensity": number (0-1),
    "valence": number (-1 to 1),
    "triggers": string[]
  }],
  "symbols": [{
    "name": string,
    "type": "personal" | "cultural" | "archetypal",
    "meaning": string,
    "significance": number (0-1)
  }],
  "themes": [{
    "name": string,
    "category": string,
    "description": string,
    "confidence": number (0-1)
  }],
  "patterns": [{
    "type": "recurring" | "evolving" | "cyclical",
    "elements": string[],
    "confidence": number (0-1),
    "description": string
  }],
  "psychologicalInsights": [{
    "title": string,
    "description": string,
    "category": string,
    "confidence": number (0-1),
    "actionable": boolean,
    "recommendation": string (optional)
  }],
  "mentalState": {
    "stressLevel": number (0-10),
    "anxietyLevel": number (0-10),
    "moodScore": number (0-10),
    "dominantEmotions": string[],
    "notes": string (optional)
  }
}`;

  const provider = process.env.AI_PROVIDER || 'openai';
  let responseContent: string;

  if (provider === 'openai') {
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
    const model = gemini.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const systemPrompt = `You are an expert dream analyst with deep knowledge of psychology, symbolism, and pattern recognition. 
Return ONLY valid JSON matching the specified structure exactly. 
Theme categories MUST be one of: relationships, career, personal_growth, spirituality, health, adventure, fear, conflict, success, family, education, creativity.
Each theme MUST have a specific category from the list above.
Each symbol MUST have a type (personal, cultural, or archetypal) and a meaningful description.
Ensure all themes and symbols are meaningful and specific to the dream content.
Do not include any markdown formatting or code blocks in your response.
Pay special attention to recurring symbols and themes that could create connections between dreams.`;
    
    const result = await model.generateContent([
      { text: systemPrompt },
      { text: prompt }
    ]);
    const response = await result.response;
    responseContent = cleanResponseText(response.text());

    // Validate and fix Gemini response structure if needed
    try {
      const parsed = JSON.parse(responseContent);
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
          description: s.meaning || '' // Ensure description is set for database storage
        })) : [],
        themes: Array.isArray(parsed.themes) ? parsed.themes.map((t: GeminiTheme) => {
          const validatedCategory = validateThemeCategory(t.category || 'personal_growth');
          console.log('Validating theme category:', { original: t.category, validated: validatedCategory });
          return {
            name: t.name || '',
            category: validatedCategory,
            description: t.description || '',
            confidence: typeof t.confidence === 'number' ? t.confidence : 0.5
          };
        }) : [],
        patterns: Array.isArray(parsed.patterns) ? parsed.patterns.map((p: GeminiPattern) => ({
          type: p.type || 'recurring',
          elements: Array.isArray(p.elements) ? p.elements : [],
          confidence: typeof p.confidence === 'number' ? p.confidence : 0.5,
          description: p.description || ''
        })) : [],
        psychologicalInsights: Array.isArray(parsed.psychologicalInsights) ? parsed.psychologicalInsights.map((i: GeminiInsight) => ({
          title: i.title || '',
          description: i.description || '',
          category: i.category || 'general',
          confidence: typeof i.confidence === 'number' ? i.confidence : 0.5,
          actionable: !!i.actionable,
          recommendation: i.recommendation
        })) : [],
        mentalState: {
          stressLevel: typeof parsed.mentalState?.stressLevel === 'number' ? parsed.mentalState.stressLevel : 5,
          anxietyLevel: typeof parsed.mentalState?.anxietyLevel === 'number' ? parsed.mentalState.anxietyLevel : 5,
          moodScore: typeof parsed.mentalState?.moodScore === 'number' ? parsed.mentalState.moodScore : 5,
          dominantEmotions: Array.isArray(parsed.mentalState?.dominantEmotions) ? parsed.mentalState.dominantEmotions : [],
          notes: parsed.mentalState?.notes || ''
        }
      };
      responseContent = JSON.stringify(validatedResponse);
    } catch (error) {
      console.error('Error validating Gemini response:', error);
      throw new Error('Invalid response structure from Gemini');
    }
  }

  if (!responseContent) {
    throw new Error('No analysis generated');
  }

  console.log('Raw AI Response:', responseContent);
  
  try {
    const parsedAnalysis = JSON.parse(responseContent) as DreamAnalysis;
    console.log('Parsed Analysis:', JSON.stringify(parsedAnalysis, null, 2));
    return parsedAnalysis;
  } catch (error) {
    console.error('JSON Parse Error:', error);
    console.error('Response that failed to parse:', responseContent);
    throw error;
  }
}

async function processSymbolsWithTx(tx: Prisma.TransactionClient, symbols: DreamAnalysis['symbols']) {
  const processedSymbols: Symbol[] = [];
  
  for (const symbol of symbols) {
    const existing = await tx.symbol.findFirst({
      where: { name: symbol.name }
    });
    
    if (existing) {
      const updated = await tx.symbol.update({
        where: { id: existing.id },
        data: {
          description: String(symbol.meaning),
          frequency: { increment: 1 }
        }
      });
      processedSymbols.push(updated);
    } else {
      const newSymbol = await tx.symbol.create({
        data: {
          name: symbol.name,
          description: String(symbol.meaning),
          frequency: 1,
          type: symbol.type
        }
      });
      processedSymbols.push(newSymbol);
    }
  }
  
  return processedSymbols;
}

async function processThemesWithTx(tx: Prisma.TransactionClient, themes: DreamAnalysis['themes']) {
  const processedThemes: Theme[] = [];
  
  for (const theme of themes) {
    // Validate and normalize the theme category
    const validatedCategory = validateThemeCategory(theme.category);
    console.log('Processing theme:', { name: theme.name, category: validatedCategory });
    
    // First try to find by exact name and category
    let existing = await tx.theme.findFirst({
      where: { 
        name: theme.name,
        category: validatedCategory
      }
    });
    
    // If not found, try to find by name only and update the category
    if (!existing) {
      existing = await tx.theme.findUnique({
        where: { name: theme.name }
      });
      
      if (existing) {
        // Update existing theme with new category
        const updated = await tx.theme.update({
          where: { id: existing.id },
          data: {
            description: theme.description,
            category: validatedCategory,
            frequency: { increment: 1 }
          }
        });
        processedThemes.push(updated);
        console.log('Updated existing theme category:', { name: theme.name, oldCategory: existing.category, newCategory: validatedCategory });
      } else {
        // Create new theme
        const newTheme = await tx.theme.create({
          data: {
            name: theme.name,
            description: theme.description,
            category: validatedCategory,
            frequency: 1
          }
        });
        processedThemes.push(newTheme);
        console.log('Created new theme:', { name: theme.name, category: validatedCategory });
      }
    } else {
      // Update frequency of existing theme
      const updated = await tx.theme.update({
        where: { id: existing.id },
        data: {
          frequency: { increment: 1 }
        }
      });
      processedThemes.push(updated);
      console.log('Incremented existing theme frequency:', { name: theme.name, category: validatedCategory });
    }
  }
  
  console.log('Processed themes:', processedThemes.map(t => ({ name: t.name, category: t.category })));
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
  const arr2Strings = Array.isArray(arr2) ? arr2 : JSON.parse(String(arr2)) as string[];
  return arr1.some(el => arr2Strings.includes(el));
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
    analysis: dream.analysis ? JSON.parse(String(dream.analysis)) as DreamAnalysis : null
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
          const analysis = JSON.parse(d.analysis as string);
          return analysis.psychologicalInsights;
        } catch (e) {
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