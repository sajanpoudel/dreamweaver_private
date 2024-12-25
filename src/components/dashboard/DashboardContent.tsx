'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DreamList } from '../dreams/DreamList';
import { NewDreamButton } from '../dreams/NewDreamButton';
import { DreamStats } from '../dreams/DreamStats';
import { Dream as PrismaDream } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';

interface TopItem {
  name: string;
  count: number;
}

interface DashboardContentProps {
  dreams: (PrismaDream & {
    symbols: { id: string; name: string; description: string }[];
    themes: { id: string; name: string; description: string }[];
    emotions: { id: string; name: string; intensity: number; description: string }[];
  })[];
  totalDreams: number;
  topSymbols: TopItem[];
  topThemes: TopItem[];
  topEmotions: TopItem[];
}

const FallingStars = () => {
  return (
    <>
      {/* Top right corner stars - Diagonal falling */}
      <div className="absolute top-0 right-0 w-96 h-96 overflow-hidden pointer-events-none">
        <div className="animate-fallingStars1 absolute w-1 h-1 bg-yellow-300/80 rounded-full shadow-[0_0_2px_2px] shadow-yellow-200/50" style={{ top: '5%', right: '15%' }} />
        <div className="animate-fallingStars2 absolute w-1 h-1 bg-yellow-300/80 rounded-full shadow-[0_0_2px_2px] shadow-yellow-200/50" style={{ top: '20%', right: '35%' }} />
        <div className="animate-fallingStars3 absolute w-0.5 h-0.5 bg-yellow-300/80 rounded-full shadow-[0_0_2px_2px] shadow-yellow-200/50" style={{ top: '8%', right: '45%' }} />
      </div>

      {/* Top left corner stars - Vertical falling */}
      <div className="absolute top-0 left-0 w-96 h-96 overflow-hidden pointer-events-none">
        <div className="animate-fallingStarsVertical1 absolute w-1 h-1 bg-yellow-300/80 rounded-full shadow-[0_0_2px_2px] shadow-yellow-200/50" style={{ top: '5%', left: '15%' }} />
        <div className="animate-fallingStarsVertical2 absolute w-1 h-1 bg-yellow-300/80 rounded-full shadow-[0_0_2px_2px] shadow-yellow-200/50" style={{ top: '20%', left: '35%' }} />
        <div className="animate-fallingStarsVertical3 absolute w-0.5 h-0.5 bg-yellow-300/80 rounded-full shadow-[0_0_2px_2px] shadow-yellow-200/50" style={{ top: '8%', left: '45%' }} />
      </div>

      {/* Bottom right corner stars - Spiral pattern */}
      <div className="absolute bottom-0 right-0 w-96 h-96 overflow-hidden pointer-events-none">
        <div className="animate-fallingStarsSpiral1 absolute w-1 h-1 bg-yellow-300/80 rounded-full shadow-[0_0_2px_2px] shadow-yellow-200/50" style={{ bottom: '5%', right: '15%' }} />
        <div className="animate-fallingStarsSpiral2 absolute w-1 h-1 bg-yellow-300/80 rounded-full shadow-[0_0_2px_2px] shadow-yellow-200/50" style={{ bottom: '20%', right: '35%' }} />
        <div className="animate-fallingStarsSpiral3 absolute w-0.5 h-0.5 bg-yellow-300/80 rounded-full shadow-[0_0_2px_2px] shadow-yellow-200/50" style={{ bottom: '8%', right: '45%' }} />
      </div>

      {/* Bottom left corner stars - Zigzag pattern */}
      <div className="absolute bottom-0 left-0 w-96 h-96 overflow-hidden pointer-events-none">
        <div className="animate-fallingStarsZigzag1 absolute w-1 h-1 bg-yellow-300/80 rounded-full shadow-[0_0_2px_2px] shadow-yellow-200/50" style={{ bottom: '5%', left: '15%' }} />
        <div className="animate-fallingStarsZigzag2 absolute w-1 h-1 bg-yellow-300/80 rounded-full shadow-[0_0_2px_2px] shadow-yellow-200/50" style={{ bottom: '20%', left: '35%' }} />
        <div className="animate-fallingStarsZigzag3 absolute w-0.5 h-0.5 bg-yellow-300/80 rounded-full shadow-[0_0_2px_2px] shadow-yellow-200/50" style={{ bottom: '8%', left: '45%' }} />
      </div>
    </>
  );
};

export function DashboardContent({
  dreams,
  totalDreams,
  topSymbols,
  topThemes,
  topEmotions,
}: DashboardContentProps) {
  const router = useRouter();

  const handleNewDream = () => {
    router.push('/dreams/new');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1c2e] via-[#2d2b55] to-[#3c1f52] overflow-hidden">
      <FallingStars />
      <div className="relative container mx-auto px-4 py-8">
        <div className="flex flex-col gap-16">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
                Your Dream Journal
              </h1>
              <p className="text-purple-200/80">
                Record and explore your dreams
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <DreamStats
              totalDreams={totalDreams}
              topSymbols={topSymbols}
              topThemes={topThemes}
              topEmotions={topEmotions}
              onNewDream={handleNewDream}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="py-4"
          >
            <div className="flex flex-col gap-10">
              <div className="flex items-center gap-6 px-2">
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-purple-500/20 border border-fuchsia-500/20">
                  <Sparkles className="w-7 h-7 text-fuchsia-300" />
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-2xl font-semibold bg-gradient-to-r from-fuchsia-300 to-indigo-300 text-transparent bg-clip-text">
                    Recent Dreams
                  </h2>
                  <p className="text-fuchsia-200/70 text-base">
                    Explore your latest dream entries and their interpretations
                  </p>
                </div>
              </div>
              <DreamList dreams={dreams} />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 