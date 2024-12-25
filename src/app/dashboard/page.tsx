import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/auth';
import { redirect } from 'next/navigation';
import { prisma, withConnection } from '@/lib/db';
import { DashboardContent } from '../../components/dashboard/DashboardContent';
import React from 'react';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  try {
    const userId = session.user.id;

    // Get stats using the connection manager
    const stats = await withConnection(async (client) => {
      const result = await client.query(`
        SELECT 
          (SELECT COUNT(*) FROM "Dream" WHERE "userId" = $1) as "totalDreams",
          (SELECT json_agg(t) FROM (
            SELECT s."name", COUNT(*) as count 
            FROM "Symbol" s 
            JOIN "_DreamToSymbol" ds ON s.id = ds."B" 
            JOIN "Dream" d ON d.id = ds."A" 
            WHERE d."userId" = $1
            GROUP BY s."name" 
            ORDER BY count DESC 
            LIMIT 5
          ) t) as "topSymbols",
          (SELECT json_agg(t) FROM (
            SELECT t."name", COUNT(*) as count 
            FROM "Theme" t 
            JOIN "_DreamToTheme" dt ON t.id = dt."B" 
            JOIN "Dream" d ON d.id = dt."A" 
            WHERE d."userId" = $1
            GROUP BY t."name" 
            ORDER BY count DESC 
            LIMIT 5
          ) t) as "topThemes",
          (SELECT json_agg(t) FROM (
            SELECT e."name", COUNT(*) as count 
            FROM "Emotion" e 
            JOIN "_DreamToEmotion" de ON e.id = de."B" 
            JOIN "Dream" d ON d.id = de."A" 
            WHERE d."userId" = $1
            GROUP BY e."name" 
            ORDER BY count DESC 
            LIMIT 5
          ) t) as "topEmotions"
      `, [userId]);
      return result.rows[0];
    });

    // Use Prisma for dreams query
    const dreams = await prisma.dream.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        symbols: {
          select: {
            id: true,
            name: true,
          }
        },
        themes: {
          select: {
            id: true,
            name: true,
          }
        },
        emotions: {
          select: {
            id: true,
            name: true,
            intensity: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return (
      <DashboardContent
        dreams={dreams}
        totalDreams={Number(stats.totalDreams)}
        topSymbols={stats.topSymbols || []}
        topThemes={stats.topThemes || []}
        topEmotions={stats.topEmotions || []}
      />
    );
  } catch (error) {
    console.error('Dashboard error:', error);
    throw error;
  }
} 