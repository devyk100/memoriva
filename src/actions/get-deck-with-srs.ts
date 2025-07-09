"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { QueueManager, SessionManager } from "@/lib/redis";
import { getCardsForReview, getNewCards, createStudyQueue } from "@/lib/srs";

export interface DeckWithSRSData {
  id: string;
  name: string;
  flashcards: Array<{
    id: string;
    front: string;
    back: string;
    srsMetadata?: {
      repetitions: number;
      easeFactor: number;
      interval: bigint;
      lastReviewed: Date | null;
      nextReview: Date | null;
    };
  }>;
  metadata: {
    newCardCount: number;
    reviewCardCount: number;
  };
  stats: {
    totalCards: number;
    newCards: number;
    dueCards: number;
    futureCards: number;
  };
}

export async function getDeckWithSRS(deckId: string): Promise<DeckWithSRSData | null> {
  const session = await getServerSession(authOptions);
  
  // For development: use hardcoded email if no session
  const userEmail = session?.user?.email || 'devyk100@gmail.com';
  
  if (!userEmail) {
    throw new Error("Not authenticated");
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Get deck with flashcards
  const deck = await prisma.flashcardDeck.findUnique({
    where: { id: deckId },
    include: {
      flashcards: {
        include: {
          srsCardMetadata: {
            where: { userId: user.id },
          },
        },
      },
    },
  });

  if (!deck) {
    return null;
  }

  // Create deck metadata and SRS card metadata using separate powerful SQL operations
  
  // 1. Create deck metadata if it doesn't exist
  await prisma.$executeRaw`
    INSERT INTO "DeckMetadata" ("id", "userId", "deckId", "newCardCount", "reviewCardCount")
    SELECT gen_random_uuid(), ${user.id}, ${deck.id}, 20, 100
    WHERE NOT EXISTS (
      SELECT 1 FROM "DeckMetadata" 
      WHERE "userId" = ${user.id} AND "deckId" = ${deck.id}
    )
  `;
  
  // 2. Create SRS metadata for all cards that don't have it (repetitions = -1 by default)
  await prisma.$executeRaw`
    INSERT INTO "SRSCardMetadata" ("id", "userId", "flashcardId", "easeFactor", "interval", "repetitions")
    SELECT gen_random_uuid(), ${user.id}, f."id", 1.3, 1, -1
    FROM "Flashcard" f
    WHERE f."deckId" = ${deck.id}
    AND NOT EXISTS (
      SELECT 1 FROM "SRSCardMetadata" srs 
      WHERE srs."userId" = ${user.id} AND srs."flashcardId" = f."id"
    )
  `;

  // Get deck metadata (now guaranteed to exist)
  const deckMetadata = await prisma.deckMetadata.findUnique({
    where: {
      userId_deckId: {
        userId: user.id,
        deckId: deck.id,
      },
    },
  });

  if (!deckMetadata) {
    throw new Error("Failed to create deck metadata");
  }

  // Refetch deck with all SRS metadata (now guaranteed to exist for all cards)
  const updatedDeck = await prisma.flashcardDeck.findUnique({
    where: { id: deckId },
    include: {
      flashcards: {
        include: {
          srsCardMetadata: {
            where: { userId: user.id },
          },
        },
      },
    },
  });

  if (!updatedDeck) {
    throw new Error("Failed to fetch updated deck");
  }

  deck.flashcards = updatedDeck.flashcards;

  // Calculate statistics
  const now = new Date();
  let newCards = 0;
  let dueCards = 0;
  let futureCards = 0;

  deck.flashcards.forEach(card => {
    const srs = card.srsCardMetadata[0];
    if (!srs) return;

    if (srs.repetitions === -1) {
      newCards++;
    } else if (srs.nextReview && srs.nextReview <= now) {
      dueCards++;
    } else {
      futureCards++;
    }
  });

  // Format response
  const response: DeckWithSRSData = {
    id: deck.id,
    name: deck.name,
    flashcards: deck.flashcards.map(card => ({
      id: card.id,
      front: card.front,
      back: card.back,
      srsMetadata: card.srsCardMetadata[0] ? {
        repetitions: card.srsCardMetadata[0].repetitions,
        easeFactor: card.srsCardMetadata[0].easeFactor,
        interval: card.srsCardMetadata[0].interval,
        lastReviewed: card.srsCardMetadata[0].lastReviewed,
        nextReview: card.srsCardMetadata[0].nextReview,
      } : undefined,
    })),
    metadata: {
      newCardCount: deckMetadata.newCardCount,
      reviewCardCount: deckMetadata.reviewCardCount,
    },
    stats: {
      totalCards: deck.flashcards.length,
      newCards,
      dueCards,
      futureCards,
    },
  };

  return response;
}

export async function getNextCards(deckId: string): Promise<{
  cards: Array<{
    id: string;
    front: string;
    back: string;
    srsMetadata: {
      repetitions: number;
      easeFactor: number;
      interval: bigint;
      lastReviewed: Date | null;
      nextReview: Date | null;
    };
  }>;
  queueLength: number;
}> {
  const session = await getServerSession(authOptions);
  
  // For development: use hardcoded email if no session
  const userEmail = session?.user?.email || 'devyk100@gmail.com';
  
  if (!userEmail) {
    throw new Error("Not authenticated");
  }

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    throw new Error("User not found");
  }

  try {
    // Try Redis queue first with timeout
    const redisTimeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Redis timeout')), 1000)
    );
    
    const redisOperation = async (): Promise<{
      cards: Array<{
        id: string;
        front: string;
        back: string;
        srsMetadata: {
          repetitions: number;
          easeFactor: number;
          interval: bigint;
          lastReviewed: Date | null;
          nextReview: Date | null;
        };
      }>;
      queueLength: number;
    } | null> => {
      const queueLength = await QueueManager.getQueueLength(user.id, deckId);
      
      if (queueLength < 5) {
        // Refill queue
        await refillQueue(user.id, deckId);
      }

      // Get next cards from queue
      const cardIds: string[] = [];
      for (let i = 0; i < 10; i++) {
        const cardId = await QueueManager.popNextCard(user.id, deckId);
        if (cardId) {
          cardIds.push(cardId);
        } else {
          break;
        }
      }

      if (cardIds.length > 0) {
        // Fetch card details
        const cards = await prisma.flashcard.findMany({
          where: {
            id: { in: cardIds },
          },
          include: {
            srsCardMetadata: {
              where: { userId: user.id },
            },
          },
        });

        // Sort cards to match the order from queue
        const sortedCards = cardIds.map(id => cards.find(card => card.id === id)).filter(Boolean);

        const response = sortedCards.map(card => ({
          id: card!.id,
          front: card!.front,
          back: card!.back,
          srsMetadata: {
            repetitions: card!.srsCardMetadata[0].repetitions,
            easeFactor: card!.srsCardMetadata[0].easeFactor,
            interval: card!.srsCardMetadata[0].interval,
            lastReviewed: card!.srsCardMetadata[0].lastReviewed,
            nextReview: card!.srsCardMetadata[0].nextReview,
          },
        }));

        const newQueueLength = await QueueManager.getQueueLength(user.id, deckId);

        return {
          cards: response,
          queueLength: newQueueLength,
        };
      }
      return null;
    };

    const result = await Promise.race([redisOperation(), redisTimeout]) as {
      cards: Array<{
        id: string;
        front: string;
        back: string;
        srsMetadata: {
          repetitions: number;
          easeFactor: number;
          interval: bigint;
          lastReviewed: Date | null;
          nextReview: Date | null;
        };
      }>;
      queueLength: number;
    } | null;
    
    if (result && result.cards && result.cards.length > 0) {
      return result;
    }
  } catch (error) {
    console.log("Redis not available, falling back to direct database query");
  }

  // Fallback: Get cards directly from database when Redis is not available
  const deckMetadata = await prisma.deckMetadata.findUnique({
    where: {
      userId_deckId: {
        userId: user.id,
        deckId,
      },
    },
  });

  if (!deckMetadata) {
    return { cards: [], queueLength: 0 };
  }

  // Get all cards with SRS metadata
  const cardsWithSRS = await prisma.sRSCardMetadata.findMany({
    where: {
      userId: user.id,
      flashcard: {
        deckId,
      },
    },
    include: {
      flashcard: true,
    },
  });

  // Separate new and review cards
  const cardData = cardsWithSRS.map(srs => ({
    id: srs.flashcard.id,
    repetitions: srs.repetitions,
    nextReview: srs.nextReview,
    srs,
  }));

  const newCardIds = getNewCards(cardData, deckMetadata.newCardCount);
  const reviewCardIds = getCardsForReview(cardData, deckMetadata.reviewCardCount);

  // Create study queue
  const queueCardIds = createStudyQueue(newCardIds, reviewCardIds, 10);

  // Get the actual card data
  const cards = queueCardIds.map(cardId => {
    const cardWithSRS = cardsWithSRS.find(c => c.flashcard.id === cardId);
    if (!cardWithSRS) return null;
    
    return {
      id: cardWithSRS.flashcard.id,
      front: cardWithSRS.flashcard.front,
      back: cardWithSRS.flashcard.back,
      srsMetadata: {
        repetitions: cardWithSRS.repetitions,
        easeFactor: cardWithSRS.easeFactor,
        interval: cardWithSRS.interval,
        lastReviewed: cardWithSRS.lastReviewed,
        nextReview: cardWithSRS.nextReview,
      },
    };
  }).filter(Boolean);

  return {
    cards: cards as any[],
    queueLength: cards.length,
  };
}

