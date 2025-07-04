import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function ClassRanking() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-gray-900">Class Ranking</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-10 gap-4">
          <AlertCircle className="h-16 w-16 text-orange-500" />
          <h2 className="text-xl font-semibold">Feature Under Development</h2>
          <p className="text-center text-muted-foreground">
            Class ranking functionality is being developed. 
            This feature will allow you to view student rankings based on their performance.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}