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
      isPublic: true,
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
      createdAt: 'desc',
    },
  });

  if (stories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 p-8 rounded-2xl backdrop-blur-sm border border-purple-500/20">
          <h2 className="text-2xl font-semibold text-purple-200 mb-3">No Dream Stories Yet</h2>
          <p className="text-purple-200/80">Be the first to share your dream story with the community!</p>
        </div>
      </div>
    );
  }

  return <DreamFeed stories={stories} currentUserId={session.user.id} />;
} 