import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';

// Get communities list
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'all'; // 'all', 'joined', 'created'
    const search = searchParams.get('search') || '';

    let where: any = {};
    
    // Add search condition if search term exists
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // Add filter conditions
    if (filter === 'joined') {
      where.members = {
        some: {
          userId: session.user.id,
        },
      };
    } else if (filter === 'created') {
      where.creatorId = session.user.id;
    }

    const communities = await db.community.findMany({
      where,
      include: {
        _count: {
          select: {
            members: true,
          },
        },
        members: {
          where: {
            userId: session.user.id,
          },
          select: {
            role: true,
          },
        },
      },
      orderBy: [
        {
          members: {
            _count: 'desc',
          },
        },
        {
          createdAt: 'desc',
        },
      ],
      take: 10,
    });

    return NextResponse.json(communities);
  } catch (error) {
    console.error('Error fetching communities:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Create new community
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { name, description, isPrivate } = await req.json();

    if (!name || name.trim().length === 0) {
      return new NextResponse('Community name is required', { status: 400 });
    }

    // Check if community with same name exists
    const existingCommunity = await db.community.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });

    if (existingCommunity) {
      return new NextResponse('Community with this name already exists', { status: 400 });
    }

    // Create community and add creator as admin member
    const community = await db.community.create({
      data: {
        name,
        description,
        isPrivate: isPrivate || false,
        creatorId: session.user.id,
        members: {
          create: {
            userId: session.user.id,
            role: 'admin',
          },
        },
      },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
        members: {
          where: {
            userId: session.user.id,
          },
          select: {
            role: true,
          },
        },
      },
    });

    return NextResponse.json(community);
  } catch (error) {
    console.error('Error creating community:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Update community
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { communityId, name, description, isPrivate, avatar, coverImage } = await req.json();

    // Verify user is admin
    const membership = await db.communityMember.findFirst({
      where: {
        communityId,
        userId: session.user.id,
        role: 'admin',
      },
    });

    if (!membership) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const community = await db.community.update({
      where: { id: communityId },
      data: {
        name,
        description,
        isPrivate,
        avatar,
        coverImage,
      },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
        members: {
          where: {
            userId: session.user.id,
          },
          select: {
            role: true,
          },
        },
      },
    });

    return NextResponse.json(community);
  } catch (error) {
    console.error('Error updating community:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Delete community
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { communityId } = await req.json();

    // Verify user is creator
    const community = await db.community.findFirst({
      where: {
        id: communityId,
        creatorId: session.user.id,
      },
    });

    if (!community) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await db.community.delete({
      where: { id: communityId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting community:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 