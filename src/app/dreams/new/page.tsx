import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { NewDreamForm } from '@/components/dreams/NewDreamForm';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import React from 'react';

export default async function NewDreamPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1c2e] via-[#2d2b55] to-[#3c1f52] pb-20">
      <DashboardHeader />
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl -z-10" />
      <main className="container max-w-2xl mx-auto px-4 py-8">
        <div className="relative backdrop-blur-lg bg-white/5 rounded-2xl shadow-[0_0_15px_rgba(168,85,247,0.15)] border border-purple-500/20 overflow-hidden hover:border-purple-500/40 transition-all duration-300 p-6">
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-semibold text-white">Write a New Dream</h1>
              <p className="text-purple-200/60 mt-2">
                Record your dream while it's still fresh in your memory.
              </p>
            </div>
            <NewDreamForm />
          </div>
        </div>
      </main>
    </div>
  );
} 