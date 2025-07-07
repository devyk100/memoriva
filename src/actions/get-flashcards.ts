"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export interface FlashcardData {
  deck: {
    id: string;
    name: string;
    flashcards: {
      id: string;
      front: string;
      back: string;
      deckId: string;
    }[];
  };
  totalCards: number;
}

export async function getFlashcardsByDeckId(deckId: string): Promise<FlashcardData | null> {
  const session = await getServerSession(authOptions);
  
  // For development: use hardcoded email if no session
  const userEmail = session?.user?.email || 'devyk100@gmail.com';
  
  if (!userEmail) {
    return null;
  }

  try {
    // Get user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return null;
    }

    // Check if user has access to this deck
    const userDeckMapping = await prisma.userDeckMapping.findFirst({
      where: {
        userId: user.id,
        deckId: deckId,
      },
    });

    if (!userDeckMapping) {
      return null;
    }

    // Get deck with flashcards
    const deck = await prisma.flashcardDeck.findUnique({
      where: { id: deckId },
      include: {
        flashcards: {
          orderBy: { id: 'asc' },
        },
      },
    });

    if (!deck) {
      return null;
    }

    return {
      deck: {
        id: deck.id,
        name: deck.name,
        flashcards: deck.flashcards.map(card => ({
          id: card.id,
          front: card.front,
          back: card.back,
          deckId: card.deckId,
        })),
      },
      totalCards: deck.flashcards.length,
    };
  } catch (error) {
    console.error("Error fetching flashcards:", error);
    return null;
  }
}
