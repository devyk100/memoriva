"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const CardPage = () => {
  const searchParams = useSearchParams();
  const cardId = searchParams.get("id");
  const [showBack, setShowBack] = useState(false);

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 overflow-y-hidden">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold">Card Viewer</h1>
        <p className="text-gray-500">Card ID: {cardId || "N/A"}</p>
      </div>
      <Card className="relative mb-6 w-full max-w-xl mx-auto h-[70vh] flex flex-col">
        <CardHeader className="shrink-0">
          <CardTitle>{showBack ? "Back Side" : "Front Side"}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-y-auto grow">
            {!showBack ? (
              <>
                <p className="mb-4">
                  What is the capital of France? Here's a bit more context to simulate a longer front side. 
                  France is a country in Western Europe known for its medieval cities, alpine villages, and Mediterranean beaches. 
                  Its capital, Paris, is famed for its fashion houses, classical art museums including the Louvre, and monuments like the Eiffel Tower.
                </p>
                <div className="w-full aspect-video relative mb-4">
                  <Image
                    src="/globe.svg"
                    alt="Globe"
                    fill
                    className="object-contain rounded-md border"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 px-4 pt-6 pb-4 bg-gradient-to-t from-background via-background/80 to-transparent flex justify-center">
                  <Button onClick={() => setShowBack(true)}>Show Answer</Button>
                </div>
              </>
            ) : (
              <>
                <p className="mb-4">
                  The capital of France is Paris. Paris is not only the capital but also the most populous city of France. 
                  It has been a major center of finance, diplomacy, commerce, fashion, science, and the arts since the 17th century. 
                  The city is known for its café culture, and landmarks like the Notre-Dame cathedral and the Arc de Triomphe.
                </p>
                <div className="w-full aspect-video relative mb-4">
                  <Image
                    src="/window.svg"
                    alt="Window"
                    fill
                    className="object-contain rounded-md border"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 px-4 pt-6 pb-4 bg-gradient-to-t from-background via-background/80 to-transparent flex justify-center gap-4">
                  <Button className="bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700">Again</Button>
                  <Button className="bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700">Hard</Button>
                  <Button className="bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700">Easy</Button>
                </div>
              </>
            )}
          </CardContent>
      </Card>
    </div>
  );
};


export default CardPage;
