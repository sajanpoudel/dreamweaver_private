import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    // Create initial symbol database
    const commonSymbols = [
      {
        name: "Water",
        description:
          "Often represents emotions, the unconscious mind, or spiritual aspects of life.",
      },
      {
        name: "Flying",
        description:
          "Can symbolize freedom, transcendence, or escape from earthly concerns.",
      },
      {
        name: "Falling",
        description:
          "May represent loss of control, anxiety, or fear of failure.",
      },
      {
        name: "House",
        description:
          "Often represents the self, with different rooms symbolizing different aspects of your personality.",
      },
      {
        name: "Teeth",
        description:
          "Can symbolize anxiety about appearance, communication, or power.",
      },
    ];

    for (const symbol of commonSymbols) {
      await prisma.symbol.upsert({
        where: { name: symbol.name },
        update: {},
        create: symbol,
      });
    }

    // Create initial emotion database
    const commonEmotions = [
      {
        name: "Joy",
        description: "Feelings of great pleasure and happiness",
        intensity: 0.8,
      },
      {
        name: "Fear",
        description: "Response to perceived danger or threat",
        intensity: 0.7,
      },
      {
        name: "Anxiety",
        description: "Feelings of worry, nervousness, or unease",
        intensity: 0.6,
      },
      {
        name: "Peace",
        description: "Feelings of tranquility and calm",
        intensity: 0.5,
      },
      {
        name: "Confusion",
        description: "Lack of understanding or clarity",
        intensity: 0.4,
      },
    ];

    for (const emotion of commonEmotions) {
      await prisma.emotion.upsert({
        where: { name: emotion.name },
        update: {},
        create: emotion,
      });
    }

    // Create initial theme database
    const commonThemes = [
      {
        name: "Transformation",
        description:
          "Dreams about change, metamorphosis, or personal growth",
      },
      {
        name: "Conflict",
        description:
          "Dreams involving struggle, opposition, or internal/external battles",
      },
      {
        name: "Journey",
        description:
          "Dreams about traveling, searching, or personal quests",
      },
      {
        name: "Relationships",
        description:
          "Dreams focusing on connections with others, love, or family",
      },
      {
        name: "Power",
        description:
          "Dreams about control, influence, or personal strength",
      },
    ];

    for (const theme of commonThemes) {
      await prisma.theme.upsert({
        where: { name: theme.name },
        update: {},
        create: theme,
      });
    }

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 