async function refillQueue(userId: string, deckId: string): Promise<void> {
  // Get deck metadata
  const deckMetadata = await prisma.deckMetadata.findUnique({
    where: {
      userId_deckId: {
        userId,
        deckId,
      },
    },
  });

  if (!deckMetadata) return;

  // Check daily limits
  const dailyLimits = await SessionManager.checkDailyLimits(userId, deckId);

  // Get all cards with SRS metadata
  const cardsWithSRS = await prisma.sRSCardMetadata.findMany({
    where: {
      userId,
      flashcard: {
        deckId,
      },
    },
    include: {
      flashcard: true,
    },
  });

  // Separate new and review cards
  const cardData = cardsWithSRS.map(srs => ({
    id: srs.flashcard.id,
    repetitions: srs.repetitions,
    nextReview: srs.nextReview,
  }));

  // Apply daily limits
  const maxNewCards = dailyLimits.canStudyNew ? deckMetadata.newCardCount : 0;
  const maxReviewCards = dailyLimits.canStudyReview ? deckMetadata.reviewCardCount : 0;

  const newCardIds = getNewCards(cardData, maxNewCards);
  const reviewCardIds = getCardsForReview(cardData, maxReviewCards);

  // Create study queue
  const queueCardIds = createStudyQueue(newCardIds, reviewCardIds, 20);

  // Update Redis queue
  await QueueManager.setCardQueue(userId, deckId, queueCardIds);
}
