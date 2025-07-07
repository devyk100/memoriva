"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { calculateSRSUpdate, SRSGrade } from "@/lib/srs";
import { SessionManager } from "@/lib/redis";

export interface UpdateCardSRSParams {
  cardId: string;
  grade: SRSGrade;
}

export interface UpdateCardSRSResult {
  success: boolean;
  nextReview?: Date;
  interval?: bigint;
  repetitions?: number;
  easeFactor?: number;
  error?: string;
}

export async function updateCardSRS(params: UpdateCardSRSParams): Promise<UpdateCardSRSResult> {
  const { cardId, grade } = params;
  
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

    // Get current SRS metadata for the card
    const currentSRS = await prisma.sRSCardMetadata.findUnique({
      where: {
        userId_flashcardId: {
          userId: user.id,
          flashcardId: cardId,
        },
      },
    });

    if (!currentSRS) {
      return { success: false, error: "SRS metadata not found for card" };
    }

    // Calculate new SRS values
    const srsUpdate = calculateSRSUpdate(
      {
        repetitions: currentSRS.repetitions,
        easeFactor: currentSRS.easeFactor,
        interval: currentSRS.interval,
        lastReviewed: currentSRS.lastReviewed,
        nextReview: currentSRS.nextReview,
      },
      grade
    );

    // Update SRS metadata in database
    const updatedSRS = await prisma.sRSCardMetadata.update({
      where: {
        userId_flashcardId: {
          userId: user.id,
          flashcardId: cardId,
        },
      },
      data: {
        repetitions: srsUpdate.repetitions,
        easeFactor: srsUpdate.easeFactor,
        interval: srsUpdate.interval,
        lastReviewed: srsUpdate.lastReviewed,
        nextReview: srsUpdate.nextReview,
      },
    });

    // Track daily limits and card type
    const card = await prisma.flashcard.findUnique({
      where: { id: cardId },
      select: { deckId: true },
    });

    if (card) {
      // Increment daily limits in Redis
      try {
        if (currentSRS.repetitions === -1) {
          // This was a new card
          await SessionManager.incrementDailyLimits(user.id, card.deckId, 'new');
        } else {
          // This was a review card
          await SessionManager.incrementDailyLimits(user.id, card.deckId, 'review');
        }
      } catch (error) {
        console.warn('Failed to update Redis daily limits:', error);
      }
    }

    return {
      success: true,
      nextReview: updatedSRS.nextReview || undefined,
      interval: updatedSRS.interval,
      repetitions: updatedSRS.repetitions,
      easeFactor: updatedSRS.easeFactor,
    };
  } catch (error) {
    console.error("Error updating card SRS:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
}

export async function updateDeckSettings(
  deckId: string,
  settings: { newCardCount: number; reviewCardCount: number }
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  
  // For development: use hardcoded email if no session
  const userEmail = session?.user?.email || 'devyk100@gmail.com';
  
  if (!userEmail) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Update deck metadata
    await prisma.deckMetadata.upsert({
      where: {
        userId_deckId: {
          userId: user.id,
          deckId,
        },
      },
      update: {
        newCardCount: settings.newCardCount,
        reviewCardCount: settings.reviewCardCount,
      },
      create: {
        userId: user.id,
        deckId,
        newCardCount: settings.newCardCount,
        reviewCardCount: settings.reviewCardCount,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating deck settings:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
}

export async function renameDeck(
  deckId: string,
  newName: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  
  // For development: use hardcoded email if no session
  const userEmail = session?.user?.email || 'devyk100@gmail.com';
  
  if (!userEmail) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Check if user has access to this deck
    const userDeckMapping = await prisma.userDeckMapping.findFirst({
      where: {
        userId: user.id,
        deckId,
        type: "EDITOR", // Only editors can rename
      },
    });

    if (!userDeckMapping) {
      return { success: false, error: "Access denied or deck not found" };
    }

    // Update deck name
    await prisma.flashcardDeck.update({
      where: { id: deckId },
      data: { name: newName.trim() },
    });

    return { success: true };
  } catch (error) {
    console.error("Error renaming deck:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
}

export async function getDeckStats(deckId: string): Promise<{
  success: boolean;
  stats?: {
    totalCards: number;
    newCards: number;
    dueCards: number;
    futureCards: number;
    studiedToday: number;
  };
  error?: string;
}> {
  const session = await getServerSession(authOptions);
  
  // For development: use hardcoded email if no session
  const userEmail = session?.user?.email || 'devyk100@gmail.com';
  
  if (!userEmail) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Get all SRS metadata for cards in this deck
    const srsData = await prisma.sRSCardMetadata.findMany({
      where: {
        userId: user.id,
        flashcard: {
          deckId,
        },
      },
    });

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let newCards = 0;
    let dueCards = 0;
    let futureCards = 0;
    let studiedToday = 0;

    srsData.forEach(srs => {
      if (srs.repetitions === -1) {
        newCards++;
      } else if (srs.nextReview && srs.nextReview <= now) {
        dueCards++;
      } else {
        futureCards++;
      }

      // Count cards studied today
      if (srs.lastReviewed && srs.lastReviewed >= startOfDay) {
        studiedToday++;
      }
    });

    return {
      success: true,
      stats: {
        totalCards: srsData.length,
        newCards,
        dueCards,
        futureCards,
        studiedToday,
      },
    };
  } catch (error) {
    console.error("Error getting deck stats:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
}
