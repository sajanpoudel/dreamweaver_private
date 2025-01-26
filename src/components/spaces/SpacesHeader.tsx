'use client';

import { motion } from 'framer-motion';

export function SpacesHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text mb-2">
        Dream Spaces
      </h1>
      <p className="text-gray-300">
        Explore dream spaces grouped by common symbols and themes
      </p>
    </motion.div>
  );
} 