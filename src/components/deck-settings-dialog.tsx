"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";
import { updateDeckSettings } from "@/actions/update-deck-settings";

interface DeckSettingsDialogProps {
  deckId: string;
  deckName: string;
  currentNewCardCount: number;
  currentReviewCardCount: number;
}

export function DeckSettingsDialog({
  deckId,
  deckName,
  currentNewCardCount,
  currentReviewCardCount,
}: DeckSettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [newCardCount, setNewCardCount] = useState(currentNewCardCount);
  const [reviewCardCount, setReviewCardCount] = useState(currentReviewCardCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateDeckSettings(deckId, {
        newCardCount,
        reviewCardCount,
      });
      setOpen(false);
      // Refresh the page to show updated settings
      window.location.reload();
    } catch (error) {
      console.error("Failed to update deck settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Deck Settings</DialogTitle>
          <DialogDescription>
            Configure study limits for "{deckName}"
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="newCardCount" className="text-right">
              New Cards
            </Label>
            <Input
              id="newCardCount"
              type="number"
              min="0"
              max="100"
              value={newCardCount}
              onChange={(e) => setNewCardCount(parseInt(e.target.value) || 0)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reviewCardCount" className="text-right">
              Review Cards
            </Label>
            <Input
              id="reviewCardCount"
              type="number"
              min="0"
              max="500"
              value={reviewCardCount}
              onChange={(e) => setReviewCardCount(parseInt(e.target.value) || 0)}
              className="col-span-3"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            <p>• New Cards: Maximum new cards to study per day</p>
            <p>• Review Cards: Maximum review cards to study per day</p>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Settings"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
