'use client';

import { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface DreamAnalysisProps {
  dreamId: string;
  initialAnalysis?: string | null;
}

interface Analysis {
  symbols: Array<{ name: string; meaning: string }>;
  themes: string[];
  emotions: Array<{ name: string; intensity: number }>;
  patterns: Array<{ name: string; description: string; confidence: number }>;
  insights: Array<{
    title: string;
    description: string;
    confidence: number;
    category: string;
    actionable: boolean;
    recommendation?: string;
  }>;
}

interface AnalysisResponse {
  analysis: Analysis;
  patterns: Array<{
    name: string;
    description: string;
    confidence: number;
    frequency: number;
  }>;
  insights: Array<{
    title: string;
    description: string;
    confidence: number;
    category: string;
    actionable: boolean;
    recommendation?: string;
  }>;
}

function tryParseJSON(jsonString: string | null): Analysis | null {
  if (!jsonString) return null;
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to parse initial analysis:', error);
    return null;
  }
}

export function DreamAnalysis({ dreamId, initialAnalysis }: DreamAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(
    tryParseJSON(initialAnalysis)
  );
  const [patterns, setPatterns] = useState<AnalysisResponse['patterns']>([]);
  const [insights, setInsights] = useState<AnalysisResponse['insights']>([]);
  const [error, setError] = useState<string | null>(null);

  const analyzeDream = async () => {
    try {
      setIsAnalyzing(true);
      setError(null);

      const response = await axios.post<AnalysisResponse>(`/api/dreams/analyze`, {
        dreamId,
      });

      setAnalysis(response.data.analysis);
      setPatterns(response.data.patterns);
      setInsights(response.data.insights);
    } catch (err) {
      console.error('Error analyzing dream:', err);
      setError('Failed to analyze dream. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Dream Analysis</h3>
          <Button
            onClick={analyzeDream}
            disabled={isAnalyzing}
            className="flex items-center gap-2"
          >
            {isAnalyzing && <Loader2 className="h-4 w-4 animate-spin" />}
            {isAnalyzing ? 'Analyzing...' : 'Analyze Dream'}
          </Button>
        </div>

        {error && (
          <p className="text-sm text-red-500 mb-4">{error}</p>
        )}

        {analysis ? (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-2">Symbols</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.symbols.map((symbol, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg">
                    <p className="font-medium">{symbol.name}</p>
                    <p className="text-sm text-muted-foreground">{symbol.meaning}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Themes</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.themes.map((theme, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Emotions</h4>
              <div className="space-y-2">
                {analysis.emotions.map((emotion, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="min-w-[100px]">{emotion.name}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${emotion.intensity * 10}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {emotion.intensity}/10
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Patterns</h4>
              <div className="space-y-4">
                {analysis.patterns.map((pattern, index) => (
                  <div key={index} className="p-4 bg-muted rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium">{pattern.name}</h5>
                      <span className="text-sm text-muted-foreground">
                        Confidence: {Math.round(pattern.confidence * 100)}%
                      </span>
                    </div>
                    <p className="text-sm">{pattern.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Psychological Insights</h4>
              <div className="space-y-4">
                {analysis.insights.map((insight, index) => (
                  <div key={index} className="p-4 bg-muted rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium">{insight.title}</h5>
                      <div className="flex items-center gap-2">
                        <span className="text-sm px-2 py-1 bg-primary/10 rounded-full">
                          {insight.category}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(insight.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-sm mb-2">{insight.description}</p>
                    {insight.actionable && insight.recommendation && (
                      <div className="mt-2 p-2 bg-background rounded border">
                        <p className="text-sm font-medium">Recommendation:</p>
                        <p className="text-sm">{insight.recommendation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 italic">
            Click the analyze button to get insights about your dream.
          </p>
        )}
      </Card>

      {patterns.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Your Dream Patterns</h3>
          <div className="space-y-4">
            {patterns.map((pattern, index) => (
              <div key={index} className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium">{pattern.name}</h5>
                  <div className="text-sm text-muted-foreground">
                    <span className="mr-2">
                      Frequency: {pattern.frequency}
                    </span>
                    <span>
                      Confidence: {Math.round(pattern.confidence * 100)}%
                    </span>
                  </div>
                </div>
                <p className="text-sm">{pattern.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {insights.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Personal Insights</h3>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium">{insight.title}</h5>
                  <div className="flex items-center gap-2">
                    <span className="text-sm px-2 py-1 bg-primary/10 rounded-full">
                      {insight.category}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(insight.confidence * 100)}%
                    </span>
                  </div>
                </div>
                <p className="text-sm mb-2">{insight.description}</p>
                {insight.actionable && insight.recommendation && (
                  <div className="mt-2 p-2 bg-background rounded border">
                    <p className="text-sm font-medium">Recommendation:</p>
                    <p className="text-sm">{insight.recommendation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
} 