import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  try {
    const userId = session.user.id;

    // Fetch user's dreams
    const dreams = await db.dream.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        symbols: true,
        themes: true,
        emotions: true,
      },
    });

    // Fetch user's stories
    const stories = await db.dreamStory.findMany({
      where: { 
        userId,
        isPublic: true 
      },
      orderBy: { createdAt: 'desc' },
      include: {
        dream: true,
        likes: true,
        comments: true,
      },
    });

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-violet-900">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold">
                {session.user.name?.[0] || session.user.email?.[0]}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{session.user.name || session.user.email}</h1>
                <p className="text-gray-300">DreamWeaver Member</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Dreams Section */}
            <section className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">My Dreams ({dreams.length})</h2>
              <div className="space-y-4">
                {dreams.map((dream) => (
                  <div key={dream.id} className="bg-white/5 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-white">{dream.title}</h3>
                    <p className="text-gray-300 text-sm mt-2">
                      {dream.content.length > 100 
                        ? `${dream.content.substring(0, 100)}...` 
                        : dream.content}
                    </p>
                    <div className="mt-2 flex gap-2">
                      {dream.symbols.map((symbol) => (
                        <span key={symbol.id} className="text-xs bg-purple-500/20 text-purple-200 px-2 py-1 rounded">
                          {symbol.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Stories Section */}
            <section className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">My Stories ({stories.length})</h2>
              <div className="space-y-4">
                {stories.map((story) => (
                  <div key={story.id} className="bg-white/5 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-white">{story.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-300">
                      <span>💖 {story.likes.length}</span>
                      <span>💭 {story.comments.length}</span>
                    </div>
                    <p className="text-gray-300 text-sm mt-2">
                      Based on dream: {story.dream.title}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error('Profile error:', error);
    throw error;
  }
} 