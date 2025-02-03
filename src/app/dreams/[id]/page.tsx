import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/prisma';
import { DreamView } from '@/components/dreams/DreamView';
import React from 'react';

export default async function DreamPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  try {
    const dream = await db.dream.findFirst({
      where: {
        AND: [
          { id: params.id },
          { userId: session.user.id }
        ]
      },
      include: {
        symbols: true,
        themes: true,
        emotions: true,
      },
    });

    if (!dream) {
      redirect('/dashboard');
    }

    const dreamData = {
      ...dream,
      analysis: dream.analysis ? String(dream.analysis) : null,
      rawAnalysis: dream.rawAnalysis ? String(dream.rawAnalysis) : null,
    };

    return <DreamView dream={dreamData} />;
  } catch (error) {
    console.error('Error fetching dream:', error);
    throw error;
  }
} 