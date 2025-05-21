
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useUserRole } from "@/hooks/use-user-role";

export default function ResultEntry() {
  const { userRole, loading, hasPermission } = useUserRole();

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading permission settings...</div>;
  }

  // Only Subject Teachers can access this page
  if (!hasPermission("Result Upload")) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-gray-900">Result Entry</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-10 gap-4">
            <AlertCircle className="h-16 w-16 text-orange-500" />
            <h2 className="text-xl font-semibold">Access Restricted</h2>
            <p className="text-center text-muted-foreground">
              Only Subject Teachers can enter results. 
              Please contact your administrator if you need access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-gray-900">Result Entry</h1>
      <Card>
        <CardHeader>
          <CardTitle>Enter Student Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Here you can enter student results for your assigned subjects and classes.</p>
          <div className="mt-4 text-center text-muted-foreground">
            <p>Full result entry functionality is coming soon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
