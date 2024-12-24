import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DreamMetadataProps {
  symbols: Array<{ id: string; name: string; meaning?: string | null }>;
  themes: Array<{ id: string; name: string }>;
  emotions: Array<{ id: string; name: string; intensity: number }>;
}

export function DreamMetadata({ symbols, themes, emotions }: DreamMetadataProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Symbols</CardTitle>
        </CardHeader>
        <CardContent>
          {symbols.length > 0 ? (
            <ul className="space-y-2">
              {symbols.map((symbol) => (
                <li key={symbol.id} className="text-sm">
                  <span className="font-medium">{symbol.name}</span>
                  {symbol.meaning && (
                    <p className="text-muted-foreground text-xs mt-1">
                      {symbol.meaning}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No symbols identified</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Themes</CardTitle>
        </CardHeader>
        <CardContent>
          {themes.length > 0 ? (
            <ul className="space-y-2">
              {themes.map((theme) => (
                <li key={theme.id} className="text-sm">
                  {theme.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No themes identified</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Emotions</CardTitle>
        </CardHeader>
        <CardContent>
          {emotions.length > 0 ? (
            <ul className="space-y-2">
              {emotions.map((emotion) => (
                <li key={emotion.id} className="text-sm flex items-center gap-2">
                  <span>{emotion.name}</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(emotion.intensity / 10) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No emotions identified</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 