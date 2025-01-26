import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // Get session and handle authentication
    const session = await getServerSession(authOptions);
    console.log('Session check:', session ? 'Authenticated' : 'Not authenticated');
    
    if (!session?.user) {
      console.log('No session found, returning unauthorized');
      return new NextResponse(
        JSON.stringify({ error: 'You must be signed in to view dream spaces' }), 
        { status: 401 }
      );
    }

    console.log('Authenticated user:', session.user.email);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    console.log('Search query:', search);

    // First, let's check all public dreams
    const allDreams = await db.dreamStory.findMany({
      where: {
        isPublic: true,
        publishedAt: { not: null },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        },
        symbols: {
          select: {
            name: true,
          }
        },
        themes: {
          select: {
            name: true,
          }
        },
      },
      orderBy: {
        publishedAt: 'desc'
      }
    });

    console.log('Database query results:');
    console.log('Total public dreams:', allDreams.length);
    console.log('Dreams with symbols:', allDreams.filter(d => d.symbols.length > 0).length);
    console.log('Dreams with themes:', allDreams.filter(d => d.themes.length > 0).length);
    console.log('Sample dream:', JSON.stringify(allDreams[0], null, 2));

    // Get dreams that have at least symbols (not requiring themes)
    const dreams = allDreams.filter(dream => dream.symbols.length > 0);
    console.log(`Found ${dreams.length} public dreams with symbols`);

    // If there are no dreams with symbols, return helpful message
    if (dreams.length === 0) {
      console.log('No dreams found with symbols, returning empty spaces');
      const message = allDreams.length > 0 
        ? 'Add symbols to your published dream stories to see them grouped into spaces!'
        : 'No published dream stories found. Share your dreams with the community to create spaces!';
      
      return NextResponse.json({
        spaces: [],
        message,
        debug: {
          totalDreams: allDreams.length,
          dreamsWithSymbols: 0,
          dreamsWithThemes: allDreams.filter(d => d.themes.length > 0).length
        }
      });
    }

    // Log symbol and theme counts for debugging
    const symbolCounts = new Map<string, number>();
    const themeCounts = new Map<string, number>();
    const userCounts = new Map<string, number>();

    dreams.forEach(dream => {
      // Count symbols
      dream.symbols.forEach(symbol => {
        const symbolName = symbol.name.toLowerCase();
        symbolCounts.set(symbolName, (symbolCounts.get(symbolName) || 0) + 1);
      });
      // Count themes
      dream.themes.forEach(theme => {
        const themeName = theme.name.toLowerCase();
        themeCounts.set(themeName, (themeCounts.get(themeName) || 0) + 1);
      });
      // Count dreams per user
      if (dream.user?.name) {
        userCounts.set(dream.user.name, (userCounts.get(dream.user.name) || 0) + 1);
      }
    });

    console.log('Analysis results:');
    console.log('Symbol counts:', Object.fromEntries(symbolCounts));
    console.log('Theme counts:', Object.fromEntries(themeCounts));
    console.log('Dreams per user:', Object.fromEntries(userCounts));

    // Group dreams by common symbols and themes
    const spaces = analyzeAndGroupDreams(dreams);
    console.log(`Created ${spaces.length} dream spaces`);

    // Filter spaces based on search
    const filteredSpaces = spaces.filter(space => 
      space.name.toLowerCase().includes(search.toLowerCase()) ||
      space.description.toLowerCase().includes(search.toLowerCase()) ||
      space.primarySymbols.some(symbol => 
        symbol.toLowerCase().includes(search.toLowerCase())
      )
    );

    console.log(`Returning ${filteredSpaces.length} spaces after search filter`);

    return NextResponse.json({
      spaces: filteredSpaces,
      message: filteredSpaces.length > 0 ? null : 'No matching dream spaces found',
      debug: {
        totalDreams: allDreams.length,
        dreamsWithSymbols: dreams.length,
        dreamsWithThemes: allDreams.filter(d => d.themes.length > 0).length,
        totalSpaces: spaces.length,
        filteredSpaces: filteredSpaces.length,
        searchQuery: search || null
      }
    });
  } catch (error) {
    console.error('Error in spaces API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch dream spaces',
        message: error instanceof Error ? error.message : 'Unknown error',
        debug: { timestamp: new Date().toISOString() }
      },
      { status: 500 }
    );
  }
}

