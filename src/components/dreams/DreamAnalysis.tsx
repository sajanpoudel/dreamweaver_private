'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { parseAnalysis, type DreamAnalysis } from '@/lib/dream-analysis';
import { Card } from '../ui/card';

interface DreamAnalysisProps {
  dreamId: string;
  initialAnalysis?: string | null;
}

interface Symbol {
  name: string;
  meaning: string;
}

export function DreamAnalysis({ dreamId, initialAnalysis }: DreamAnalysisProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<DreamAnalysis | null>(() => {
    return initialAnalysis ? parseAnalysis(initialAnalysis) : null;
  });

  const analyzeHandler = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/dreams/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dreamId }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze dream');
      }

      const data = await response.json();
      const parsedAnalysis = parseAnalysis(data.analysis);
      setAnalysis(parsedAnalysis);
    } catch (error) {
      console.error('Error analyzing dream:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-3xl"></div>
      <Card className="relative backdrop-blur-lg bg-white/5 rounded-2xl shadow-[0_0_15px_rgba(168,85,247,0.15)] border border-purple-500/20 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
                Dream Analysis
              </h2>
              <p className="text-purple-200/80 text-sm">
                Uncover the deeper meaning of your dream
              </p>
            </div>
            {!analysis && !isLoading && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-200"></div>
                <Button
                  onClick={analyzeHandler}
                  disabled={isLoading}
                  className="relative bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-0 flex items-center gap-2 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-200"
                >
                  <Sparkles className="h-4 w-4" />
                  Analyze Dream
                </Button>
              </motion.div>
            )}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              <p className="text-purple-200">Analyzing your dream...</p>
            </div>
          ) : analysis ? (
            <div className="space-y-8">
              {analysis.symbols && analysis.symbols.length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold text-purple-200 mb-4">Symbols</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {analysis.symbols.map((symbol: Symbol, index: number) => (
                      <motion.div
                        key={symbol.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative group"
                      >
                        <div className="absolute inset-0 bg-purple-500/5 rounded-xl blur-sm"></div>
                        <div className="relative p-4 rounded-xl border border-purple-500/20 backdrop-blur-sm">
                          <h4 className="font-medium text-purple-200 mb-2">{symbol.name}</h4>
                          <p className="text-sm text-purple-200/80">{symbol.meaning}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {analysis.themes && analysis.themes.length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold text-purple-200 mb-4">Themes</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.themes.map((theme: string, index: number) => (
                      <motion.span
                        key={theme}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="px-3 py-1.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-500/20 text-sm"
                      >
                        {theme}
                      </motion.span>
                    ))}
                  </div>
                </section>
              )}

              {analysis.emotions && analysis.emotions.length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold text-purple-200 mb-4">Emotions</h3>
                  <div className="space-y-4">
                    {analysis.emotions.map((emotion: { name: string; intensity: number }, index: number) => (
                      <motion.div
                        key={emotion.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-purple-200">{emotion.name}</span>
                          <span className="text-sm text-purple-200/80">
                            Intensity: {emotion.intensity}/10
                          </span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(emotion.intensity / 10) * 100}%` }}
                            transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {analysis.insights && analysis.insights.length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold text-purple-200 mb-4">Insights</h3>
                  <div className="space-y-4">
                    {analysis.insights.map((insight, index: number) => (
                      <motion.div
                        key={insight.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative group"
                      >
                        <div className="absolute inset-0 bg-purple-500/5 rounded-xl blur-sm"></div>
                        <div className="relative p-4 rounded-xl border border-purple-500/20 backdrop-blur-sm">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-purple-200">{insight.title}</h4>
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/20">
                                {insight.category}
                              </span>
                              <span className="text-xs text-purple-200/80">
                                {Math.round(insight.confidence * 100)}%
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-purple-200/80 mb-3">{insight.description}</p>
                          {insight.actionable && (
                            <div className="mt-2 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                              <p className="text-sm text-purple-200/90">
                                <span className="font-medium">Recommendation:</span> {insight.recommendation}
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* Reanalyze Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 flex justify-end"
              >
                <Button
                  onClick={analyzeHandler}
                  disabled={isLoading}
                  variant="ghost"
                  className="text-purple-200/80 hover:text-purple-200 hover:bg-purple-500/10 flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Reanalyze
                </Button>
              </motion.div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-[1px]">
                <div className="w-full h-full rounded-full bg-white/5 backdrop-blur-sm flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-purple-200" />
                </div>
              </div>
              <p className="text-lg text-purple-200 mb-2">
                Ready to explore your dream?
              </p>
              <p className="text-sm text-purple-200/70">
                Click the analyze button to uncover hidden meanings and patterns
              </p>
            </motion.div>
          )}
        </div>
      </Card>
    </div>
  );
} 