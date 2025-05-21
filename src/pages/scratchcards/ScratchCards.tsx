
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ScratchCards() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-gray-900">Scratch Cards</h1>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Scratch card functionality will be implemented next.</p>
        </CardContent>
      </Card>
    </div>
  );
}
