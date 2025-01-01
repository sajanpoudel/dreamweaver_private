'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Heart, MessageCircle } from 'lucide-react';

interface Story {
  id: string;
  title: string;
  content: string;
  publishedAt: Date | null;
  dream: {
    title: string;
  };
  _count: {
    likes: number;
    comments: number;
  };
}

export default function StoriesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) {
      router.push('/auth/signin');
      return;
    }

    const fetchStories = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/stories/user');
        if (response.ok) {
          const data = await response.json();
          setStories(data);
        }
      } catch (error) {
        console.error('Error fetching stories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStories();
  }, [session, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-violet-900">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-white">Loading stories...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-violet-900">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Stories</h1>
          <p className="text-gray-300">Your published dream stories ({stories.length})</p>
        </div>

        {stories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-white mb-4">You haven't published any stories yet.</p>
            <Link 
              href="/dashboard"
              className="text-purple-200 hover:text-purple-100 underline"
            >
              Go to Dashboard to create your first story
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <Link key={story.id} href={`/stories/${story.id}`}>
                <Card className="bg-white/10 hover:bg-white/20 transition-colors border-purple-500/20 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-semibold text-white">{story.title}</h2>
                      <span className="text-sm text-gray-400">
                        {story.publishedAt ? formatDate(new Date(story.publishedAt)) : 'Draft'}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-4">
                      Based on dream: {story.dream.title}
                    </p>
                    <div className="flex items-center gap-4 text-gray-400">
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span className="text-sm">{story._count.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm">{story._count.comments}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 