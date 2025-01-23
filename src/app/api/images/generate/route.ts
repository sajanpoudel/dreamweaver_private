import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { writeFile } from 'fs/promises';
import path from 'path';

const openai = new OpenAI();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { prompt } = await req.json();
    if (!prompt) {
      return new NextResponse('Missing prompt', { status: 400 });
    }

    // Generate image with DALL-E
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      response_format: 'url'
    });

    const imageUrl = response.data[0].url;
    if (!imageUrl) {
      throw new Error('No image URL returned from OpenAI');
    }

    // Download the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to download image from OpenAI');
    }
    const imageBuffer = await imageResponse.arrayBuffer();

    // Create a unique filename
    const filename = `${nanoid()}.png`;
    const publicDir = path.join(process.cwd(), 'public', 'dream-images');
    const filePath = path.join(publicDir, filename);

    // Ensure the directory exists
    await writeFile(filePath, Buffer.from(imageBuffer));

    // Return the local URL
    return NextResponse.json({ url: `/dream-images/${filename}` });

  } catch (error: any) {
    console.error('Error generating image:', error);
    return new NextResponse(error.message || 'Error generating image', { 
      status: error.status || 500 
    });
  }
} 