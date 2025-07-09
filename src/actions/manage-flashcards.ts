"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export interface CreateCardResult {
  success: boolean;
  cardId?: string;
  error?: string;
}

export interface UpdateCardResult {
  success: boolean;
  error?: string;
}

export async function createFlashcard(deckId: string, front: string = "", back: string = ""): Promise<CreateCardResult> {
  const session = await getServerSession(authOptions);
  
  // For development: use hardcoded email if no session
  const userEmail = session?.user?.email || 'devyk100@gmail.com';
  
  if (!userEmail) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Verify user has access to this deck
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const userDeckMapping = await prisma.userDeckMapping.findFirst({
      where: {
        userId: user.id,
        deckId: deckId,
        type: "EDITOR",
      },
    });

    if (!userDeckMapping) {
      return { success: false, error: "Access denied to this deck" };
    }

    // Create the flashcard
    const flashcard = await prisma.flashcard.create({
      data: {
        front: front.trim(),
        back: back.trim(),
        deckId: deckId,
      },
    });

    return { success: true, cardId: flashcard.id };
  } catch (error) {
    console.error("Error creating flashcard:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
}

export async function updateFlashcard(cardId: string, front: string, back: string): Promise<UpdateCardResult> {
  const session = await getServerSession(authOptions);
  
  // For development: use hardcoded email if no session
  const userEmail = session?.user?.email || 'devyk100@gmail.com';
  
  if (!userEmail) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Get user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Get the flashcard and verify access
    const flashcard = await prisma.flashcard.findUnique({
      where: { id: cardId },
      include: {
        deck: {
          include: {
            userDeckMappings: {
              where: {
                userId: user.id,
                type: "EDITOR",
              },
            },
          },
        },
      },
    });

    if (!flashcard || flashcard.deck.userDeckMappings.length === 0) {
      return { success: false, error: "Access denied to this flashcard" };
    }

    // Update the flashcard
    await prisma.flashcard.update({
      where: { id: cardId },
      data: {
        front: front.trim(),
        back: back.trim(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating flashcard:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
}

export async function deleteFlashcard(cardId: string): Promise<UpdateCardResult> {
  const session = await getServerSession(authOptions);
  
  // For development: use hardcoded email if no session
  const userEmail = session?.user?.email || 'devyk100@gmail.com';
  
  if (!userEmail) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Get user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Get the flashcard and verify access
    const flashcard = await prisma.flashcard.findUnique({
      where: { id: cardId },
      include: {
        deck: {
          include: {
            userDeckMappings: {
              where: {
                userId: user.id,
                type: "EDITOR",
              },
            },
          },
        },
      },
    });

    if (!flashcard || flashcard.deck.userDeckMappings.length === 0) {
      return { success: false, error: "Access denied to this flashcard" };
    }

    // Delete SRS metadata first (if any)
    await prisma.sRSCardMetadata.deleteMany({
      where: { flashcardId: cardId },
    });

    // Delete the flashcard
    await prisma.flashcard.delete({
      where: { id: cardId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting flashcard:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
}
