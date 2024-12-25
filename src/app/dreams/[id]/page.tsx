import { getServerSession } from 'next-auth';
import { authOptions } from '../../api/auth/[...nextauth]/auth';
import { redirect } from 'next/navigation';
import { prisma } from '../../../lib/prisma';
import { DreamView } from '../../../components/dreams/DreamView';
import React from 'react';

interface DreamPageProps {
  params: {
    id: string;
  };
}

export default async function DreamPage({ params }: DreamPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const dream = await prisma.dream.findFirst({
    where: {
      AND: [
        { id: params.id },
        { userId: session.user.id }
      ]
    },
    include: {
      symbols: {
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          updatedAt: true
        }
      },
      themes: {
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          updatedAt: true
        }
      },
      emotions: {
        select: {
          id: true,
          name: true,
          intensity: true,
          description: true,
          createdAt: true,
          updatedAt: true
        }
      }
    }
  });

  if (!dream) {
    redirect('/dashboard');
  }

  return <DreamView dream={dream} />;
} 