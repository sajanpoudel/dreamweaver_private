"use client";

import { formatDate } from '../../lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { DreamActions } from '../dreams/DreamActions';
import { DreamAnalysis } from '../dreams/DreamAnalysis';
import DreamStory from '../dreams/DreamStory';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Home } from 'lucide-react';
import React from 'react';

interface Dream {
  id: string;
  title: string | null;
  content: string;
  createdAt: Date;
  analysis: string | null;
  symbols: Array<{ name: string }>;
  themes: Array<{ name: string }>;
  emotions: Array<{ name: string }>;
  isPublic: boolean;
}

interface DreamViewProps {
  dream: Dream;
}

export function DreamView({ dream }: DreamViewProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1c2e] via-[#2d2b55] to-[#3c1f52] overflow-hidden">
      <div className="relative container max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <Button
            onClick={() => router.push('/dashboard')}
            variant="ghost"
            className="text-purple-200/80 hover:text-purple-200 hover:bg-purple-500/10 flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <DreamActions dream={dream} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl blur-3xl"></div>
          <Card className="relative backdrop-blur-lg bg-white/5 rounded-2xl shadow-[0_0_15px_rgba(168,85,247,0.15)] border border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
                {dream.title || 'Untitled Dream'}
              </CardTitle>
              <p className="text-sm text-purple-200/80">
                {formatDate(dream.createdAt)}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-purple-100 whitespace-pre-wrap">{dream.content}</p>
              
              {(dream.symbols.length > 0 || dream.themes.length > 0 || dream.emotions.length > 0) && (
                <div className="mt-6 space-y-4">
                  {dream.symbols.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-purple-200 mb-2">Symbols</h3>
                      <div className="flex flex-wrap gap-2">
                        {dream.symbols.map(symbol => (
                          <span
                            key={symbol.name}
                            className="px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/20"
                          >
                            {symbol.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {dream.themes.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-purple-200 mb-2">Themes</h3>
                      <div className="flex flex-wrap gap-2">
                        {dream.themes.map(theme => (
                          <span
                            key={theme.name}
                            className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-200 border border-blue-500/20"
                          >
                            {theme.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {dream.emotions.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-purple-200 mb-2">Emotions</h3>
                      <div className="flex flex-wrap gap-2">
                        {dream.emotions.map(emotion => (
                          <span
                            key={emotion.name}
                            className="px-2 py-1 text-xs rounded-full bg-pink-500/20 text-pink-200 border border-pink-500/20"
                          >
                            {emotion.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <DreamAnalysis dreamId={dream.id} initialAnalysis={dream.analysis} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <DreamStory dreamId={dream.id} />
        </motion.div>
      </div>
    </div>
  );
} 