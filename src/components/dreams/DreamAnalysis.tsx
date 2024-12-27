'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface Symbol {
  name: string;
  meaning: string;
}

interface Emotion {
  name: string;
  intensity: number;
}

interface Pattern {
  name: string;
  description: string;
  confidence: number;
}

interface Insight {
  title: string;
  description: string;
  confidence: number;
  category: string;
  actionable: boolean;
  recommendation?: string;
}

interface Analysis {
  symbols: Symbol[];
  themes: string[];
  emotions: Emotion[];
  patterns: Pattern[];
  insights: Insight[];
}

interface DreamAnalysisProps {
  dreamId: string;
  initialAnalysis: string | null;
}

export function DreamAnalysis({ dreamId, initialAnalysis }: DreamAnalysisProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(
    initialAnalysis ? JSON.parse(initialAnalysis) : null
  );

  const analyzeHandler = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/dreams/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dreamId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to analyze dream');
      }

      const analysisData = await response.json();
      setAnalysis(analysisData);
      toast.success('Dream analyzed successfully!');
    } catch (error) {
      console.error('Error analyzing dream:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to analyze dream');
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
            {!analysis && (
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
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Analyze Dream
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {analysis ? (
              <motion.div
                key="analysis"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="relative space-y-8"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full filter blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 rounded-full filter blur-3xl"></div>
                
                {/* Symbols Section */}
                <div className="relative">
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
                </div>

                {/* Themes Section */}
                <div className="relative">
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
                </div>

                {/* Emotions Section */}
                <div className="relative">
                  <h3 className="text-lg font-semibold text-purple-200 mb-4">Emotions</h3>
                  <div className="space-y-4">
                    {analysis.emotions.map((emotion: Emotion, index: number) => (
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
                </div>

                {/* Insights Section */}
                <div className="relative">
                  <h3 className="text-lg font-semibold text-purple-200 mb-4">Insights</h3>
                  <div className="space-y-4">
                    {analysis.insights.map((insight: Insight, index: number) => (
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
                                {(insight.confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-purple-200/80 mb-3">{insight.description}</p>
                          {insight.actionable && insight.recommendation && (
                            <div className="mt-2 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                              <p className="text-sm text-purple-200/90">{insight.recommendation}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

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
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Reanalyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Reanalyze
                      </>
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
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
          </AnimatePresence>
        </div>
      </Card>
    </div>
  );
} 