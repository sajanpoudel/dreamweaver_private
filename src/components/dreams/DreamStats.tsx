import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DreamStatsProps {
  totalDreams: number;
  topSymbols: Array<{ name: string; count: number }>;
  topThemes: Array<{ name: string; count: number }>;
  topEmotions: Array<{ name: string; count: number }>;
}

export function DreamStats({
  totalDreams,
  topSymbols,
  topThemes,
  topEmotions,
}: DreamStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Total Dreams</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{totalDreams}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Symbols</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {topSymbols.map((symbol) => (
              <li key={symbol.name} className="text-sm flex justify-between">
                <span>{symbol.name}</span>
                <span className="text-muted-foreground">{symbol.count}x</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Themes</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {topThemes.map((theme) => (
              <li key={theme.name} className="text-sm flex justify-between">
                <span>{theme.name}</span>
                <span className="text-muted-foreground">{theme.count}x</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Emotions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {topEmotions.map((emotion) => (
              <li key={emotion.name} className="text-sm flex justify-between">
                <span>{emotion.name}</span>
                <span className="text-muted-foreground">{emotion.count}x</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
} 