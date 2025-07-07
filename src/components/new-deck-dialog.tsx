"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { createDeck } from "@/actions/create-deck";

interface NewDeckDialogProps {
  children?: React.ReactNode;
}

export function NewDeckDialog({ children }: NewDeckDialogProps) {
  const [open, setOpen] = useState(false);
  const [deckName, setDeckName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const handleCreateDeck = async () => {
    if (!deckName.trim()) return;

    setIsCreating(true);
    
    try {
      const result = await createDeck(deckName);
      
      if (result.success && result.deckId) {
        // Close dialog and reset state
        setOpen(false);
        setDeckName("");
        setIsCreating(false);
        
        // Redirect to card editor with the new deck ID
        router.push(`/card-editor?deck=${result.deckId}`);
      } else {
        console.error("Failed to create deck:", result.error);
        alert(result.error || "Failed to create deck");
        setIsCreating(false);
      }
    } catch (error) {
      console.error("Failed to create deck:", error);
      alert("Failed to create deck. Please try again.");
      setIsCreating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && deckName.trim() && !isCreating) {
      handleCreateDeck();
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setDeckName("");
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="gap-2 border-border/50 hover:border-border w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            New Deck
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Deck</DialogTitle>
          <DialogDescription>
            Enter a name for your new flashcard deck. You'll be taken to the card editor to add your first card.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label htmlFor="deck-name" className="text-sm font-medium">
              Deck Name
            </label>
            <Input
              id="deck-name"
              placeholder="Enter deck name..."
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isCreating}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleCreateDeck}
            disabled={!deckName.trim() || isCreating}
          >
            {isCreating ? "Creating..." : "Create Deck"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
