'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Loader2, Sparkles, Brain, Heart, Lightbulb, Shapes, Compass } from 'lucide-react';
import { parseAnalysis, type DreamAnalysis } from '@/lib/dream-analysis';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface DreamAnalysisProps {
  dreamId: string;
  initialAnalysis?: string | null;
}

export function DreamAnalysis({ dreamId, initialAnalysis }: DreamAnalysisProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<DreamAnalysis | null>(
    initialAnalysis ? parseAnalysis(initialAnalysis) : null
  );

  const analyzeHandler = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/dreams/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dreamId }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze dream');
      }

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (error) {
      console.error('Error analyzing dream:', error);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="space-y-8">
      {!analysis && (
        <Card className="relative backdrop-blur-lg bg-white/5 rounded-2xl shadow-[0_0_15px_rgba(168,85,247,0.15)] border border-purple-500/20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Brain className="h-12 w-12 text-purple-500" />
              <h3 className="text-lg font-medium text-purple-200">Dream Analysis</h3>
              <p className="text-sm text-purple-200/80 text-center max-w-md">
                Analyze your dream to uncover its hidden meanings, symbols, and patterns.
                Our AI-powered analysis will provide deep insights into your subconscious mind.
              </p>
              <Button
                onClick={analyzeHandler}
                disabled={isLoading}
                className="bg-purple-500/20 text-purple-200 hover:bg-purple-500/30"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analyze Dream
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          <p className="text-purple-200">Analyzing your dream...</p> 
        </div>
      ) : analysis ? (
        <Card className="relative backdrop-blur-lg bg-white/5 rounded-2xl shadow-[0_0_15px_rgba(168,85,247,0.15)] border border-purple-500/20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-3xl"></div>
          <div className="relative backdrop-blur-lg bg-[#3c1f52]/50 rounded-2xl shadow-[0_0_15px_rgba(168,85,247,0.3)] border border-purple-500/20 p-8">
            <div className="space-y-8">
              {/* Narrative Analysis */}
              <section>
                <h3 className="text-lg font-semibold text-purple-200 mb-4 flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Narrative Elements
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="relative p-4 rounded-xl border border-purple-500/20 bg-[#3c1f52]/30">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-xl blur-2xl"></div>
                    <div className="relative z-10">
                      <h4 className="font-medium text-purple-200 mb-2">Setting</h4>
                      <p className="text-sm text-purple-200/80">{analysis.narrative.setting}</p>
                    </div>
                  </Card>
                  <Card className="relative p-4 rounded-xl border border-purple-500/20 bg-[#3c1f52]/10">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-xl blur-2xl"></div>
                    <div className="relative z-10">
                      <h4 className="font-medium text-purple-200 mb-2">Timeline</h4>
                      <p className="text-sm text-purple-200/80">{analysis.narrative.timeline}</p>
                    </div>
                  </Card>
                </div>
                <div className="mt-4">
                  <h4 className="font-medium text-purple-200 mb-2">Characters</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    {analysis.narrative.characters.map((character, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative p-4 rounded-xl border border-purple-500/20 bg-[#3c1f52]/30"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-xl blur-2xl"></div>
                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-purple-200">{character.type}</span>
                            <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-200">
                              Familiarity: {Math.round(character.familiarity * 100)}%
                            </span>
                          </div>
                          <p className="text-sm text-purple-200/80">{character.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Emotions */}
              <section>
                <h3 className="text-lg font-semibold text-purple-200 mb-4 flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Emotional Content
                </h3>
                <div className="space-y-4">
                  {analysis.emotions.map((emotion, index) => (
                    <motion.div
                      key={emotion.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative p-4 rounded-xl border border-purple-500/20 bg-[#3c1f52]/30"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-xl blur-2xl"></div>
                      <div className="relative z-10">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-purple-200">{emotion.name}</span>
                          <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-200">
                            {emotion.valence > 0 ? 'Positive' : 'Negative'}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between text-sm text-purple-200/80 mb-1">
                              <span>Intensity</span>
                              <span>{Math.round(emotion.intensity * 100)}%</span>
                            </div>
                            <Progress value={emotion.intensity * 100} className="h-2" />
                          </div>
                          {emotion.triggers.length > 0 && (
                            <div className="text-sm text-purple-200/80">
                              <span className="font-medium">Triggers: </span>
                              {emotion.triggers.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Symbols */}
              <section>
                <h3 className="text-lg font-semibold text-purple-200 mb-4 flex items-center gap-2">
                  <Shapes className="h-5 w-5" />
                  Symbols
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {analysis.symbols.map((symbol, index) => (
                    <motion.div
                      key={symbol.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative p-4 rounded-xl border border-purple-500/20 bg-[#3c1f52]/30"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-xl blur-2xl"></div>
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-purple-200">{symbol.name}</h4>
                          <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-200">
                            {symbol.type}
                          </span>
                        </div>
                        <p className="text-sm text-purple-200/80 mb-2">{symbol.meaning}</p>
                        <div className="flex items-center gap-2 text-xs text-purple-200/60">
                          <span>Significance:</span>
                          <Progress value={symbol.significance * 100} className="h-1 flex-1" />
                          <span>{Math.round(symbol.significance * 100)}%</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Themes */}
              <section>
                <h3 className="text-lg font-semibold text-purple-200 mb-4 flex items-center gap-2">
                  <Compass className="h-5 w-5" />
                  Themes
                </h3>
                <div className="space-y-4">
                  {analysis.themes.map((theme, index) => (
                    <motion.div
                      key={theme.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative p-4 rounded-xl border border-purple-500/20 bg-[#3c1f52]/30"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-xl blur-2xl"></div>
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-purple-200">{theme.name}</h4>
                            <span className="text-xs text-purple-200/60">{theme.category}</span>
                          </div>
                          <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-200">
                            {Math.round(theme.confidence * 100)}% confidence
                          </span>
                        </div>
                        <p className="text-sm text-purple-200/80">{theme.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Patterns */}
              {analysis.patterns.length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold text-purple-200 mb-4 flex items-center gap-2">
                    <Compass className="h-5 w-5" />
                    Patterns
                  </h3>
                  <div className="space-y-4">
                    {analysis.patterns.map((pattern, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative p-4 rounded-xl border border-purple-500/20 bg-[#3c1f52]/30"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-xl blur-2xl"></div>
                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-purple-200">{pattern.type}</span>
                            <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-200">
                              {Math.round(pattern.confidence * 100)}% confidence
                            </span>
                          </div>
                          <p className="text-sm text-purple-200/80 mb-2">{pattern.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {pattern.elements.map((element, i) => (
                              <span
                                key={i}
                                className="text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-200/80"
                              >
                                {element}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* Psychological Insights */}
              <section>
                <h3 className="text-lg font-semibold text-purple-200 mb-4 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Psychological Insights
                </h3>
                <div className="space-y-4">
                  {analysis.psychologicalInsights.map((insight, index) => (
                    <motion.div
                      key={insight.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative p-4 rounded-xl border border-purple-500/20 bg-[#3c1f52]/30"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-xl blur-2xl"></div>
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-purple-200">{insight.title}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-200">
                              {insight.category}
                            </span>
                            <span className="text-xs text-purple-200/80">
                              {Math.round(insight.confidence * 100)}%
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-purple-200/80 mb-3">{insight.description}</p>
                        {insight.actionable && insight.recommendation && (
                          <div className="mt-2 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                            <p className="text-sm text-purple-200/90">
                              <span className="font-medium">Recommendation:</span>{' '}
                              {insight.recommendation}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Mental State */}
              <section>
                <h3 className="text-lg font-semibold text-purple-200 mb-4 flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Mental State Indicators
                </h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="relative backdrop-blur-lg bg-white/5 rounded-2xl shadow-[0_0_15px_rgba(168,85,247,0.15)] border border-purple-500/20 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-3xl"></div>
                    <div className="relative z-10 p-4">
                      <h4 className="font-medium text-purple-200 mb-2">Stress Level</h4>
                      <div className="space-y-2">
                        <Progress value={analysis.mentalState.stressLevel * 10} className="h-2" />
                        <p className="text-sm text-purple-200/80 text-right">
                          {analysis.mentalState.stressLevel}/10
                        </p>
                      </div>
                    </div>
                  </Card>
                  <Card className="relative backdrop-blur-lg bg-white/5 rounded-2xl shadow-[0_0_15px_rgba(168,85,247,0.15)] border border-purple-500/20 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-3xl"></div>
                    <div className="relative z-10 p-4">
                      <h4 className="font-medium text-purple-200 mb-2">Anxiety Level</h4>
                      <div className="space-y-2">
                        <Progress value={analysis.mentalState.anxietyLevel * 10} className="h-2" />
                        <p className="text-sm text-purple-200/80 text-right">
                          {analysis.mentalState.anxietyLevel}/10
                        </p>
                      </div>
                    </div>
                  </Card>
                  <Card className="relative backdrop-blur-lg bg-white/5 rounded-2xl shadow-[0_0_15px_rgba(168,85,247,0.15)] border border-purple-500/20 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-3xl"></div>
                    <div className="relative z-10 p-4">
                      <h4 className="font-medium text-purple-200 mb-2">Mood Score</h4>
                      <div className="space-y-2">
                        <Progress value={analysis.mentalState.moodScore * 10} className="h-2" />
                        <p className="text-sm text-purple-200/80 text-right">
                          {analysis.mentalState.moodScore}/10
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
                {analysis.mentalState.notes && (
                  <div className="mt-4 p-4 rounded-xl border border-purple-500/20 bg-purple-500/5">
                    <p className="text-sm text-purple-200/80">{analysis.mentalState.notes}</p>
                  </div>
                )}
              </section>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
} 