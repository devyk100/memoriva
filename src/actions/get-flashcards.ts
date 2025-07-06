"use server";

import { FlashcardResponse } from "@/types/flashcard";

// Dummy data that matches our Prisma schema
const dummyDecks = {
  "deck-1": {
    id: "deck-1",
    name: "Geography Basics",
    flashcards: [
      {
        id: "card-1",
        front: "What is the capital of France?",
        back: "Paris is the capital and most populous city of France. It has been a major center of finance, diplomacy, commerce, fashion, science, and the arts since the 17th century.",
        deckId: "deck-1"
      },
      {
        id: "card-2",
        front: "Which is the largest ocean on Earth?",
        back: "The Pacific Ocean is the largest and deepest ocean on Earth, covering about 46% of the world's ocean surface and about one-third of the total surface area.",
        deckId: "deck-1"
      },
      {
        id: "card-3",
        front: "What is the highest mountain in the world?",
        back: "Mount Everest, located in the Himalayas on the border between Nepal and Tibet, stands at 8,848.86 meters (29,031.7 feet) above sea level.",
        deckId: "deck-1"
      },
      {
        id: "card-4",
        front: "Which river is the longest in the world?",
        back: "The Nile River in Africa is generally considered the longest river in the world, flowing approximately 6,650 kilometers (4,130 miles) from its source to the Mediterranean Sea.",
        deckId: "deck-1"
      },
      {
        id: "card-5",
        front: "What is the smallest country in the world?",
        back: "Vatican City is the smallest country in the world by both area and population, covering just 0.17 square miles (0.44 square kilometers) and home to around 800 people.",
        deckId: "deck-1"
      }
    ]
  },
  "deck-2": {
    id: "deck-2",
    name: "Science Fundamentals",
    flashcards: [
      {
        id: "card-6",
        front: "What is the chemical symbol for gold?",
        back: "Au - derived from the Latin word 'aurum' meaning gold. Gold is a chemical element with atomic number 79.",
        deckId: "deck-2"
      },
      {
        id: "card-7",
        front: "How many bones are in the adult human body?",
        back: "An adult human body typically has 206 bones. Babies are born with about 270 bones, but many fuse together as they grow.",
        deckId: "deck-2"
      },
      {
        id: "card-8",
        front: "What is the speed of light in a vacuum?",
        back: "The speed of light in a vacuum is approximately 299,792,458 meters per second (about 186,282 miles per second), often denoted as 'c' in physics equations.",
        deckId: "deck-2"
      }
    ]
  }
};

export async function getFlashcardsByDeckId(deckId: string): Promise<FlashcardResponse | null> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const deck = dummyDecks[deckId as keyof typeof dummyDecks];
  
  if (!deck) {
    return null;
  }
  
  return {
    deck,
    totalCards: deck.flashcards.length
  };
}
