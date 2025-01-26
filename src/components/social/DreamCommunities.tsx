'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Plus, Users, Search, Hash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/use-debounce';
import Link from 'next/link';

interface Community {
  id: string;
  name: string;
  description: string | null;
  _count: {
    members: number;
  };
  members: {
    role: string;
  }[];
}

export function DreamCommunities() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    fetchCommunities();
  }, [debouncedSearch]);

  const fetchCommunities = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/communities?filter=all&search=${encodeURIComponent(debouncedSearch)}`);
      if (response.ok) {
        const data = await response.json();
        setCommunities(data);
      }
    } catch (error) {
      console.error('Error fetching communities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCommunity = () => {
    // Navigate to create community page
    window.location.href = '/communities/new';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card className="backdrop-blur-lg bg-white/5 border-purple-500/20">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-100" />
              <h2 className="text-base font-semibold text-purple-100">Communities</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-purple-500/10 hover:bg-purple-500/20 text-purple-100"
              onClick={handleCreateCommunity}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-purple-200/60" />
            <Input
              placeholder="Search communities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 bg-purple-500/10 border-purple-500/20 text-purple-100 placeholder:text-purple-200/60"
            />
          </div>

          <div className="space-y-2">
            {isLoading ? (
              <div className="text-center py-4">
                <p className="text-sm text-purple-200/60">Loading communities...</p>
              </div>
            ) : communities.length > 0 ? (
              communities.map((community) => (
                <Link
                  key={community.id}
                  href={`/communities/${community.id}`}
                  className="block group"
                >
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-purple-500/10 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Hash className="w-4 h-4 text-purple-200/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-purple-100 truncate group-hover:text-purple-200 transition-colors">
                        {community.name}
                      </div>
                      <div className="text-xs text-purple-200/60">
                        {community._count.members.toLocaleString()} members
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-purple-200/60">
                  {search ? 'No communities found' : 'No communities available'}
                </p>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            className="w-full mt-4 bg-purple-500/10 hover:bg-purple-500/20 text-purple-100"
            asChild
          >
            <Link href="/communities">
              Browse All Communities
            </Link>
          </Button>
        </div>
      </Card>
    </motion.div>
  );
} 