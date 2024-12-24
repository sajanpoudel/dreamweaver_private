import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { DreamStats } from "@/components/dreams/DreamStats";
import { DreamList } from "@/components/dreams/DreamList";
import { NewDreamButton } from "@/components/dreams/NewDreamButton";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  const [
    dreams,
    totalDreams,
    symbolCounts,
    themeCounts,
    emotionCounts,
  ] = await Promise.all([
    // Get recent dreams
    prisma.dream.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        symbols: true,
        themes: true,
        emotions: true,
      },
      take: 10,
    }),

    // Get total dreams
    prisma.dream.count({
      where: { userId: session.user.id },
    }),

    // Get symbol counts
    prisma.symbol.findMany({
      select: {
        name: true,
        _count: {
          select: { dreams: true },
        },
      },
      where: {
        dreams: {
          some: { userId: session.user.id },
        },
      },
      orderBy: {
        dreams: { _count: 'desc' },
      },
      take: 5,
    }),

    // Get theme counts
    prisma.theme.findMany({
      select: {
        name: true,
        _count: {
          select: { dreams: true },
        },
      },
      where: {
        dreams: {
          some: { userId: session.user.id },
        },
      },
      orderBy: {
        dreams: { _count: 'desc' },
      },
      take: 5,
    }),

    // Get emotion counts
    prisma.emotion.findMany({
      select: {
        name: true,
        _count: {
          select: { dreams: true },
        },
      },
      where: {
        dreams: {
          some: { userId: session.user.id },
        },
      },
      orderBy: {
        dreams: { _count: 'desc' },
      },
      take: 5,
    }),
  ]);

  return (
    <div className="container mx-auto py-8 max-w-7xl space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dream Journal</h1>
        <NewDreamButton />
      </div>

      <DreamStats
        totalDreams={totalDreams}
        topSymbols={symbolCounts.map((s) => ({
          name: s.name,
          count: s._count.dreams,
        }))}
        topThemes={themeCounts.map((t) => ({
          name: t.name,
          count: t._count.dreams,
        }))}
        topEmotions={emotionCounts.map((e) => ({
          name: e.name,
          count: e._count.dreams,
        }))}
      />

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Recent Dreams</h2>
        <DreamList dreams={dreams} />
      </div>
    </div>
  );
} 