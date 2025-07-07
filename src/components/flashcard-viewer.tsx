"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flashcard } from "@/types/flashcard";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

interface FlashcardViewerProps {
  flashcards: Flashcard[];
  deckName: string;
  onCardComplete: (difficulty: "again" | "hard" | "easy") => void;
  currentIndex: number;
  totalCards: number;
}

export function FlashcardViewer({
  flashcards,
  deckName,
  onCardComplete,
  currentIndex,
  totalCards,
}: FlashcardViewerProps) {
  const [showBack, setShowBack] = useState(false);
  const currentCard = flashcards[currentIndex];

  const handleShowAnswer = () => {
    setShowBack(true);
  };

  const handleDifficultySelect = (difficulty: "again" | "hard" | "easy") => {
    setShowBack(false);
    onCardComplete(difficulty);
  };

  if (!currentCard) {
    return (
      <div className="container mx-auto py-10 px-4 sm:px-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">No cards available</h1>
          <p className="text-muted-foreground">This deck appears to be empty.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 sm:py-6 lg:py-10 px-4 sm:px-6 min-h-screen flex flex-col">
      {/* Header */}
      <div className="text-center mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">{deckName}</h1>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-sm text-muted-foreground">
          <span>Card {currentIndex + 1} of {totalCards}</span>
          <div className="w-full sm:w-32 bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center px-2 sm:px-0">
        <Card className="w-full max-w-2xl h-[400px] sm:h-[500px] relative overflow-hidden shadow-lg border-2 transition-all duration-300 hover:shadow-xl">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-center text-base sm:text-lg font-medium text-muted-foreground">
              {showBack ? "Answer" : "Question"}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="h-full pb-16 sm:pb-20 overflow-y-auto">
            <div className="flex items-center justify-center min-h-[200px] sm:min-h-[300px] p-4 sm:p-6">
              <div className="text-center space-y-4">
                <p className="text-base sm:text-lg lg:text-xl leading-relaxed">
                  {showBack ? currentCard.back : currentCard.front}
                </p>
              </div>
            </div>
          </CardContent>

          {/* Action Buttons */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-background via-background/95 to-transparent">
            {!showBack ? (
              <div className="flex justify-center">
                <Button 
                  onClick={handleShowAnswer}
                  size="lg"
                  className="w-full sm:w-auto min-w-[140px] font-medium"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Show Answer
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
                <Button
                  onClick={() => handleDifficultySelect("again")}
                  variant="destructive"
                  size="lg"
                  className="flex-1 sm:flex-none min-w-[100px] font-medium"
                >
                  Again
                </Button>
                <Button
                  onClick={() => handleDifficultySelect("hard")}
                  size="lg"
                  className="flex-1 sm:flex-none min-w-[100px] font-medium bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Hard
                </Button>
                <Button
                  onClick={() => handleDifficultySelect("easy")}
                  size="lg"
                  className="flex-1 sm:flex-none min-w-[100px] font-medium bg-green-500 hover:bg-green-600 text-white"
                >
                  Easy
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Navigation hint */}
      <div className="text-center mt-6 text-sm text-muted-foreground">
        {showBack ? (
          <p>Rate your performance to continue to the next card</p>
        ) : (
          <p>Read the question carefully, then reveal the answer</p>
        )}
      </div>
    </div>
  );
}
