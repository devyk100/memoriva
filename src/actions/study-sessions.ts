"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export interface CreateStudySessionParams {
  deckId: string;
  prompt: string;
  maxCards: number;
}

export interface StudySession {
  id: string;
  deckId: string;
  deckName: string;
  prompt: string;
  maxCards: number;
  status: "PENDING" | "PROCESSING" | "READY" | "FAILED";
  createdAt: string;
  completedAt?: string;
  cardCount?: number;
}

export interface Deck {
  id: string;
  name: string;
  totalCards: number;
}

export async function getDecksForStudy(): Promise<{ success: boolean; decks?: Deck[]; error?: string }> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return { success: false, error: "Not authenticated" };
  }
  
  const userEmail = session.user.email;

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Get decks the user has access to
    const userDecks = await prisma.userDeckMapping.findMany({
      where: { userId: user.id },
      include: {
        deck: {
          include: {
            _count: {
              select: { flashcards: true }
            }
          }
        }
      }
    });

    const decks: Deck[] = userDecks.map(mapping => ({
      id: mapping.deck.id,
      name: mapping.deck.name,
      totalCards: mapping.deck._count.flashcards,
    }));

    return { success: true, decks };
  } catch (error) {
    console.error("Error fetching decks for study:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
}

export async function getStudySessions(): Promise<{ success: boolean; sessions?: StudySession[]; error?: string }> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return { success: false, error: "Not authenticated" };
  }
  
  const userEmail = session.user.email;

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const sessions = await prisma.studySession.findMany({
      where: { userId: user.id },
      include: {
        deck: true,
        _count: {
          select: { cards: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const studySessions: StudySession[] = sessions.map(session => ({
      id: session.id,
      deckId: session.deckId,
      deckName: session.deck.name,
      prompt: session.prompt,
      maxCards: session.maxCards,
      status: session.status,
      createdAt: session.createdAt.toISOString(),
      completedAt: session.completedAt?.toISOString(),
      cardCount: session._count.cards > 0 ? session._count.cards : undefined,
    }));

    return { success: true, sessions: studySessions };
  } catch (error) {
    console.error("Error fetching study sessions:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
}

export async function createStudySession(params: CreateStudySessionParams): Promise<{ success: boolean; session?: StudySession; error?: string }> {
  const { deckId, prompt, maxCards } = params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return { success: false, error: "Not authenticated" };
  }
  
  const userEmail = session.user.email;

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Verify user has access to the deck
    const userDeckMapping = await prisma.userDeckMapping.findFirst({
      where: {
        userId: user.id,
        deckId,
      },
      include: { deck: true }
    });

    if (!userDeckMapping) {
      return { success: false, error: "Access denied or deck not found" };
    }

    // Create the study session
    const newSession = await prisma.studySession.create({
      data: {
        userId: user.id,
        deckId,
        prompt: prompt.trim(),
        maxCards,
        status: "PENDING",
      },
      include: { deck: true }
    });

    // Call the Go RAG backend to process the study session
    try {
      const ragBackendUrl = process.env.RAG_BACKEND_URL || 'http://localhost:8080';
      const response = await fetch(`${ragBackendUrl}/api/study-sessions/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': user.id,
          'X-User-Email': user.email,
        },
        body: JSON.stringify({
          sessionId: newSession.id,
        }),
      });

      if (!response.ok) {
        console.error('Failed to trigger RAG processing:', response.statusText);
        // Update status to PROCESSING anyway - the backend will handle it
        await prisma.studySession.update({
          where: { id: newSession.id },
          data: { status: "PROCESSING" }
        });
      }
    } catch (error) {
      console.error('Error calling RAG backend:', error);
      // Update status to PROCESSING anyway - fallback behavior
      await prisma.studySession.update({
        where: { id: newSession.id },
        data: { status: "PROCESSING" }
      });
    }

    const studySession: StudySession = {
      id: newSession.id,
      deckId: newSession.deckId,
      deckName: newSession.deck.name,
      prompt: newSession.prompt,
      maxCards: newSession.maxCards,
      status: "PROCESSING",
      createdAt: newSession.createdAt.toISOString(),
    };

    return { success: true, session: studySession };
  } catch (error) {
    console.error("Error creating study session:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
}

export async function getStudySessionCards(sessionId: string): Promise<{ 
  success: boolean; 
  cards?: Array<{ id: string; front: string; back: string; order: number }>; 
  error?: string 
}> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return { success: false, error: "Not authenticated" };
  }
  
  const userEmail = session.user.email;

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Verify user owns this study session
    const studySession = await prisma.studySession.findFirst({
      where: {
        id: sessionId,
        userId: user.id,
      }
    });

    if (!studySession) {
      return { success: false, error: "Study session not found" };
    }

    if (studySession.status !== "READY") {
      return { success: false, error: "Study session not ready" };
    }

    // Get the cards for this study session
    const sessionCards = await prisma.studySessionCard.findMany({
      where: { studySessionId: sessionId },
      include: { flashcard: true },
      orderBy: { order: 'asc' }
    });

    const cards = sessionCards.map(sessionCard => ({
      id: sessionCard.flashcard.id,
      front: sessionCard.flashcard.front,
      back: sessionCard.flashcard.back,
      order: sessionCard.order,
    }));

    return { success: true, cards };
  } catch (error) {
    console.error("Error fetching study session cards:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
}
