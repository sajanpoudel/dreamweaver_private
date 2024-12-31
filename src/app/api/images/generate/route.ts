import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { prompt } = await request.json();
    if (!prompt) {
      return new NextResponse('Prompt is required', { status: 400 });
    }

    const image = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
    });

    return NextResponse.json({ url: image.data[0].url });
  } catch (error) {
    console.error('Error generating image:', error);
    return new NextResponse('Failed to generate image', { status: 500 });
  }
} 