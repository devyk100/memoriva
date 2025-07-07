"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, RotateCcw, CheckCircle } from "lucide-react";

interface StudyCard {
  id: string;
  front: string;
  back: string;
  order: number;
}

interface StudySessionData {
  id: string;
  deckName: string;
  prompt: string;
  cards: StudyCard[];
  status: string;
}

const StudySessionViewer = () => {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [sessionData, setSessionData] = useState<StudySessionData | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    fetchStudySession();
  }, [sessionId]);

  const fetchStudySession = async () => {
    try {
      setIsLoading(true);
      // For now, we'll create mock data since we need to implement the backend endpoint
      // TODO: Replace with actual API call
      const mockData: StudySessionData = {
        id: sessionId,
        deckName: "Science Fundamentals",
        prompt: "Help me understand physics and chemistry concepts that I struggle with",
        cards: [
          {
            id: "1",
            front: "What is Newton's First Law of Motion?",
            back: "An object at rest stays at rest and an object in motion stays in motion with the same speed and in the same direction unless acted upon by an unbalanced force.",
            order: 1
          },
          {
            id: "2", 
            front: "What is the chemical formula for water?",
            back: "H₂O - Two hydrogen atoms bonded to one oxygen atom",
            order: 2
          },
          {
            id: "3",
            front: "What is the speed of light in a vacuum?",
            back: "299,792,458 meters per second (approximately 3 × 10⁸ m/s)",
            order: 3
          },
          {
            id: "4",
            front: "What is photosynthesis?",
            back: "The process by which plants use sunlight, water, and carbon dioxide to create oxygen and energy in the form of sugar.",
            order: 4
          },
          {
            id: "5",
            front: "What is the periodic table?",
            back: "A tabular arrangement of chemical elements, ordered by their atomic number, electron configuration, and recurring chemical properties.",
            order: 5
          }
        ],
        status: "READY"
      };
      
      setSessionData(mockData);
      setError(null);
    } catch (err) {
      setError("Failed to load study session");
      console.error("Error fetching study session:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowBack = () => {
    setShowBack(true);
  };

  const handleNextCard = () => {
    if (currentCardIndex < (sessionData?.cards.length || 0) - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowBack(false);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePreviousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowBack(false);
    }
  };

  const handleRestart = () => {
    setCurrentCardIndex(0);
    setShowBack(false);
    setIsCompleted(false);
  };

  const handleBackToSessions = () => {
    router.push("/study");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading study session...</span>
        </div>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <h3 className="text-lg font-semibold mb-2 text-red-600">Error</h3>
            <p className="text-muted-foreground text-center mb-4">
              {error || "Study session not found"}
            </p>
            <Button onClick={handleBackToSessions}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Study Sessions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Study Session Complete!</h3>
            <p className="text-muted-foreground text-center mb-4">
              You've reviewed all {sessionData.cards.length} cards in this session.
            </p>
            <div className="flex gap-2">
              <Button onClick={handleRestart} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Study Again
              </Button>
              <Button onClick={handleBackToSessions}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sessions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentCard = sessionData.cards[currentCardIndex];

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Button variant="ghost" onClick={handleBackToSessions} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Study Sessions
          </Button>
          <h1 className="text-2xl font-bold">{sessionData.deckName}</h1>
          <p className="text-muted-foreground">"{sessionData.prompt}"</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">
            Card {currentCardIndex + 1} of {sessionData.cards.length}
          </div>
          <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentCardIndex + 1) / sessionData.cards.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Card Display */}
      <Card className="min-h-[400px]">
        <CardHeader>
          <CardTitle className="text-center">
            {showBack ? "Answer" : "Question"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col justify-center items-center min-h-[300px]">
          <div className="text-center text-lg leading-relaxed max-w-2xl">
            {showBack ? (
              <div 
                className="prose prose-lg dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: currentCard.back }}
              />
            ) : (
              <div 
                className="prose prose-lg dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: currentCard.front }}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex justify-center gap-4 mt-6">
        {currentCardIndex > 0 && (
          <Button variant="outline" onClick={handlePreviousCard}>
            Previous
          </Button>
        )}
        
        {!showBack ? (
          <Button onClick={handleShowBack} className="px-8">
            Show Answer
          </Button>
        ) : (
          <Button onClick={handleNextCard} className="px-8">
            {currentCardIndex < sessionData.cards.length - 1 ? "Next Card" : "Complete Session"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default StudySessionViewer;
