'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';

interface SuggestedFriend {
  id: string;
  name: string | null;
  image: string | null;
  mutualFriends: number;
  dreamInterests: string[];
}

export default function FriendSuggestions() {
  const [suggestions, setSuggestions] = useState<SuggestedFriend[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await fetch('/api/friends/suggestions');
      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      toast.error('Failed to load friend suggestions');
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

      if (!response.ok) {
        throw new Error('Failed to send friend request');
      }

      toast.success('Friend request sent');
      setSuggestions(prev => prev.filter(s => s.id !== userId));
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Failed to send friend request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2 text-purple-200/60 hover:text-purple-100"
          asChild
        >
          <Link href="/feed">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Feed
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-purple-100">Find Friends</h1>
        <p className="text-purple-200/60 mt-1">
          Connect with dreamers who share your interests
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="grid gap-4"
      >
        {suggestions.map((friend) => (
          <Card
            key={friend.id}
            className="backdrop-blur-lg bg-white/5 border-purple-500/20"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12 border border-purple-500/20">
                    <AvatarImage src={getImageUrl(friend.image)} />
                    <AvatarFallback>{friend.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-lg font-medium text-purple-100">
                      {friend.name}
                    </div>
                    <div className="text-sm text-purple-200/60 mt-0.5">
                      {friend.mutualFriends} mutual friends
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {friend.dreamInterests.map((interest, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-200"
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
                  className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-100"
                >
                  Add Friend
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {suggestions.length === 0 && (
          <Card className="backdrop-blur-lg bg-white/5 border-purple-500/20">
            <div className="p-8 text-center">
              <p className="text-purple-200/60 mb-4">
                No more suggestions available at the moment
              </p>
              <Button
                variant="ghost"
                className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-100"
                asChild
              >
                <Link href="/feed">Return to Feed</Link>
              </Button>
            </div>
          </Card>
        )}
      </motion.div>
    </div>
  );
} 