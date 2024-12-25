'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedContainerProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  animation?: 'fade' | 'slide' | 'scale';
}

export function AnimatedContainer({
  children,
  delay = 0,
  className = '',
  animation = 'fade',
}: AnimatedContainerProps) {
  const animations = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
    },
    slide: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
    },
    scale: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
    },
  };

  return (
    <motion.div
      initial={animations[animation].initial}
      animate={animations[animation].animate}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
} 