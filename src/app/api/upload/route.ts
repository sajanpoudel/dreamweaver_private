import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';
import { put } from '@vercel/blob';

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

    // Generate a unique filename
    const fileExtension = path.extname(file.name);
    const fileName = nanoid() + fileExtension;

    // Check if we're in production (Vercel) or development
    if (process.env.VERCEL === '1') {
      // Upload to Vercel Blob in production
      const blob = await put(fileName, file, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN
      });
      return NextResponse.json({ url: blob.url });
    } else {
      // Local development: save to filesystem
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      
      // Ensure uploads directory exists
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (error) {
        // Ignore if directory already exists
      }

      // Convert File to Buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Save to public/uploads directory
      await writeFile(path.join(uploadDir, fileName), buffer);

      // Return the public URL
      const url = `/uploads/${fileName}`;
      return NextResponse.json({ url });
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    );
  }
} 