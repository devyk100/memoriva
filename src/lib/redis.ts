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
};
