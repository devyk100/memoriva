"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getFlashcardsByDeckId } from "@/actions/get-flashcards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Edit3, Save, X, Plus } from "lucide-react";
import { Flashcard } from "@/types/flashcard";
import Editor from "@/components/editor/editor";
import { cn } from "@/lib/utils";

const CardEditorPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const deckId = searchParams.get("id");
  const initialCardId = searchParams.get("cardId");
  
  const [selectedCard, setSelectedCard] = useState<Flashcard | null>(null);
  const [editingFront, setEditingFront] = useState("");
  const [editingBack, setEditingBack] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"front" | "back">("front");

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

  // Set initial card if cardId is provided in URL
  useEffect(() => {
    if (flashcardData?.deck.flashcards && initialCardId) {
      const card = flashcardData.deck.flashcards.find(c => c.id === initialCardId);
      if (card) {
        setSelectedCard(card);
        setEditingFront(card.front);
        setEditingBack(card.back);
      }
    }
  }, [flashcardData, initialCardId]);

  const handleCardSelect = (card: Flashcard) => {
    setSelectedCard(card);
    setEditingFront(card.front);
    setEditingBack(card.back);
    setIsEditing(false);
    setActiveTab("front");
    
    // Update URL with selected card
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("cardId", card.id);
    window.history.replaceState({}, "", newUrl.toString());
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedCard) return;
    
    // Mock API call to update card
    try {
      console.log("Updating card:", {
        id: selectedCard.id,
        front: editingFront,
        back: editingBack
      });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      if (flashcardData) {
        const updatedCard = { ...selectedCard, front: editingFront, back: editingBack };
        setSelectedCard(updatedCard);
        
        // Update the card in the deck data
        const cardIndex = flashcardData.deck.flashcards.findIndex(c => c.id === selectedCard.id);
        if (cardIndex !== -1) {
          flashcardData.deck.flashcards[cardIndex] = updatedCard;
        }
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update card:", error);
    }
  };

  const handleCancelEdit = () => {
    if (selectedCard) {
      setEditingFront(selectedCard.front);
      setEditingBack(selectedCard.back);
    }
    setIsEditing(false);
  };

  const handleCreateNewCard = () => {
    if (!deckId) return;
    
    // Create a new card for editing
    const newCard: Flashcard = {
      id: `card_${Date.now()}`,
      front: "",
      back: "",
      deckId: deckId
    };
    
    setSelectedCard(newCard);
    setEditingFront("");
    setEditingBack("");
    setIsEditing(true);
    setActiveTab("front");
    
    // Update URL with new card
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("cardId", newCard.id);
    window.history.replaceState({}, "", newUrl.toString());
  };

  const handleBackToDeck = () => {
    router.push("/decks");
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

  // Handle new deck case or error state
  if (error || !flashcardData) {
    // If it's a new deck (starts with "deck_"), create mock data
    if (deckId && deckId.startsWith("deck_")) {
      const mockDeckData = {
        deck: {
          id: deckId,
          name: "New Deck",
          flashcards: []
        },
        totalCards: 0
      };
      
      return (
        <div className="min-h-screen bg-background">
          {/* Header */}
          <div className="border-b bg-card">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button onClick={handleBackToDeck} variant="outline" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Decks
                  </Button>
                  <div>
                    <h1 className="text-2xl font-bold">{mockDeckData.deck.name}</h1>
                    <p className="text-muted-foreground">{mockDeckData.totalCards} cards</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
              {/* Left Pane - Card List */}
              <div className="lg:col-span-4 xl:col-span-3">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">Cards</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                      <div className="p-4 border-b">
                        <Button 
                          onClick={handleCreateNewCard}
                          className="w-full gap-2"
                          variant="outline"
                        >
                          <Plus className="w-4 h-4" />
                          Create Card
                        </Button>
                      </div>
                      <div className="p-8 text-center text-muted-foreground">
                        <p>No cards yet. Create your first card!</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Pane - Editor */}
              <div className="lg:col-span-8 xl:col-span-9">
                {selectedCard ? (
                  <Card className="h-full">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Create New Card</CardTitle>
                        <div className="flex items-center gap-2">
                          {isEditing ? (
                            <>
                              <Button onClick={handleSaveEdit} size="sm">
                                <Save className="w-4 h-4 mr-2" />
                                Save
                              </Button>
                              <Button onClick={handleCancelEdit} variant="outline" size="sm">
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <Button onClick={handleStartEdit} size="sm">
                              <Edit3 className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {/* Tab Navigation */}
                      <div className="flex border-b">
                        <button
                          className={cn(
                            "px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer",
                            activeTab === "front"
                              ? "border-primary text-primary"
                              : "border-transparent text-muted-foreground hover:text-foreground"
                          )}
                          onClick={() => setActiveTab("front")}
                        >
                          Front
                        </button>
                        <button
                          className={cn(
                            "px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer",
                            activeTab === "back"
                              ? "border-primary text-primary"
                              : "border-transparent text-muted-foreground hover:text-foreground"
                          )}
                          onClick={() => setActiveTab("back")}
                        >
                          Back
                        </button>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="flex-1 p-6">
                      <div className="h-full">
                        {activeTab === "front" ? (
                          <Editor
                            key={`front-${selectedCard.id}-${isEditing}`}
                            content={isEditing ? editingFront : selectedCard.front}
                            editable={isEditing}
                            onUpdate={setEditingFront}
                            className="min-h-[300px] p-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            containerClassName="h-full"
                            menuBarClassName="mb-4"
                          />
                        ) : (
                          <Editor
                            key={`back-${selectedCard.id}-${isEditing}`}
                            content={isEditing ? editingBack : selectedCard.back}
                            editable={isEditing}
                            onUpdate={setEditingBack}
                            className="min-h-[300px] p-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            containerClassName="h-full"
                            menuBarClassName="mb-4"
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="h-full">
                    <CardContent className="flex items-center justify-center h-full">
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                          <Edit3 className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">Create your first card</h3>
                          <p className="text-muted-foreground">
                            Start adding content to your new flashcard deck.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // Regular error state for non-new decks
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={handleBackToDeck} variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Decks
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{flashcardData.deck.name}</h1>
                <p className="text-muted-foreground">{flashcardData.totalCards} cards</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
          {/* Left Pane - Card List */}
          <div className="lg:col-span-4 xl:col-span-3">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">Cards</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                  <div className="p-4 border-b">
                    <Button 
                      onClick={handleCreateNewCard}
                      className="w-full gap-2"
                      variant="outline"
                    >
                      <Plus className="w-4 h-4" />
                      Create Card
                    </Button>
                  </div>
                  {flashcardData.deck.flashcards.map((card, index) => (
                    <div
                      key={card.id}
                      className={cn(
                        "p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors",
                        selectedCard?.id === card.id && "bg-muted border-l-4 border-l-primary"
                      )}
                      onClick={() => handleCardSelect(card)}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">
                            Card {index + 1}
                          </span>
                          {selectedCard?.id === card.id && (
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          )}
                        </div>
                        <div 
                          className="text-sm line-clamp-2"
                          dangerouslySetInnerHTML={{ __html: card.front }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Pane - Editor */}
          <div className="lg:col-span-8 xl:col-span-9">
            {selectedCard ? (
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Edit Card</CardTitle>
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <Button onClick={handleSaveEdit} size="sm">
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                          <Button onClick={handleCancelEdit} variant="outline" size="sm">
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button onClick={handleStartEdit} size="sm">
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Tab Navigation */}
                  <div className="flex border-b">
                    <button
                      className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer",
                        activeTab === "front"
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      )}
                      onClick={() => setActiveTab("front")}
                    >
                      Front
                    </button>
                    <button
                      className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer",
                        activeTab === "back"
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      )}
                      onClick={() => setActiveTab("back")}
                    >
                      Back
                    </button>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 p-6">
                  <div className="h-full">
                    {activeTab === "front" ? (
                      <Editor
                        key={`front-${selectedCard.id}-${isEditing}`}
                        content={isEditing ? editingFront : selectedCard.front}
                        editable={isEditing}
                        onUpdate={setEditingFront}
                        className="min-h-[300px] p-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        containerClassName="h-full"
                        menuBarClassName="mb-4"
                      />
                    ) : (
                      <Editor
                        key={`back-${selectedCard.id}-${isEditing}`}
                        content={isEditing ? editingBack : selectedCard.back}
                        editable={isEditing}
                        onUpdate={setEditingBack}
                        className="min-h-[300px] p-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        containerClassName="h-full"
                        menuBarClassName="mb-4"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full">
                <CardContent className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                      <Edit3 className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Select a card to edit</h3>
                      <p className="text-muted-foreground">
                        Choose a card from the list to start editing its content.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardEditorPage;