function analyzeAndGroupDreams(dreams: any[]) {
  // Create a map to store symbol frequencies and their associated themes
  const symbolFrequency = new Map<string, number>();
  const dreamsBySymbol = new Map<string, Set<string>>();
  const symbolThemes = new Map<string, Map<string, number>>();
  const symbolUsers = new Map<string, Set<string>>();

  // Analyze dreams and count symbol frequencies
  dreams.forEach(dream => {
    dream.symbols.forEach((symbol: any) => {
      const symbolName = symbol.name.toLowerCase();
      symbolFrequency.set(symbolName, (symbolFrequency.get(symbolName) || 0) + 1);
      
      if (!dreamsBySymbol.has(symbolName)) {
        dreamsBySymbol.set(symbolName, new Set());
        symbolThemes.set(symbolName, new Map());
        symbolUsers.set(symbolName, new Set());
      }
      dreamsBySymbol.get(symbolName)?.add(dream.id);
      if (dream.user?.name) {
        symbolUsers.get(symbolName)?.add(dream.user.name);
      }

      // Associate themes with symbols
      dream.themes.forEach((theme: any) => {
        const themeMap = symbolThemes.get(symbolName)!;
        themeMap.set(theme.name, (themeMap.get(theme.name) || 0) + 1);
      });
    });
  });

  // Find related symbols that frequently appear together
  const relatedSymbols = findRelatedSymbols(dreams);

  // Create spaces based on symbol clusters
  const spaces = createSpacesFromSymbols(
    symbolFrequency,
    dreamsBySymbol,
    relatedSymbols,
    symbolThemes,
    symbolUsers,
    dreams
  );

  return spaces;
}

function findRelatedSymbols(dreams: any[]) {
  const relationships = new Map<string, Map<string, number>>();

  dreams.forEach(dream => {
    const symbols = dream.symbols.map((s: any) => s.name.toLowerCase());
    
    // Create relationships between all symbol pairs in this dream
    symbols.forEach((symbol1: string) => {
      if (!relationships.has(symbol1)) {
        relationships.set(symbol1, new Map());
      }
      
      symbols.forEach((symbol2: string) => {
        if (symbol1 !== symbol2) {
          const symbolMap = relationships.get(symbol1)!;
          symbolMap.set(symbol2, (symbolMap.get(symbol2) || 0) + 1);
        }
      });
    });
  });

  return relationships;
}

function createSpacesFromSymbols(
  symbolFrequency: Map<string, number>,
  dreamsBySymbol: Map<string, Set<string>>,
  relatedSymbols: Map<string, Map<string, number>>,
  symbolThemes: Map<string, Map<string, number>>,
  symbolUsers: Map<string, Set<string>>,
  dreams: any[]
) {
  const spaces = [];
  const usedSymbols = new Set<string>();

  // Sort symbols by frequency
  const sortedSymbols = Array.from(symbolFrequency.entries())
    .sort((a, b) => b[1] - a[1]);

  for (const [symbol, frequency] of sortedSymbols) {
    if (usedSymbols.has(symbol)) continue;

    // Find related symbols for this space
    const relatedMap = relatedSymbols.get(symbol) || new Map();
    const relatedArray = Array.from(relatedMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([symbol]) => symbol)
      .filter(s => !usedSymbols.has(s));

    // Mark symbols as used
    usedSymbols.add(symbol);
    relatedArray.forEach(s => usedSymbols.add(s));

    // Calculate dream count and unique dreamers for this space
    const dreamIds = new Set([
      ...Array.from(dreamsBySymbol.get(symbol) || []),
      ...relatedArray.flatMap(s => Array.from(dreamsBySymbol.get(s) || []))
    ]);

    const uniqueDreamers = new Set([
      ...Array.from(symbolUsers.get(symbol) || []),
      ...relatedArray.flatMap(s => Array.from(symbolUsers.get(s) || []))
    ]);

    // Find dominant theme for this symbol cluster
    const dominantTheme = findDominantTheme(symbol, relatedArray, symbolThemes);

    // Create space
    spaces.push({
      id: symbol.toLowerCase().replace(/\s+/g, '-'),
      name: generateSpaceName(symbol, relatedArray, dominantTheme),
      description: generateSpaceDescription(symbol, relatedArray, dominantTheme, uniqueDreamers.size),
      symbolCount: relatedArray.length + 1,
      dreamCount: dreamIds.size,
      primarySymbols: [symbol, ...relatedArray].map(s => 
        s.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
      ),
      dominantTheme,
      dreamerCount: uniqueDreamers.size
    });
  }

  return spaces;
}

function generateSpaceName(mainSymbol: string, relatedSymbols: string[], theme: string) {
  const capitalizedSymbol = mainSymbol.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  if (relatedSymbols.length === 0) {
    return `${capitalizedSymbol} Dreams`;
  }

  const capitalizedRelated = relatedSymbols[0].split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return `${capitalizedSymbol} & ${capitalizedRelated} Dreams`;
}

function generateSpaceDescription(mainSymbol: string, relatedSymbols: string[], theme: string, dreamerCount: number) {
  const symbolList = [mainSymbol, ...relatedSymbols]
    .map(s => s.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '))
    .join(', ');

  return `Explore dreams featuring ${symbolList} shared by ${dreamerCount} dreamers. Common theme: ${theme}.`;
}

function findDominantTheme(
  mainSymbol: string,
  relatedSymbols: string[],
  symbolThemes: Map<string, Map<string, number>>
) {
  const themeFrequency = new Map<string, number>();
  
  // Combine theme frequencies from main symbol and related symbols
  [mainSymbol, ...relatedSymbols].forEach(symbol => {
    const themes = symbolThemes.get(symbol) || new Map();
    themes.forEach((count, theme) => {
      themeFrequency.set(theme, (themeFrequency.get(theme) || 0) + count);
    });
  });

  // Get the most frequent theme
  return Array.from(themeFrequency.entries())
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'General';
} 