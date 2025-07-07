import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId;

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    // Fetch the study session with all related data
    const session = await prisma.studySession.findUnique({
      where: { id: sessionId },
      include: {
        deck: true,
        cards: {
          include: {
            flashcard: true
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!session) {
      return NextResponse.json({ error: "Study session not found" }, { status: 404 });
    }

    // Transform the data to match the frontend interface
    const sessionData = {
      id: session.id,
      deckName: session.deck.name,
      prompt: session.prompt,
      status: session.status,
      cards: session.cards.map(card => ({
        id: card.flashcard.id,
        front: card.flashcard.front,
        back: card.flashcard.back,
        order: card.order
      }))
    };

    return NextResponse.json(sessionData);
  } catch (error) {
    console.error("Error fetching study session:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
