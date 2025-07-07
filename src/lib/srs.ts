export type SRSGrade = 0 | 1 | 2; // 0 = again, 1 = hard, 2 = easy

export interface SRSCardData {
  repetitions: number;
  easeFactor: number;
  interval: bigint;
  lastReviewed: Date | null;
  nextReview: Date | null;
}

export interface SRSUpdateResult {
  repetitions: number;
  easeFactor: number;
  interval: bigint;
  lastReviewed: Date;
  nextReview: Date;
}

/**
 * Implements the SRS algorithm as specified by the user
 */
export function calculateSRSUpdate(
  cardData: SRSCardData,
  grade: SRSGrade
): SRSUpdateResult {
  const now = new Date();
  let { repetitions, easeFactor, interval } = cardData;

  // Convert interval from bigint to number for calculations
  let intervalMinutes = Number(interval);

  if (repetitions === -1) {
    // New card logic
    repetitions = 1;
    
    if (grade === 0) {
      intervalMinutes = 5; // 5 minutes
    } else if (grade === 1) {
      intervalMinutes = 10; // 10 minutes
    } else {
      intervalMinutes = 20; // 20 minutes
    }
    
    const nextReview = new Date(now.getTime() + intervalMinutes * 60 * 1000);
    
    return {
      repetitions,
      easeFactor,
      interval: BigInt(intervalMinutes),
      lastReviewed: now,
      nextReview,
    };
  } else if (grade === 0) {
    // Again - penalty logic
    repetitions++;
    
    if (intervalMinutes < 1440) { // Less than 1 day (1440 minutes)
      intervalMinutes = Math.floor(intervalMinutes * 1.5);
    } else {
      intervalMinutes = 10; // Reset to 10 minutes
    }
    
    const lastReviewDate = cardData.nextReview || now;
    const nextReviewTime = intervalMinutes * 60 * 1000 + lastReviewDate.getTime();
    
    // Don't go past 11:59 PM of the last review date
    const endOfDay = new Date(lastReviewDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const nextReview = new Date(Math.min(nextReviewTime, endOfDay.getTime()));
    
    return {
      repetitions,
      easeFactor,
      interval: BigInt(intervalMinutes),
      lastReviewed: lastReviewDate,
      nextReview,
    };
  } else {
    // Hard (grade 1) or Easy (grade 2) - SM-2 algorithm
    let q: number;
    if (grade === 1) {
      q = 3; // Hard
    } else {
      q = 5; // Easy
    }
    
    repetitions++;
    
    // Ensure interval is at least 1 day
    intervalMinutes = Math.max(intervalMinutes, 1440);
    
    const lastReviewDate = cardData.nextReview || now;
    
    // Calculate new ease factor
    easeFactor = easeFactor - 0.8 + 0.2 * q + 0.02 * q * q;
    easeFactor = Math.max(1.3, easeFactor);
    easeFactor = Math.min(2.7, easeFactor);
    
    // Calculate new interval
    intervalMinutes = Math.floor(intervalMinutes * easeFactor);
    
    const nextReview = new Date(lastReviewDate.getTime() + intervalMinutes * 60 * 1000);
    
    return {
      repetitions,
      easeFactor,
      interval: BigInt(intervalMinutes),
      lastReviewed: lastReviewDate,
      nextReview,
    };
  }
}

/**
 * Helper function to get cards due for review today
 */
export function getCardsForReview(
  cards: Array<{ id: string; nextReview: Date | null; repetitions: number }>,
  reviewCardCount: number
): string[] {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Get cards that are due for review (nextReview <= now and repetitions >= 0)
  const dueCards = cards
    .filter(card => 
      card.repetitions >= 0 && 
      card.nextReview && 
      card.nextReview <= now
    )
    .sort((a, b) => {
      // Sort by nextReview date (earliest first)
      if (!a.nextReview || !b.nextReview) return 0;
      return a.nextReview.getTime() - b.nextReview.getTime();
    })
    .slice(0, reviewCardCount)
    .map(card => card.id);
  
  return dueCards;
}

/**
 * Helper function to get new cards for study
 */
export function getNewCards(
  cards: Array<{ id: string; repetitions: number }>,
  newCardCount: number
): string[] {
  // Get cards that are new (repetitions = -1)
  const newCards = cards
    .filter(card => card.repetitions === -1)
    .slice(0, newCardCount)
    .map(card => card.id);
  
  return newCards;
}

/**
 * Randomly shuffle and combine new and review cards
 */
export function createStudyQueue(
  newCardIds: string[],
  reviewCardIds: string[],
  minQueueSize: number = 10
): string[] {
  // Combine arrays
  const allCards = [...newCardIds, ...reviewCardIds];
  
  // Shuffle the combined array
  for (let i = allCards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
  }
  
  // Ensure we have at least minQueueSize cards if available
  return allCards.slice(0, Math.max(minQueueSize, allCards.length));
}
