import { Loader2, CreditCard } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 sm:py-8 lg:py-12 px-4 sm:px-6 max-w-7xl">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <CreditCard className="h-12 w-12 text-muted-foreground" />
              <Loader2 className="h-6 w-6 animate-spin text-primary absolute -top-1 -right-1" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-1">Loading flashcards...</h3>
              <p className="text-muted-foreground text-sm">Getting your cards ready for study</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
