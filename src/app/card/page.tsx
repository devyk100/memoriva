"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDeckWithSRS, getNextCards } from "@/actions/get-deck-with-srs";
import { updateCardSRS } from "@/actions/update-card-srs";
import { SRSGrade } from "@/lib/srs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Eye, EyeOff } from "lucide-react";

interface StudyCard {
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
}

const CardPageContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const deckId = searchParams.get("id");
  
  const [studyCards, setStudyCards] = useState<StudyCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [isStudyComplete, setIsStudyComplete] = useState(false);

  // Get deck information
  const {
    data: deckData,
    isLoading: deckLoading,
    error: deckError
  } = useQuery({
    queryKey: ["deck", deckId],
    queryFn: () => getDeckWithSRS(deckId!),
    enabled: !!deckId,
  });

  // Get next cards for study
  const {
    data: cardsData,
    isLoading: cardsLoading,
    refetch: refetchCards
  } = useQuery({
    queryKey: ["nextCards", deckId],
    queryFn: () => getNextCards(deckId!),
    enabled: !!deckId,
  });

  // Update card SRS mutation
  const updateCardMutation = useMutation({
    mutationFn: updateCardSRS,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["deck", deckId] });
      queryClient.invalidateQueries({ queryKey: ["nextCards", deckId] });
    },
  });

  // Load cards when data is available
  useEffect(() => {
    if (cardsData?.cards) {
      setStudyCards(cardsData.cards);
      setCurrentCardIndex(0);
      setShowBack(false);
      setIsStudyComplete(cardsData.cards.length === 0);
    }
  }, [cardsData]);

  const handleCardGrade = async (grade: SRSGrade) => {
    const currentCard = studyCards[currentCardIndex];
    if (!currentCard) return;

    try {
      await updateCardMutation.mutateAsync({
        cardId: currentCard.id,
        grade,
      });

      // Move to next card
      const nextIndex = currentCardIndex + 1;
      if (nextIndex >= studyCards.length) {
        // Refetch more cards or mark as complete
        const newCardsData = await refetchCards();
        if (newCardsData.data?.cards.length === 0) {
          setIsStudyComplete(true);
        }
      } else {
        setCurrentCardIndex(nextIndex);
        setShowBack(false);
      }
    } catch (error) {
      console.error("Error updating card:", error);
    }
  };

  const handleShowAnswer = () => {
    setShowBack(true);
  };

  const handleBackToDeck = () => {
    router.push("/decks");
  };

  const handleRestart = () => {
    refetchCards();
    setIsStudyComplete(false);
  };

  if (deckLoading || cardsLoading) {
    return (
      <div className="container mx-auto py-10 px-4 sm:px-6 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md p-8">
          <CardContent className="text-center space-y-4">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
            <h2 className="text-xl font-semibold">Loading study session...</h2>
            <p className="text-muted-foreground">Please wait while we prepare your cards.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (deckError || !deckData) {
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
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isStudyComplete || studyCards.length === 0) {
    return (
      <div className="container mx-auto py-10 px-4 sm:px-6 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md p-8">
          <CardContent className="text-center space-y-4">
            <h2 className="text-2xl font-bold">🎉 Study Session Complete!</h2>
            <p className="text-muted-foreground">
              Great job! You've completed your study session for "{deckData.name}".
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">{deckData.stats.newCards}</div>
                <div className="text-muted-foreground">New Cards</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-red-600">{deckData.stats.dueCards}</div>
                <div className="text-muted-foreground">Due Cards</div>
              </div>
            </div>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleRestart}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Study More
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

  const currentCard = studyCards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / studyCards.length) * 100;

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button onClick={handleBackToDeck} variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Decks
        </Button>
        <div className="text-center">
          <h1 className="text-lg font-semibold">{deckData.name}</h1>
          <p className="text-sm text-muted-foreground">
            Card {currentCardIndex + 1} of {studyCards.length}
          </p>
        </div>
        <div className="w-20"></div> {/* Spacer for centering */}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-muted rounded-full h-2 mb-6">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Flashcard */}
      <div className="max-w-2xl mx-auto">
        <Card className="min-h-[400px] flex flex-col">
          <CardHeader>
            <CardTitle className="text-center">
              {showBack ? "Answer" : "Question"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div 
                className="text-lg leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: showBack ? currentCard.back : currentCard.front 
                }}
              />
              
              {!showBack && (
                <Button onClick={handleShowAnswer} className="mt-6">
                  <Eye className="w-4 h-4 mr-2" />
                  Show Answer
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Grade Buttons */}
        {showBack && (
          <div className="mt-6 grid grid-cols-3 gap-4">
            <Button
              onClick={() => handleCardGrade(0)}
              variant="destructive"
              className="h-16 flex flex-col"
              disabled={updateCardMutation.isPending}
            >
              <span className="font-semibold">Again</span>
              <span className="text-xs opacity-80">
                {currentCard.srsMetadata.repetitions === -1 ? "5 min" : "Hard"}
              </span>
            </Button>
            <Button
              onClick={() => handleCardGrade(1)}
              variant="outline"
              className="h-16 flex flex-col border-yellow-500 text-yellow-600 hover:bg-yellow-50"
              disabled={updateCardMutation.isPending}
            >
              <span className="font-semibold">Hard</span>
              <span className="text-xs opacity-80">
                {currentCard.srsMetadata.repetitions === -1 ? "10 min" : "Difficult"}
              </span>
            </Button>
            <Button
              onClick={() => handleCardGrade(2)}
              variant="outline"
              className="h-16 flex flex-col border-green-500 text-green-600 hover:bg-green-50"
              disabled={updateCardMutation.isPending}
            >
              <span className="font-semibold">Easy</span>
              <span className="text-xs opacity-80">
                {currentCard.srsMetadata.repetitions === -1 ? "20 min" : "Good"}
              </span>
            </Button>
          </div>
        )}

        {/* Card Info */}
        <div className="mt-4 text-center text-sm text-muted-foreground">
          {currentCard.srsMetadata.repetitions === -1 ? (
            <span>New card</span>
          ) : (
            <span>
              Repetition {currentCard.srsMetadata.repetitions} • 
              Ease {currentCard.srsMetadata.easeFactor.toFixed(1)} • 
              Interval {Number(currentCard.srsMetadata.interval)} min
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const CardPage = () => {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-10 px-4 sm:px-6 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md p-8">
          <CardContent className="text-center space-y-4">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
            <h2 className="text-xl font-semibold">Loading...</h2>
          </CardContent>
        </Card>
      </div>
    }>
      <CardPageContent />
    </Suspense>
  );
};

export default CardPage;
