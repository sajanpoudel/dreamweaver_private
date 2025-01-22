'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DreamList } from '../dreams/DreamList';
import { DreamStats } from '../dreams/DreamStats';
import { Dream as PrismaDream } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { 
  BarChart3, 
  Brain, 
  Calendar, 
  Clock, 
  Sparkles, 
  TrendingUp, 
  Moon,
  Heart,
  CloudRain,
  Sun,
  Waves,
  LucideIcon
} from 'lucide-react';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface Dream {
  id: string;
  title: string | null;
  content: string;
  analysis: any;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  isPublic: boolean;
  symbols: Array<{ id: string; name: string; description: string | null }>;
  themes: Array<{ id: string; name: string }>;
  emotions: Array<{ id: string; name: string }>;
}

interface DreamPattern {
  pattern: string;
  frequency: number;
  description: string;
  significance: string;
  recommendations: string[];
}

interface EmotionalInsight {
  emotion: string;
  frequency: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  impact: string;
  suggestions: string[];
}

interface TimeAnalysis {
  mostActiveTime: string;
  dreamFrequency: number;
  longestStreak: number;
  totalDreamingDays: number;
  monthlyAverage: number;
}

interface DreamAnalytics {
  patterns: DreamPattern[];
  emotions: EmotionalInsight[];
  timeAnalysis: TimeAnalysis;
  personalInsights: string;
  mentalStateAnalysis: string;
  recommendedActions: string[];
  overallWellbeingScore: number;
}

interface DashboardContentProps {
  dreams: Dream[];
  totalDreams: number;
  topSymbols: Array<{ name: string; count: number }>;
  topThemes: Array<{ name: string; count: number }>;
  topEmotions: Array<{ name: string; count: number }>;
  analytics: DreamAnalytics;
}

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description: string;
  gradient?: string;
  iconColor?: string;
}

interface InsightSectionProps {
  title: string;
  children: React.ReactNode;
  icon: LucideIcon;
}

const AnalyticsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  description,
  gradient = "from-purple-500/20 to-pink-500/20",
  iconColor = "text-purple-300"
}: AnalyticsCardProps) => (
  <Card className="p-6 backdrop-blur-sm bg-white/5 border border-purple-500/20">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-purple-200/70">{title}</p>
        <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
        {description && (
          <p className="text-sm text-purple-200/50 mt-1">{description}</p>
        )}
      </div>
      <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} border border-purple-500/20`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
    </div>
  </Card>
);

const InsightSection = ({ title, children, icon: Icon }: InsightSectionProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-xl backdrop-blur-sm bg-white/5 border border-purple-500/20 p-6"
  >
    <div className="flex items-center gap-3 mb-6">
      <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20">
        <Icon className="w-5 h-5 text-purple-300" />
      </div>
      <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-300 to-pink-300 text-transparent bg-clip-text">
        {title}
      </h2>
    </div>
    {children}
  </motion.div>
);

export function DashboardContent({
  dreams,
  totalDreams,
  topSymbols,
  topThemes,
  topEmotions,
  analytics
}: DashboardContentProps) {
  const router = useRouter();

  // Default values for analytics
  const defaultAnalytics = {
    patterns: [],
    emotions: [],
    timeAnalysis: {
      mostActiveTime: 'N/A',
      dreamFrequency: 0,
      longestStreak: 0,
      totalDreamingDays: 0,
      monthlyAverage: 0
    },
    personalInsights: '',
    mentalStateAnalysis: '',
    recommendedActions: [],
    overallWellbeingScore: 50
  };

  // Merge provided analytics with defaults
  const safeAnalytics = {
    ...defaultAnalytics,
    ...analytics,
    timeAnalysis: {
      ...defaultAnalytics.timeAnalysis,
      ...(analytics?.timeAnalysis || {})
    }
  };

  return (
    <div className="min-h-screen overflow-hidden">
      <div className="relative container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 text-transparent bg-clip-text mb-4">
              Your Dream Journey Analysis
            </h1>
            <p className="text-lg text-purple-200/80 max-w-2xl mx-auto">
              A comprehensive analysis of your dream patterns, emotions, and personal growth
            </p>
          </motion.div>

          {/* Wellbeing Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center mb-8"
          >
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-3xl font-bold text-white">
                  {safeAnalytics.overallWellbeingScore}%
                </div>
              </div>
              <Progress 
                value={safeAnalytics.overallWellbeingScore} 
                className="w-32 h-32 [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-pink-500"
              />
            </div>
            <h3 className="text-xl font-semibold text-purple-200 mt-4">Overall Wellbeing Score</h3>
          </motion.div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <AnalyticsCard
              title="Total Dreams"
              value={totalDreams}
              icon={Moon}
              description="Dreams recorded"
            />
            <AnalyticsCard
              title="Active Streak"
              value={`${safeAnalytics.timeAnalysis?.longestStreak ?? 0} days`}
              icon={TrendingUp}
              gradient="from-green-500/20 to-emerald-500/20"
              iconColor="text-green-300"
              description="Current active streak"
            />
            <AnalyticsCard
              title="Monthly Average"
              value={Number(safeAnalytics.timeAnalysis?.monthlyAverage ?? 0).toFixed(1)}
              icon={Calendar}
              gradient="from-blue-500/20 to-cyan-500/20"
              iconColor="text-blue-300"
              description="Dreams per month"
            />
            <AnalyticsCard
              title="Most Active Time"
              value={safeAnalytics.timeAnalysis?.mostActiveTime ?? 'N/A'}
              icon={Clock}
              gradient="from-amber-500/20 to-orange-500/20"
              iconColor="text-amber-300"
              description="Peak dreaming hours"
            />
          </div>

          {/* Main Analysis Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="patterns">Patterns</TabsTrigger>
              <TabsTrigger value="emotions">Emotions</TabsTrigger>
              <TabsTrigger value="actions">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InsightSection title="Dream Activity" icon={Brain}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200">Monthly Average</span>
                      <span className="text-purple-100 font-semibold">
                        {Number(safeAnalytics.timeAnalysis?.monthlyAverage ?? 0).toFixed(1)} dreams
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200">Longest Streak</span>
                      <span className="text-purple-100 font-semibold">
                        {safeAnalytics.timeAnalysis?.longestStreak ?? 0} days
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200">Most Active Time</span>
                      <span className="text-purple-100 font-semibold">
                        {safeAnalytics.timeAnalysis?.mostActiveTime ?? 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200">Total Dream Days</span>
                      <span className="text-purple-100 font-semibold">
                        {safeAnalytics.timeAnalysis?.totalDreamingDays ?? 0} days
                      </span>
                    </div>
                  </div>
                </InsightSection>

                <InsightSection title="Mental State" icon={Brain}>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-purple-200">Overall Wellbeing</span>
                        <span className="text-purple-100 font-semibold">{safeAnalytics.overallWellbeingScore ?? 50}%</span>
                      </div>
                      <Progress value={safeAnalytics.overallWellbeingScore ?? 50} className="h-2" />
                    </div>
                    {safeAnalytics.mentalStateAnalysis && (
                      <div className="space-y-4">
                        {(() => {
                          try {
                            const analysis = typeof safeAnalytics.mentalStateAnalysis === 'string' 
                              ? JSON.parse(safeAnalytics.mentalStateAnalysis)
                              : safeAnalytics.mentalStateAnalysis;

                            return (
                              <>
                                {analysis.overallMood && (
                                  <div className="p-4 rounded-lg bg-white/5 border border-purple-500/10">
                                    <h4 className="text-sm font-medium text-purple-200 mb-2">Overall Mood</h4>
                                    <p className="text-purple-200/70 text-sm">{analysis.overallMood}</p>
                                  </div>
                                )}
                                
                                {analysis.dominantEmotions?.length > 0 && (
                                  <div className="p-4 rounded-lg bg-white/5 border border-purple-500/10">
                                    <h4 className="text-sm font-medium text-purple-200 mb-2">Dominant Emotions</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {analysis.dominantEmotions.map((emotion: string, index: number) => (
                                        <span key={index} className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-200/70 text-xs">
                                          {emotion}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {analysis.stressAndAnxietyLevels && (
                                  <div className="p-4 rounded-lg bg-white/5 border border-purple-500/10">
                                    <h4 className="text-sm font-medium text-purple-200 mb-2">Stress & Anxiety Levels</h4>
                                    <p className="text-purple-200/70 text-sm">{analysis.stressAndAnxietyLevels}</p>
                                  </div>
                                )}

                                {analysis.emotionalInsights && (
                                  <div className="p-4 rounded-lg bg-white/5 border border-purple-500/10">
                                    <h4 className="text-sm font-medium text-purple-200 mb-2">Emotional Insights</h4>
                                    <p className="text-purple-200/70 text-sm">{analysis.emotionalInsights}</p>
                                  </div>
                                )}
                              </>
                            );
                          } catch (error) {
                            return (
                              <div className="p-4 rounded-lg bg-white/5 border border-purple-500/10">
                                <p className="text-purple-200/70 text-sm">{safeAnalytics.mentalStateAnalysis || 'No analysis available yet.'}</p>
                              </div>
                            );
                          }
                        })()}
                      </div>
                    )}
                  </div>
                </InsightSection>
              </div>
            </TabsContent>

            <TabsContent value="patterns">
              <InsightSection title="Dream Patterns" icon={Brain}>
                <div className="grid gap-6">
                  {(safeAnalytics.patterns || []).map((pattern, index) => (
                    <div key={index} className="p-4 rounded-lg bg-white/5 border border-purple-500/10">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-purple-200">{pattern.pattern}</h3>
                        <div className="flex items-center gap-2">
                          <Progress value={pattern.frequency ?? 0} className="w-24" />
                          <span className="text-sm text-purple-200/70">{pattern.frequency ?? 0}%</span>
                        </div>
                      </div>
                      <p className="text-purple-200/70 text-sm mb-2">{pattern.description}</p>
                      <div className="text-xs text-purple-200/50 italic">
                        {pattern.significance}
                      </div>
                    </div>
                  ))}
                  {(!safeAnalytics.patterns || safeAnalytics.patterns.length === 0) && (
                    <div className="text-center p-6 text-purple-200/50">
                      No dream patterns detected yet.
                    </div>
                  )}
                </div>
              </InsightSection>
            </TabsContent>

            <TabsContent value="emotions">
              <InsightSection title="Emotional Landscape" icon={Heart}>
                <div className="grid gap-6">
                  {(safeAnalytics.emotions || []).map((emotion, index) => (
                    <div key={index} className="p-4 rounded-lg bg-white/5 border border-purple-500/10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-purple-200">{emotion.emotion}</h3>
                          <div className={`px-2 py-0.5 rounded-full text-xs ${
                            emotion.trend === 'increasing' ? 'bg-green-500/20 text-green-300' :
                            emotion.trend === 'decreasing' ? 'bg-red-500/20 text-red-300' :
                            'bg-blue-500/20 text-blue-300'
                          }`}>
                            {emotion.trend}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={emotion.frequency ?? 0} className="w-24" />
                          <span className="text-sm text-purple-200/70">{emotion.frequency ?? 0}%</span>
                        </div>
                      </div>
                      <p className="text-purple-200/70 text-sm mb-2">{emotion.impact}</p>
                      {Array.isArray(emotion.suggestions) && emotion.suggestions.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {emotion.suggestions.map((suggestion, idx) => (
                            <div key={idx} className="text-xs text-purple-200/50 flex items-center gap-2">
                              <div className="w-1 h-1 rounded-full bg-purple-400" />
                              {suggestion}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {(!safeAnalytics.emotions || safeAnalytics.emotions.length === 0) && (
                    <div className="text-center p-6 text-purple-200/50">
                      No emotional patterns detected yet.
                    </div>
                  )}
                </div>
              </InsightSection>
            </TabsContent>

            <TabsContent value="actions">
              <InsightSection title="Recommended Actions" icon={Brain}>
                <div className="grid gap-4">
                  {(() => {
                    try {
                      const actions = typeof safeAnalytics.recommendedActions === 'string'
                        ? JSON.parse(safeAnalytics.recommendedActions)
                        : safeAnalytics.recommendedActions;

                      if (Array.isArray(actions) && actions.length > 0) {
                        return actions.map((action, index) => (
                          <div key={index} className="p-4 rounded-lg bg-white/5 border border-purple-500/10 flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-purple-500/20 mt-0.5">
                              <div className="w-2 h-2 rounded-full bg-purple-400" />
                            </div>
                            <div>
                              <p className="text-purple-200/70">{action}</p>
                            </div>
                          </div>
                        ));
                      }
                    } catch (error) {
                      console.error('Error parsing recommended actions:', error);
                    }
                    
                    return (
                      <div className="text-center p-6 text-purple-200/50">
                        No recommended actions available yet.
                      </div>
                    );
                  })()}
                </div>
              </InsightSection>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 