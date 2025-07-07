"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { SessionManager } from "@/lib/redis";

export async function updateDeckSettings(
  deckId: string,
  settings: {
    newCardCount: number;
    reviewCardCount: number;
  }
) {
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

  // Update deck metadata in database
  const deckMetadata = await prisma.deckMetadata.upsert({
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

  // Update Redis cache with new settings
  try {
    await SessionManager.setDeckSettings(user.id, deckId, settings);
  } catch (error) {
    console.warn("Failed to update Redis cache:", error);
  }

  return deckMetadata;
}

export async function getDeckSettings(deckId: string) {
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

  // Try Redis first
  try {
    const redisSettings = await SessionManager.getDeckSettings(user.id, deckId);
    if (redisSettings) {
      return redisSettings;
    }
  } catch (error) {
    console.warn("Redis not available for deck settings");
  }

  // Fallback to database
  const deckMetadata = await prisma.deckMetadata.findUnique({
    where: {
      userId_deckId: {
        userId: user.id,
        deckId,
      },
    },
  });

  if (!deckMetadata) {
    // Return default settings
    return {
      newCardCount: 20,
      reviewCardCount: 100,
    };
  }

  return {
    newCardCount: deckMetadata.newCardCount,
    reviewCardCount: deckMetadata.reviewCardCount,
  };
}
