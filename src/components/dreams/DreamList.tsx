"use client";

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

interface Dream {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  symbols: Array<{ id: string; name: string }>;
  themes: Array<{ id: string; name: string }>;
  emotions: Array<{ id: string; name: string }>;
}

interface DreamListProps {
  dreams: Dream[];
}

export function DreamList({ dreams }: DreamListProps) {
  if (dreams.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            No dreams recorded yet. Start by adding your first dream!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {dreams.map((dream) => (
        <Link key={dream.id} href={`/dreams/${dream.id}`}>
          <Card className="hover:bg-accent/5 transition-colors">
            <CardHeader>
              <CardTitle className="text-xl">{dream.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {formatDate(dream.createdAt)}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-sm line-clamp-2">{dream.content}</p>
              
              {(dream.symbols.length > 0 || dream.themes.length > 0 || dream.emotions.length > 0) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {dream.symbols.map((symbol) => (
                    <span
                      key={symbol.id}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                    >
                      {symbol.name}
                    </span>
                  ))}
                  {dream.themes.map((theme) => (
                    <span
                      key={theme.id}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary"
                    >
                      {theme.name}
                    </span>
                  ))}
                  {dream.emotions.map((emotion) => (
                    <span
                      key={emotion.id}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent-foreground"
                    >
                      {emotion.name}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
} 