
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Banknote, ArrowRight, Filter, ArrowUpRight } from "lucide-react";

export default function SettlementsPage() {
  // Mock settlement data
  const settlements = [
    { id: "STL-1001", date: "2025-05-21", account: "Access Bank - 0123456789", amount: 125000, status: "completed" },
    { id: "STL-1002", date: "2025-05-18", account: "GTBank - 9876543210", amount: 85000, status: "completed" },
    { id: "STL-1003", date: "2025-05-15", account: "Access Bank - 0123456789", amount: 64500, status: "pending" },
    { id: "STL-1004", date: "2025-05-10", account: "GTBank - 9876543210", amount: 107500, status: "completed" },
    { id: "STL-1005", date: "2025-05-05", account: "Access Bank - 0123456789", amount: 92300, status: "failed" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Settlements</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Banknote className="h-5 w-5 text-emerald-600" />
              Total Settlements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₦ 475,300</div>
            <p className="text-sm text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-emerald-600" />
              Pending Settlements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₦ 64,500</div>
            <p className="text-sm text-muted-foreground mt-1">1 settlement pending</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-emerald-600" />
              Next Settlement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">May 22, 2025</div>
            <p className="text-sm text-muted-foreground mt-1">Estimated date</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Settlement History</CardTitle>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Settlement ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Bank Account</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settlements.map((settlement) => (
                  <TableRow key={settlement.id}>
                    <TableCell className="font-medium">{settlement.id}</TableCell>
                    <TableCell>{settlement.date}</TableCell>
                    <TableCell>{settlement.account}</TableCell>
                    <TableCell className="font-medium">₦ {settlement.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(settlement.status)}`}>
                        {settlement.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">View Details</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
