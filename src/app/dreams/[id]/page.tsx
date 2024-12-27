import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { DreamView } from '@/components/dreams/DreamView';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function DreamPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const dream = await prisma.dream.findFirst({
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

  return <DreamView dream={dream} />;
} 