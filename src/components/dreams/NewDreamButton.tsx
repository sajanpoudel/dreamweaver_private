'use client';

import Link from 'next/link';
import { Button } from '../ui/button';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import React from 'react';

export function NewDreamButton() {
  return (
    <Link href="/dreams/new">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative group"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
        <Button
          className="relative w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 h-12 text-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
        >
          <Plus className="w-5 h-5 mr-2" />
          Record New Dream
        </Button>
      </motion.div>
    </Link>
  );
} 