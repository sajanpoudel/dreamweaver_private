import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/auth';
import { prisma } from '../../../lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const json = await request.json();
    const { title, content, isPublic } = json;

    const dream = await prisma.dream.create({
      data: {
        title,
        content,
        isPublic,
        userId: session.user.id,
      },
    });

    return NextResponse.json(dream);
  } catch (error) {
    console.error('Error creating dream:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [dreams, total] = await Promise.all([
      prisma.dream.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        include: {
          symbols: true,
          themes: true,
          emotions: true,
        },
        skip,
        take: limit,
      }),
      prisma.dream.count({
        where: { userId: session.user.id },
      }),
    ]);

    return NextResponse.json({
      dreams,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching dreams:", error);
    return NextResponse.json(
      { error: "Failed to fetch dreams" },
      { status: 500 }
    );
  }
} 