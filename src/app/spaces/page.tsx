import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { SpacesList } from '@/components/spaces/SpacesList';
import { SpacesHeader } from '@/components/spaces/SpacesHeader';

export default function SpacesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1c2e] via-[#2d2b55] to-[#3c1f52]">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <SpacesHeader />
        <SpacesList />
      </main>
    </div>
  );
} 