import { DashboardHeader } from '@/components/DashboardHeader';
import { FallingStars } from '@/components/FallingStars';

export default function FeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1c2e] via-[#2d2b55] to-[#3c1f52] overflow-hidden">
      <FallingStars />
      <DashboardHeader />
      <main className="container mx-auto px-4 pt-24 relative">
        {children}
      </main>
    </div>
  );
} 