import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import * as z from "zod";
import { analyzeText } from "@/lib/openai";

const dreamSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1, "Dream content is required"),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, content } = dreamSchema.parse(body);

    // Analyze the dream content using OpenAI
    const analysis = await analyzeText(content);

    // Create the dream and associated entities
    const dream = await prisma.dream.create({
      data: {
        title,
        content,
        user: {
          connect: {
            email: session.user.email,
          },
        },
        symbols: {
          connectOrCreate: analysis.symbols.map((symbol) => ({
            where: { name: symbol.name },
            create: {
              name: symbol.name,
              description: symbol.description,
            },
          })),
        },
        emotions: {
          connectOrCreate: analysis.emotions.map((emotion) => ({
            where: { name: emotion.name },
            create: {
              name: emotion.name,
              intensity: emotion.intensity,
              description: emotion.description,
            },
          })),
        },
        themes: {
          connectOrCreate: analysis.themes.map((theme) => ({
            where: { name: theme.name },
            create: {
              name: theme.name,
              description: theme.description,
            },
          })),
        },
      },
      include: {
        symbols: true,
        emotions: true,
        themes: true,
      },
    });

    return NextResponse.json(dream, { status: 201 });
  } catch (error) {
    console.error("Failed to create dream:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dreams = await prisma.dream.findMany({
      where: {
        user: {
          email: session.user.email,
        },
      },
      include: {
        symbols: true,
        emotions: true,
        themes: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(dreams);
  } catch (error) {
    console.error("Failed to fetch dreams:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 