'use client';

import { motion } from 'framer-motion';

export function DreamHeader() {
  return (
    <div className="mb-12 text-center relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-500 rounded-full filter blur-[100px] opacity-20"></div>
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-bold text-white mb-4 relative"
      >
        Your Dream Journal
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-lg text-purple-200 max-w-2xl mx-auto"
      >
        Explore your subconscious mind through the art of dream journaling
      </motion.p>
    </div>
  );
} 