
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Search, Filter } from "lucide-react";

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock transaction data
  const transactions = [
    { id: "TXN-1001", date: "2025-05-21", customer: "John Doe", amount: 15000, status: "completed", type: "payment" },
    { id: "TXN-1002", date: "2025-05-20", customer: "Jane Smith", amount: 8500, status: "completed", type: "payment" },
    { id: "TXN-1003", date: "2025-05-19", customer: "Robert Brown", amount: 22500, status: "pending", type: "refund" },
    { id: "TXN-1004", date: "2025-05-18", customer: "Susan Wilson", amount: 12000, status: "completed", type: "payment" },
    { id: "TXN-1005", date: "2025-05-17", customer: "David Lee", amount: 7500, status: "failed", type: "payment" },
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl">Transaction Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-100 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Transactions</p>
              <h3 className="text-2xl font-bold">1,250</h3>
              <p className="text-xs text-green-600">+12% from last month</p>
            </div>
            <div className="p-4 bg-slate-100 rounded-lg">
              <p className="text-sm text-muted-foreground">Transaction Volume</p>
              <h3 className="text-2xl font-bold">₦ 5,250,000</h3>
              <p className="text-xs text-green-600">+8% from last month</p>
            </div>
            <div className="p-4 bg-slate-100 rounded-lg">
              <p className="text-sm text-muted-foreground">Avg. Transaction Value</p>
              <h3 className="text-2xl font-bold">₦ 4,200</h3>
              <p className="text-xs text-red-600">-3% from last month</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-xl">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center my-4">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Select defaultValue="all">
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">Filter</Button>
            </div>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.id}</TableCell>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>{transaction.customer}</TableCell>
                    <TableCell>₦ {transaction.amount.toLocaleString()}</TableCell>
                    <TableCell className="capitalize">{transaction.type}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">Showing 5 of 25 results</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
