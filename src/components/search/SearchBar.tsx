import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search as SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  type: 'dream' | 'story';
  title: string;
  preview: string;
  userId: string;
}

export function SearchBar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) {
      setResults([]);
      setError(null);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || `Search failed: ${response.status}`);
        }
        
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error('Search error:', error);
        setError(error instanceof Error ? error.message : 'Search failed');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const formatPreview = (content: any): string => {
    if (typeof content === 'string') {
      return content;
    }
    if (typeof content === 'object' && content !== null) {
      // Handle story content structure
      if (content.introduction) {
        return content.introduction;
      }
      if (content.sections && Array.isArray(content.sections)) {
        return content.sections[0]?.content || '';
      }
      // Fallback to stringifying but clean it up
      const str = JSON.stringify(content);
      return str.replace(/[{}"\\]/g, '').slice(0, 100);
    }
    return '';
  };

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    if (result.type === 'dream') {
      router.push(`/dreams/${result.id}`);
    } else {
      router.push(`/stories/${result.id}`);
    }
  };

  return (
    <div className="relative w-full max-w-sm">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-start bg-white/5 border-purple-500/20 hover:bg-white/10 hover:border-purple-500/30"
          >
            <SearchIcon className="mr-2 h-4 w-4 shrink-0 text-purple-300" />
            <span className="text-purple-200">Search dreams and stories...</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[min(calc(100vw-2rem),400px)] p-0 bg-black/90 backdrop-blur-xl border border-purple-500/20">
          <Command>
            <CommandInput
              placeholder="Type to search..."
              value={query}
              onValueChange={setQuery}
              className="border-none focus:ring-0 bg-transparent text-purple-100"
            />
            <CommandList>
              <CommandEmpty className="py-6 text-center text-sm text-purple-200/60">
                {loading ? 'Searching...' : error ? `Error: ${error}` : 'No results found.'}
              </CommandEmpty>
              {results.length > 0 && !error && (
                <CommandGroup>
                  {results.map((result) => (
                    <div
                      key={`${result.type}-${result.id}`}
                      className="px-2 py-1 cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSelect(result);
                      }}
                    >
                      <CommandItem
                        value={result.title}
                        className="group cursor-pointer rounded-lg transition-all duration-200 hover:bg-purple-500/20 active:scale-[0.98] active:bg-purple-500/30"
                      >
                        <div className="flex flex-col gap-1 py-2 w-full">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-xs px-1.5 py-0.5 rounded transition-colors",
                              result.type === 'dream' 
                                ? 'bg-purple-500/20 text-purple-200 group-hover:bg-purple-500/30' 
                                : 'bg-pink-500/20 text-pink-200 group-hover:bg-pink-500/30'
                            )}>
                              {result.type === 'dream' ? 'Dream' : 'Story'}
                            </span>
                            <span className="font-medium text-purple-100 group-hover:text-white transition-colors">{result.title}</span>
                          </div>
                          <p className="text-sm text-purple-200/70 group-hover:text-purple-200 transition-colors line-clamp-2">
                            {formatPreview(result.preview)}
                          </p>
                        </div>
                      </CommandItem>
                    </div>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
} 