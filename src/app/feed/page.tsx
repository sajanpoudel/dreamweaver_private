import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';
import { DreamFeed } from '@/components/dreams/DreamFeed';

export default async function FeedPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
  }

  const stories = await db.dreamStory.findMany({
    where: {
      publishedAt: {
        not: null
      },
    },
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
      themes: true,
      symbols: true,
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
    orderBy: {
      publishedAt: 'desc',
    },
  });

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-purple-100">Dream Stories</h1>
        <p className="text-purple-200/80">Explore dream narratives from the community</p>
      </div>
      <DreamFeed stories={stories} />
    </div>
  );
} 