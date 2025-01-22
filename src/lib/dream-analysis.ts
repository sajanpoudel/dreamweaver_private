import { Dream, Symbol, Theme, Emotion, User, Prisma, DreamPattern, MentalStateSnapshot, DreamCheckpoint } from '@prisma/client';
import { db } from './prisma';

// Move OpenAI initialization to server-side only
let openai: any;
if (typeof window === 'undefined') {
  const OpenAI = require('openai');
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
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

export async function analyzeDream(dream: DreamWithRelations, userId: string): Promise<DreamAnalysis> {
  if (typeof window !== 'undefined') {
    throw new Error('analyzeDream must be called from server-side code');
  }

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
      take: 50, // Increased from 10 to get more historical context
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
  
  // 4. Create initial checkpoint
  const checkpoint = await createDreamCheckpoint(dream.id, {
    type: 'initial',
    analysis,
    similarities: await findSimilarDreams(dream, userDreams),
  });

  // 5. Update or create patterns
  const patterns = await updateDreamPatterns(dream, analysis, existingPatterns);
  
  // 6. Create mental state snapshot
  const mentalState = await createMentalStateSnapshot(dream.id, analysis.mentalState, patterns);
  
  // 7. Process and store basic elements
  const [symbols, themes, emotions] = await Promise.all([
    processSymbols(analysis.symbols),
    processThemes(analysis.themes),
    processEmotions(analysis.emotions),
  ]);
  
  // 8. Update dream with all new data
  await db.dream.update({
    where: { id: dream.id },
    data: {
      analysis: JSON.stringify(analysis),
      rawAnalysis: JSON.stringify(analysis), // Store raw analysis for future reference
      symbols: { connect: symbols.map(s => ({ id: s.id })) },
      themes: { connect: themes.map(t => ({ id: t.id })) },
      emotions: { connect: emotions.map(e => ({ id: e.id })) },
      patterns: { connect: patterns.map(p => ({ id: p.id })) },
    },
  });

  return analysis;
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

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
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

  if (!response.choices[0].message.content) {
    throw new Error('No analysis generated');
  }

  console.log('Raw OpenAI Response:', response.choices[0].message.content);
  
  try {
    const parsedAnalysis = JSON.parse(response.choices[0].message.content) as DreamAnalysis;
    console.log('Parsed Analysis:', JSON.stringify(parsedAnalysis, null, 2));
    return parsedAnalysis;
  } catch (error) {
    console.error('JSON Parse Error:', error);
    console.error('Response that failed to parse:', response.choices[0].message.content);
    throw error;
  }
}

async function processSymbols(symbols: DreamAnalysis['symbols']) {
  const processedSymbols: Symbol[] = [];
  
  for (const symbol of symbols) {
    const existing = await db.symbol.findFirst({
      where: { name: symbol.name }
    });
    
    if (existing) {
      const updated = await db.symbol.update({
        where: { id: existing.id },
        data: {
          description: String(symbol.meaning)
        }
      });
      processedSymbols.push(updated);
    } else {
      const newSymbol = await db.symbol.create({
        data: {
          name: symbol.name,
          description: String(symbol.meaning)
        }
      });
      processedSymbols.push(newSymbol);
    }
  }
  
  return processedSymbols;
}

async function processThemes(themes: DreamAnalysis['themes']) {
  const processedThemes: Theme[] = [];
  
  for (const theme of themes) {
    const existing = await db.theme.findFirst({
      where: { name: theme.name }
    });
    
    if (existing) {
      const updated = await db.theme.update({
        where: { id: existing.id },
        data: {
          name: theme.name
        }
      });
      processedThemes.push(updated);
    } else {
      const newTheme = await db.theme.create({
        data: {
          name: theme.name
        }
      });
      processedThemes.push(newTheme);
    }
  }
  
  return processedThemes;
}

async function processEmotions(emotions: DreamAnalysis['emotions']) {
  const processedEmotions: Emotion[] = [];
  
  for (const emotion of emotions) {
    const existing = await db.emotion.findFirst({
      where: { name: emotion.name }
    });
    
    if (existing) {
      processedEmotions.push(existing);
    } else {
      const newEmotion = await db.emotion.create({
        data: {
          name: emotion.name
        }
      });
      processedEmotions.push(newEmotion);
    }
  }
  
  return processedEmotions;
}

async function createDreamCheckpoint(dreamId: string, data: DreamCheckpointData): Promise<DreamCheckpoint> {
  return db.dreamCheckpoint.create({
    data: {
      dreamId,
      type: data.type,
      content: data.analysis as unknown as Prisma.InputJsonValue,
      similarity: data.similarities[0]?.score || null,
    },
  });
}

async function createMentalStateSnapshot(
  dreamId: string,
  mentalState: DreamAnalysis['mentalState'],
  patterns: DreamPattern[]
): Promise<MentalStateSnapshot> {
  const patternImpact = patterns.reduce((sum, p) => sum + (p.impact || 0), 0) / patterns.length;
  
  return db.mentalStateSnapshot.create({
    data: {
      dreamId,
      stressLevel: mentalState.stressLevel,
      anxietyLevel: mentalState.anxietyLevel,
      moodScore: mentalState.moodScore,
      sleepQuality: null,
      energyLevel: null,
      clarity: null,
    },
  });
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

async function updateDreamPatterns(
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
      const updatedPattern = await db.dreamPattern.update({
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
      const pattern = await db.dreamPattern.create({
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