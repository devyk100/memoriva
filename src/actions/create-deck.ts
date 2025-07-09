"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export interface CreateDeckResult {
  success: boolean;
  deckId?: string;
  error?: string;
}

export async function createDeck(name: string): Promise<CreateDeckResult> {
  const session = await getServerSession(authOptions);
  
  // For development: use hardcoded email if no session
  const userEmail = session?.user?.email || 'devyk100@gmail.com';
  
  if (!userEmail) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Get user
    let user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: userEmail,
          name: session?.user?.name || "Dev User",
          authType: "GOOGLE", // Default to Google, could be GitHub too
        },
      });
    }

    // Create the flashcard deck
    const deck = await prisma.flashcardDeck.create({
      data: {
        name: name.trim(),
        userId: user.id,
      },
    });

    // Create user-deck mapping (user is the editor/owner)
    await prisma.userDeckMapping.create({
      data: {
        userId: user.id,
        deckId: deck.id,
        type: "EDITOR",
      },
    });

    // Create deck metadata with default settings
    await prisma.deckMetadata.create({
      data: {
        userId: user.id,
        deckId: deck.id,
        newCardCount: 20,
        reviewCardCount: 100,
      },
    });

    return { success: true, deckId: deck.id };
  } catch (error) {
    console.error("Error creating deck:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
}
