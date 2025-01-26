'use client';

import { useSession } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getImageUrl } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Edit, Settings, Share2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface UserStats {
  dreamCount: number;
  friendCount: number;
  storyCount: number;
}

export function UserProfile() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<UserStats>({
    dreamCount: 0,
    friendCount: 0,
    storyCount: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dreamsRes, friendsRes, storiesRes] = await Promise.all([
          fetch('/api/dreams/count'),
          fetch('/api/friends/count'),
          fetch('/api/stories/count'),
        ]);

        if (dreamsRes.ok && friendsRes.ok && storiesRes.ok) {
          const [dreamCount, friendCount, storyCount] = await Promise.all([
            dreamsRes.json(),
            friendsRes.json(),
            storiesRes.json(),
          ]);

          setStats({
            dreamCount: dreamCount.count,
            friendCount: friendCount.count,
            storyCount: storyCount.count,
          });
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
      }
    };

    if (session?.user) {
      fetchStats();
    }
  }, [session?.user]);

  if (!session?.user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative overflow-hidden backdrop-blur-lg bg-white/5 border-purple-500/20">
        {/* Cover Image */}
        <div className="h-24 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20" />
        
        {/* Profile Content */}
        <div className="p-6">
          {/* Avatar */}
          <div className="relative -mt-16 mb-4">
            <Avatar className="w-20 h-20 border-4 border-[#1a1c2e]">
              <AvatarImage src={getImageUrl(session.user.image)} />
              <AvatarFallback>{session.user.name?.[0] || '?'}</AvatarFallback>
            </Avatar>
          </div>

          {/* User Info */}
          <div className="space-y-1 mb-4">
            <h2 className="text-lg font-semibold text-purple-100">{session.user.name}</h2>
            <p className="text-sm text-purple-200/60">@{session.user.name?.toLowerCase().replace(/\s+/g, '')}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 py-4 border-y border-purple-500/20">
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-100">{stats.dreamCount}</div>
              <div className="text-xs text-purple-200/60">Dreams</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-100">{stats.friendCount}</div>
              <div className="text-xs text-purple-200/60">Friends</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-100">{stats.storyCount}</div>
              <div className="text-xs text-purple-200/60">Stories</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-100"
              asChild
            >
              <Link href="/profile">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-100"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-100"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
} 