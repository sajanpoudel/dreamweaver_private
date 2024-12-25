import { getServerSession } from 'next-auth';
import { authOptions } from '../../api/auth/[...nextauth]/auth';
import { redirect } from 'next/navigation';
import { NewDreamForm } from '@/components/dreams/NewDreamForm';
import React from 'react';

export default async function NewDreamPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1c2e] via-[#2d2b55] to-[#3c1f52] overflow-hidden">
      <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-50"></div>
      <div className="relative container max-w-2xl mx-auto py-12 px-4">
        <NewDreamForm />
      </div>
    </div>
  );
} 