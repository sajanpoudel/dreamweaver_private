import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { FallingStars } from '@/components/FallingStars';
import { UserProfile } from '@/components/social/UserProfile';
import { FriendsList } from '@/components/social/FriendsList';
import { TrendingDreams } from '@/components/social/TrendingDreams';
import { DreamSpaces } from '@/components/social/DreamSpaces';
import { SuggestedFriends } from '@/components/social/SuggestedFriends';
import '@/styles/feed-layout.css';
import { Chat } from '@/components/chat/Chat';

export default function FeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1c2e] via-[#2d2b55] to-[#3c1f52]">
      <FallingStars />
      <DashboardHeader />
      
      <div className="flex h-[calc(100vh-64px)] pt-4">
        {/* Left Sidebar - Fixed */}
        <div className="w-[320px] fixed left-0 top-16 bottom-0 overflow-y-auto px-4 pb-8 hide-scrollbar">
          <div className="space-y-4">
            <UserProfile />
            <DreamSpaces />
          </div>
        </div>

        {/* Main Content - Scrollable */}
        <main className="flex-1 overflow-y-auto px-4 mx-[320px] hide-scrollbar">
          {children}
        </main>

        {/* Right Sidebar - Fixed */}
        <div className="w-[320px] fixed right-0 top-16 bottom-0 overflow-y-auto px-4 pb-8 hide-scrollbar">
          <div className="space-y-4">
            <TrendingDreams />
            <FriendsList />
            <SuggestedFriends />
          </div>
        </div>
      </div>
      <Chat />
    </div>
  );
} 