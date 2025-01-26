'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface SuggestedFriend {
  id: string;
  name: string | null;
  image: string | null;
  mutualFriends: number;
  dreamInterests: string[];
}

export function SuggestedFriends() {
  const [suggestions, setSuggestions] = useState<SuggestedFriend[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await fetch('/api/friends/suggestions');
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      }
    } catch (error) {
      console.error('Error fetching friend suggestions:', error);
    }
  };

  const handleSendRequest = async (userId: string) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ addresseeId: userId }),
      });

      if (response.ok) {
        toast.success('Friend request sent');
        // Remove the user from suggestions
        setSuggestions(prev => prev.filter(s => s.id !== userId));
      } else {
        toast.error('Failed to send friend request');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Failed to send friend request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card className="backdrop-blur-lg bg-white/5 border-purple-500/20">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-5 h-5 text-purple-100" />
            <h2 className="text-lg font-semibold text-purple-100">Suggested Friends</h2>
          </div>

          <div className="space-y-4">
            {suggestions.map((friend) => (
              <div
                key={friend.id}
                className="flex items-start justify-between group"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 border border-purple-500/20">
                    <AvatarImage src={getImageUrl(friend.image)} />
                    <AvatarFallback>{friend.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium text-purple-100 group-hover:text-purple-200 transition-colors">
                      {friend.name}
                    </div>
                    <div className="text-xs text-purple-200/60 mt-0.5">
                      {friend.mutualFriends} mutual friends
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {friend.dreamInterests.map((interest, index) => (
                        <span
                          key={index}
                          className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-200"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isLoading}
                  onClick={() => handleSendRequest(friend.id)}
                  className="text-xs bg-purple-500/10 hover:bg-purple-500/20 text-purple-100"
                >
                  Add Friend
                </Button>
              </div>
            ))}

            {suggestions.length === 0 && (
              <div className="text-center py-4">
                <p className="text-sm text-purple-200/60">No suggestions available</p>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            className="w-full mt-4 bg-purple-500/10 hover:bg-purple-500/20 text-purple-100"
          >
            View More Suggestions
          </Button>
        </div>
      </Card>
    </motion.div>
  );
} 