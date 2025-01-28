'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatListProps {
  onChatSelect: (userId: string) => void;
}

export function ChatList({ onChatSelect }: ChatListProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <Button
        variant="ghost"
        size="icon"
        className="h-12 w-12 bg-purple-500/10 hover:bg-purple-500/20 text-purple-100 relative"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </motion.div>
  );
}
