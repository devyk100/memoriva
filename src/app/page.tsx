import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Welcome!</CardTitle>
          <CardDescription>This is a demo page showcasing Shadcn UI components.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button>Click me</Button>
          <Button>Click me</Button>
        </CardContent>
      </Card>
    </div>
  );
}
