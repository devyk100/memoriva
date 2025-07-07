import { createClient } from 'redis';

const globalForRedis = global as unknown as { redis: ReturnType<typeof createClient> };

export const redis =
  globalForRedis.redis ||
  createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  });

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

// Connect to Redis if not already connected
if (!redis.isOpen) {
  redis.connect().catch((err) => {
    console.warn('Redis connection failed:', err);
  });
}

// Queue management utilities
export const QueueManager = {
  // Get card queue for a user-deck combination
  async getCardQueue(userId: string, deckId: string): Promise<string[]> {
    try {
      const queueKey = `deck:${deckId}:user:${userId}:queue`;
      const queue = await redis.lRange(queueKey, 0, -1);
      return queue;
    } catch (error) {
      console.warn('Redis queue fetch failed:', error);
      return [];
    }
  },

  // Set card queue for a user-deck combination
  async setCardQueue(userId: string, deckId: string, cardIds: string[]): Promise<void> {
    try {
      const queueKey = `deck:${deckId}:user:${userId}:queue`;
      await redis.del(queueKey);
      if (cardIds.length > 0) {
        await redis.lPush(queueKey, cardIds);
      }
      // Set expiration to 1 hour
      await redis.expire(queueKey, 3600);
    } catch (error) {
      console.warn('Redis queue set failed:', error);
    }
  },

  // Pop next card from queue
  async popNextCard(userId: string, deckId: string): Promise<string | null> {
    try {
      const queueKey = `deck:${deckId}:user:${userId}:queue`;
      return await redis.rPop(queueKey);
    } catch (error) {
      console.warn('Redis queue pop failed:', error);
      return null;
    }
  },

  // Add cards to queue
  async addToQueue(userId: string, deckId: string, cardIds: string[]): Promise<void> {
    try {
      const queueKey = `deck:${deckId}:user:${userId}:queue`;
      if (cardIds.length > 0) {
        await redis.lPush(queueKey, cardIds);
      }
    } catch (error) {
      console.warn('Redis queue add failed:', error);
    }
  },

  // Get queue length
  async getQueueLength(userId: string, deckId: string): Promise<number> {
    try {
      const queueKey = `deck:${deckId}:user:${userId}:queue`;
      return await redis.lLen(queueKey);
    } catch (error) {
      console.warn('Redis queue length failed:', error);
      return 0;
    }
  },

  // Clear queue
  async clearQueue(userId: string, deckId: string): Promise<void> {
    try {
      const queueKey = `deck:${deckId}:user:${userId}:queue`;
      await redis.del(queueKey);
    } catch (error) {
      console.warn('Redis queue clear failed:', error);
    }
  },
};

// Session management utilities
export const SessionManager = {
  // Store deck settings in Redis
  async setDeckSettings(userId: string, deckId: string, settings: { newCardCount: number; reviewCardCount: number }): Promise<void> {
    try {
      const settingsKey = `deck:${deckId}:user:${userId}:settings`;
      await redis.hSet(settingsKey, settings);
      await redis.expire(settingsKey, 86400); // 24 hours
    } catch (error) {
      console.warn('Redis settings set failed:', error);
    }
  },

  // Get deck settings from Redis
  async getDeckSettings(userId: string, deckId: string): Promise<{ newCardCount: number; reviewCardCount: number } | null> {
    try {
      const settingsKey = `deck:${deckId}:user:${userId}:settings`;
      const settings = await redis.hGetAll(settingsKey);
      if (Object.keys(settings).length === 0) return null;
      
      return {
        newCardCount: parseInt(settings.newCardCount) || 20,
        reviewCardCount: parseInt(settings.reviewCardCount) || 100,
      };
    } catch (error) {
      console.warn('Redis settings get failed:', error);
      return null;
    }
  },

  // Get daily limits for a deck
  async getDailyLimits(userId: string, deckId: string): Promise<{ newCardsStudied: number; reviewCardsStudied: number }> {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const limitsKey = `deck:${deckId}:user:${userId}:daily:${today}`;
      const limits = await redis.hGetAll(limitsKey);
      
      return {
        newCardsStudied: parseInt(limits.newCardsStudied) || 0,
        reviewCardsStudied: parseInt(limits.reviewCardsStudied) || 0,
      };
    } catch (error) {
      console.warn('Redis daily limits get failed:', error);
      return { newCardsStudied: 0, reviewCardsStudied: 0 };
    }
  },

  // Increment daily limits
  async incrementDailyLimits(userId: string, deckId: string, type: 'new' | 'review'): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const limitsKey = `deck:${deckId}:user:${userId}:daily:${today}`;
      const field = type === 'new' ? 'newCardsStudied' : 'reviewCardsStudied';
      
      await redis.hIncrBy(limitsKey, field, 1);
      // Set expiration to end of day (86400 seconds = 24 hours)
      await redis.expire(limitsKey, 86400);
    } catch (error) {
      console.warn('Redis daily limits increment failed:', error);
    }
  },

  // Check if daily limits are reached
  async checkDailyLimits(userId: string, deckId: string): Promise<{ canStudyNew: boolean; canStudyReview: boolean }> {
    try {
      const [settings, limits] = await Promise.all([
        this.getDeckSettings(userId, deckId),
        this.getDailyLimits(userId, deckId),
      ]);

      const maxNew = settings?.newCardCount || 20;
      const maxReview = settings?.reviewCardCount || 100;

      return {
        canStudyNew: limits.newCardsStudied < maxNew,
        canStudyReview: limits.reviewCardsStudied < maxReview,
      };
    } catch (error) {
      console.warn('Redis daily limits check failed:', error);
      return { canStudyNew: true, canStudyReview: true };
    }
  },

  // Decrement new card count when a new card graduates (gets "Easy")
  async decrementNewCardCount(userId: string, deckId: string): Promise<void> {
    try {
      const settingsKey = `deck:${deckId}:user:${userId}:settings`;
      const currentCount = await redis.hGet(settingsKey, 'newCardCount');
      const newCount = Math.max(0, (parseInt(currentCount || '20') - 1));
      
      await redis.hSet(settingsKey, 'newCardCount', newCount.toString());
      await redis.expire(settingsKey, 86400); // 24 hours
    } catch (error) {
      console.warn('Redis new card count decrement failed:', error);
    }
  },
};
