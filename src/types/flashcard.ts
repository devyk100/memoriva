export interface Flashcard {
  id: string;
  front: string;
  back: string;
  deckId: string;
}

export interface FlashcardDeck {
  id: string;
  name: string;
  flashcards: Flashcard[];
}

export interface FlashcardResponse {
  deck: FlashcardDeck;
  totalCards: number;
}
