import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';

// Only import Vercel Blob in production
const vercelBlob = process.env.VERCEL === '1' ? require('@vercel/blob') : null;

export async function POST(request: Request) {
  try {
    // Check authentication
    const token = await getToken({ req: request as any });
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Generate a unique filename with user ID prefix for better organization
    const fileExtension = path.extname(file.name);
    const fileName = `${token.sub}-${nanoid()}${fileExtension}`;

    // Create upload directories if they don't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/uploads directory
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // Return the public URL
    return NextResponse.json({ url: `/uploads/${fileName}` });

  } catch (error: any) {
    console.error('Error processing upload:', error);
    return NextResponse.json(
      { error: error.message || 'Error processing upload' },
      { status: 500 }
    );
  }
} 