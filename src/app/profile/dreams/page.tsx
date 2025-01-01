'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

interface Dream {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  symbols: Array<{ id: string; name: string }>;
  themes: Array<{ id: string; name: string }>;
  emotions: Array<{ id: string; name: string }>;
}

export default function DreamsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) {
      router.push('/auth/signin');
      return;
    }

    const fetchDreams = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/dreams');
        if (response.ok) {
          const data = await response.json();
          setDreams(data);
        }
      } catch (error) {
        console.error('Error fetching dreams:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDreams();
  }, [session, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-violet-900">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-white">Loading dreams...</p>
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
          <h1 className="text-3xl font-bold text-white mb-2">My Dream Collection</h1>
          <p className="text-gray-300">Your personal journey through {dreams.length} dreams</p>
        </div>

        {dreams.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-white mb-4">You haven't recorded any dreams yet.</p>
            <Link 
              href="/dashboard"
              className="text-purple-200 hover:text-purple-100 underline"
            >
              Go to Dashboard to record your first dream
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dreams.map((dream) => (
              <Link key={dream.id} href={`/dreams/${dream.id}`}>
                <Card className="bg-white/10 hover:bg-white/20 transition-colors border-purple-500/20 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-semibold text-white">{dream.title}</h2>
                      <span className="text-sm text-gray-400">{formatDate(new Date(dream.createdAt))}</span>
                    </div>
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                      {dream.content}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {dream.symbols.map((symbol) => (
                        <Badge
                          key={symbol.id}
                          variant="secondary"
                          className="bg-purple-500/20 text-purple-200 border-purple-500/20"
                        >
                          {symbol.name}
                        </Badge>
                      ))}
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