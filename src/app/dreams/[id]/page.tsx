import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { DreamAnalysis } from '@/components/dreams/DreamAnalysis';
import { DreamMetadata } from '@/components/dreams/DreamMetadata';
import { ExtractMetadata } from '@/components/dreams/ExtractMetadata';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

export default async function DreamPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/api/auth/signin');
  }

  const dream = await prisma.dream.findUnique({
    where: {
      id: params.id,
      userId: session.user.id,
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

  const hasMetadata = dream.symbols.length > 0 || dream.themes.length > 0 || dream.emotions.length > 0;

  return (
    <div className="container mx-auto py-8 max-w-4xl space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">{dream.title}</h1>
        <p className="text-sm text-gray-500">
          Recorded on {formatDate(dream.createdAt)}
        </p>
      </div>

      <Card className="p-6">
        <p className="whitespace-pre-wrap">{dream.content}</p>
      </Card>

      {!hasMetadata && (
        <div className="flex justify-end">
          <ExtractMetadata dreamId={dream.id} />
        </div>
      )}

      {hasMetadata && (
        <DreamMetadata
          symbols={dream.symbols}
          themes={dream.themes}
          emotions={dream.emotions}
        />
      )}

      <DreamAnalysis dreamId={dream.id} initialAnalysis={dream.analysis} />
    </div>
  );
} 