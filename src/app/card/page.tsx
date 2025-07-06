"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getFlashcardsByDeckId } from "@/actions/get-flashcards";
import { FlashcardViewer } from "@/components/flashcard-viewer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";

const CardPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const deckId = searchParams.get("id");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const {
    data: flashcardData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["flashcards", deckId],
    queryFn: () => getFlashcardsByDeckId(deckId!),
    enabled: !!deckId,
  });

  const handleCardComplete = (difficulty: "again" | "hard" | "easy") => {
    if (!flashcardData?.deck.flashcards) return;

    // Move to next card
    const nextIndex = currentCardIndex + 1;
    
    if (nextIndex >= flashcardData.deck.flashcards.length) {
      // Reached end of deck
      setCurrentCardIndex(0); // Reset to first card or handle completion
    } else {
      setCurrentCardIndex(nextIndex);
    }
  };

  const handleBackToDeck = () => {
    router.push("/decks");
  };

  const handleRestart = () => {
    setCurrentCardIndex(0);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-4 sm:px-6 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md p-8">
          <CardContent className="text-center space-y-4">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
            <h2 className="text-xl font-semibold">Loading flashcards...</h2>
            <p className="text-muted-foreground">Please wait while we fetch your deck.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error || !flashcardData) {
    return (
      <div className="container mx-auto py-10 px-4 sm:px-6 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md p-8">
          <CardContent className="text-center space-y-4">
            <h2 className="text-xl font-semibold text-destructive">Deck not found</h2>
            <p className="text-muted-foreground">
              {!deckId 
                ? "No deck ID provided in the URL." 
                : "The requested deck could not be found."}
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleBackToDeck} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Decks
              </Button>
              {deckId && (
                <Button onClick={() => refetch()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Deck completion state
  if (currentCardIndex >= flashcardData.deck.flashcards.length) {
    return (
      <div className="container mx-auto py-10 px-4 sm:px-6 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md p-8">
          <CardContent className="text-center space-y-4">
            <h2 className="text-2xl font-bold">🎉 Deck Complete!</h2>
            <p className="text-muted-foreground">
              You've finished studying all {flashcardData.totalCards} cards in "{flashcardData.deck.name}".
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleRestart}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Study Again
              </Button>
              <Button onClick={handleBackToDeck} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Decks
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <FlashcardViewer
      flashcards={flashcardData.deck.flashcards}
      deckName={flashcardData.deck.name}
      onCardComplete={handleCardComplete}
      currentIndex={currentCardIndex}
      totalCards={flashcardData.totalCards}
    />
  );
};

export default CardPage;
