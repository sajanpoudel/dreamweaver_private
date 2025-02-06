import { db } from '@/lib/prisma';
import type { Dream, Symbol, Theme } from '@prisma/client';

interface DreamWithRelations extends Dream {
  symbols: Symbol[];
  themes: Theme[];
}

interface SpaceMetrics {
  symbolFrequency: Map<string, number>;
  themeFrequency: Map<string, number>;
  relatedSymbols: Map<string, Set<string>>;
  dreamCount: number;
  userCount: number;
}

export async function categorizeDreamIntoSpaces(dreamId: string) {
  // Fetch the dream with its relations
  const dream = await db.dream.findUnique({
    where: { id: dreamId },
    include: {
      symbols: true,
      themes: true,
      user: true,
    },
  });

  if (!dream) return null;

  // Get existing spaces
  const existingSpaces = await db.dreamSpace.findMany({
    include: {
      symbols: true,
      themes: true,
      dreams: {
        include: {
          symbols: true,
          themes: true,
        },
      },
    },
  });

  // Calculate metrics for the new dream
  const metrics = calculateSpaceMetrics([dream, ...existingSpaces.flatMap(space => space.dreams)]);

  // Find or create appropriate spaces
  for (const symbol of dream.symbols) {
    const relatedSymbols = findRelatedSymbols(symbol.name, metrics);
    const dominantTheme = findDominantTheme(symbol.name, dream.themes);

    // Check if a suitable space exists
    const existingSpace = existingSpaces.find(space => 
      space.symbols.some(s => s.name === symbol.name) &&
      space.themes.some(t => t.name === dominantTheme)
    );

    if (existingSpace) {
      // Update existing space
      await updateDreamSpace(existingSpace.id, dream, relatedSymbols, dominantTheme);
    } else {
      // Create new space
      await createDreamSpace(dream, symbol.name, relatedSymbols, dominantTheme);
    }
  }
}

function calculateSpaceMetrics(dreams: DreamWithRelations[]): SpaceMetrics {
  const symbolFrequency = new Map<string, number>();
  const themeFrequency = new Map<string, number>();
  const relatedSymbols = new Map<string, Set<string>>();
  const userIds = new Set<string>();

  dreams.forEach(dream => {
    userIds.add(dream.userId);
    
    // Count symbol frequencies
    dream.symbols.forEach(symbol => {
      symbolFrequency.set(
        symbol.name,
        (symbolFrequency.get(symbol.name) || 0) + 1
      );

      // Track related symbols (symbols that appear together)
      const symbolSet = new Set(dream.symbols.map(s => s.name));
      symbolSet.delete(symbol.name);
      
      if (!relatedSymbols.has(symbol.name)) {
        relatedSymbols.set(symbol.name, new Set());
      }
      
      symbolSet.forEach(related => {
        relatedSymbols.get(symbol.name)?.add(related);
      });
    });

    // Count theme frequencies
    dream.themes.forEach(theme => {
      themeFrequency.set(
        theme.name,
        (themeFrequency.get(theme.name) || 0) + 1
      );
    });
  });

  return {
    symbolFrequency,
    themeFrequency,
    relatedSymbols,
    dreamCount: dreams.length,
    userCount: userIds.size,
  };
}

function findRelatedSymbols(
  mainSymbol: string,
  metrics: SpaceMetrics,
): string[] {
  const related = metrics.relatedSymbols.get(mainSymbol);
  if (!related) return [];

  // Sort related symbols by frequency
  return Array.from(related)
    .sort((a, b) => 
      (metrics.symbolFrequency.get(b) || 0) - (metrics.symbolFrequency.get(a) || 0)
    )
    .slice(0, 5); // Get top 5 related symbols
}

function findDominantTheme(
  symbolName: string,
  themes: Theme[],
): string {
  // For now, just take the first theme or use a default
  return themes[0]?.name || 'General';
}

async function createDreamSpace(
  dream: DreamWithRelations,
  mainSymbol: string,
  relatedSymbols: string[],
  dominantTheme: string,
) {
  const name = generateSpaceName(mainSymbol, relatedSymbols, dominantTheme);
  const description = generateSpaceDescription(mainSymbol, relatedSymbols);

  await db.dreamSpace.create({
    data: {
      name,
      description,
      primarySymbol: mainSymbol,
      relatedSymbols,
      dominantTheme,
      dreams: {
        connect: { id: dream.id }
      },
      symbols: {
        connect: [
          { name: mainSymbol },
          ...relatedSymbols.map(symbol => ({ name: symbol }))
        ]
      },
      themes: {
        connect: [{ name: dominantTheme }]
      }
    }
  });
}

async function updateDreamSpace(
  spaceId: string,
  dream: DreamWithRelations,
  relatedSymbols: string[],
  dominantTheme: string,
) {
  await db.dreamSpace.update({
    where: { id: spaceId },
    data: {
      dreams: {
        connect: { id: dream.id }
      },
      symbols: {
        connect: relatedSymbols.map(symbol => ({ name: symbol }))
      },
      themes: {
        connect: [{ name: dominantTheme }]
      }
    }
  });
}

function generateSpaceName(
  mainSymbol: string,
  relatedSymbols: string[],
  theme: string
): string {
  return `${capitalizeFirstLetter(mainSymbol)} Dreamscape: ${theme}`;
}

function generateSpaceDescription(
  mainSymbol: string,
  relatedSymbols: string[],
): string {
  return `A collection of dreams featuring ${mainSymbol}${
    relatedSymbols.length > 0
      ? ` and related symbols like ${relatedSymbols.slice(0, 3).join(', ')}`
      : ''
  }.`;
}

function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
} 