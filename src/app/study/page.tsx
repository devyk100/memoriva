"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Play, Clock, BookOpen } from "lucide-react";

interface Deck {
  id: string;
  name: string;
  totalCards: number;
}

interface StudySession {
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

interface CreateStudySessionData {
  deckId: string;
  prompt: string;
  maxCards: number;
}

import { getDecksForStudy, getStudySessions, createStudySession as createStudySessionAction } from "@/actions/study-sessions";

// API functions
const fetchDecks = async (): Promise<Deck[]> => {
  const result = await getDecksForStudy();
  if (!result.success) {
    throw new Error(result.error || "Failed to fetch decks");
  }
  return result.decks || [];
};

const fetchStudySessions = async (): Promise<StudySession[]> => {
  const result = await getStudySessions();
  if (!result.success) {
    throw new Error(result.error || "Failed to fetch study sessions");
  }
  return result.sessions || [];
};

const createStudySession = async (data: CreateStudySessionData): Promise<StudySession> => {
  const result = await createStudySessionAction(data);
  if (!result.success) {
    throw new Error(result.error || "Failed to create study session");
  }
  return result.session!;
};

const StudyPage = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedDeckId, setSelectedDeckId] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [maxCards, setMaxCards] = useState(20);

  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: decks = [], isLoading: decksLoading } = useQuery({
    queryKey: ["decks"],
    queryFn: fetchDecks,
  });

  const { data: studySessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["studySessions"],
    queryFn: fetchStudySessions,
    refetchInterval: 5000, // Refetch every 5 seconds to check for status updates
  });

  const createSessionMutation = useMutation({
    mutationFn: createStudySession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studySessions"] });
      setIsCreateDialogOpen(false);
      setSelectedDeckId("");
      setPrompt("");
      setMaxCards(20);
    },
  });

  const handleCreateSession = () => {
    if (!selectedDeckId || !prompt.trim()) return;

    createSessionMutation.mutate({
      deckId: selectedDeckId,
      prompt: prompt.trim(),
      maxCards,
    });
  };

  const getStatusColor = (status: StudySession["status"]) => {
    switch (status) {
      case "READY":
        return "text-green-600";
      case "PROCESSING":
        return "text-yellow-600";
      case "FAILED":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: StudySession["status"]) => {
    switch (status) {
      case "READY":
        return <Play className="h-4 w-4" />;
      case "PROCESSING":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "FAILED":
        return <span className="h-4 w-4">❌</span>;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Study Sessions</h1>
          <p className="text-muted-foreground mt-2">
            Create AI-powered study sessions with RAG-based card selection
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Study Session
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Study Session</DialogTitle>
              <DialogDescription>
                Configure your AI-powered study session with custom prompts and card limits.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="deck">Select Deck</Label>
                <Select value={selectedDeckId} onValueChange={setSelectedDeckId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a deck" />
                  </SelectTrigger>
                  <SelectContent>
                    {decks.map((deck) => (
                      <SelectItem key={deck.id} value={deck.id}>
                        {deck.name} ({deck.totalCards} cards)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="prompt">Study Prompt</Label>
                <Input
                  id="prompt"
                  placeholder="e.g., help me study graphs and trees, focus on my weak cards"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="maxCards">Max Cards</Label>
                <Input
                  id="maxCards"
                  type="number"
                  min="1"
                  max="100"
                  value={maxCards}
                  onChange={(e) => setMaxCards(parseInt(e.target.value) || 20)}
                />
              </div>

              <Button 
                onClick={handleCreateSession}
                disabled={!selectedDeckId || !prompt.trim() || createSessionMutation.isPending}
                className="w-full"
              >
                {createSessionMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating Session...
                  </>
                ) : (
                  "Create Study Session"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {sessionsLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4">
          {studySessions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Study Sessions</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first AI-powered study session to get started.
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Study Session
                </Button>
              </CardContent>
            </Card>
          ) : (
            studySessions.map((session) => (
              <Card key={session.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {session.deckName}
                        <span className={`flex items-center gap-1 text-sm ${getStatusColor(session.status)}`}>
                          {getStatusIcon(session.status)}
                          {session.status}
                        </span>
                      </CardTitle>
                      <CardDescription>
                        "{session.prompt}"
                      </CardDescription>
                    </div>
                    
                    {session.status === "READY" && (
                      <Button size="sm" onClick={() => router.push(`/study/${session.id}`)}>
                        <Play className="h-4 w-4 mr-2" />
                        Start Study
                      </Button>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <div className="flex gap-4">
                      <span>Max Cards: {session.maxCards}</span>
                      {session.cardCount && (
                        <span>Generated: {session.cardCount} cards</span>
                      )}
                    </div>
                    <span>
                      Created: {new Date(session.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {session.status === "PROCESSING" && (
                    <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        🤖 AI is analyzing your deck and creating a personalized study session...
                        This may take a few moments.
                      </p>
                    </div>
                  )}
                  
                  {session.status === "FAILED" && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <p className="text-sm text-red-800 dark:text-red-200">
                        ❌ Failed to create study session. Please try again.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default StudyPage;
