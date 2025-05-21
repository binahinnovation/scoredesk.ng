
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";

export default function WalletPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Wallet</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-cyan-700 to-emerald-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-6 w-6" />
              Available Balance
            </CardTitle>
            <CardDescription className="text-white/70">Current wallet balance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">₦ 250,000.00</div>
            <p className="text-white/70 mt-2">Last updated: Today, 2:30 PM</p>
          </CardContent>
        </Card>
        
        <div className="flex flex-col justify-between gap-4">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-lg">
            <ArrowDownToLine className="mr-2 h-5 w-5" />
            Fund Wallet
          </Button>
          <Button variant="outline" className="py-6 text-lg border-2">
            <ArrowUpFromLine className="mr-2 h-5 w-5" />
            Withdraw Funds
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="transactions" className="flex-1">Recent Transactions</TabsTrigger>
          <TabsTrigger value="funding" className="flex-1">Funding History</TabsTrigger>
          <TabsTrigger value="withdrawals" className="flex-1">Withdrawals</TabsTrigger>
        </TabsList>
        <TabsContent value="transactions" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex justify-between items-center border-b pb-4">
                    <div>
                      <h3 className="font-medium">Payment #{100000 + i}</h3>
                      <p className="text-sm text-muted-foreground">May 21, 2025 • 10:3{i} AM</p>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold ${i % 2 === 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {i % 2 === 0 ? '+' : '-'} ₦{(1500 * i).toLocaleString()}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {i % 2 === 0 ? 'Credit' : 'Debit'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="funding">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center py-8 text-muted-foreground">No recent funding history</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="withdrawals">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center py-8 text-muted-foreground">No withdrawal history</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
