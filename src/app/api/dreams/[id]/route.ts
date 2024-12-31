import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';

// Get a specific dream
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
        dreamPatterns: true,
      },
    });

    if (!dream) {
      return NextResponse.json({ error: 'Dream not found' }, { status: 404 });
    }

    return NextResponse.json(dream);
  } catch (error) {
    console.error('Error fetching dream:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dream' },
      { status: 500 }
    );
  }
}

// Update a dream
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content, isPublic } = await req.json();

    // Verify dream ownership
    const existingDream = await db.dream.findFirst({
      where: {
        AND: [
          { id: params.id },
          { userId: session.user.id }
        ]
      },
    });

    if (!existingDream) {
      return NextResponse.json({ error: 'Dream not found' }, { status: 404 });
    }

    // Update the dream
    const updatedDream = await db.dream.update({
      where: { id: params.id },
      data: {
        title,
        content,
        isPublic,
        updatedAt: new Date(),
      },
      include: {
        symbols: true,
        themes: true,
        emotions: true,
        dreamPatterns: true,
      },
    });

    return NextResponse.json(updatedDream);
  } catch (error) {
    console.error('Error updating dream:', error);
    return NextResponse.json(
      { error: 'Failed to update dream' },
      { status: 500 }
    );
  }
}

// Delete a dream
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify dream ownership
    const existingDream = await db.dream.findFirst({
      where: {
        AND: [
          { id: params.id },
          { userId: session.user.id }
        ]
      },
    });

    if (!existingDream) {
      return NextResponse.json({ error: 'Dream not found' }, { status: 404 });
    }

    // Delete the dream and all related records
    await db.dream.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting dream:', error);
    return NextResponse.json(
      { error: 'Failed to delete dream' },
      { status: 500 }
    );
  }
} 