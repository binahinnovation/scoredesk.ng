
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function WalletPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Wallet</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Available Balance</CardTitle>
            <CardDescription>Your current wallet balance</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₦120,000.00</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Total Income</CardTitle>
            <CardDescription>Past 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₦350,000.00</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Total Withdrawn</CardTitle>
            <CardDescription>Past 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₦230,000.00</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Last 5 wallet transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <p className="font-medium">Deposit</p>
                <p className="text-sm text-muted-foreground">May 20, 2023</p>
              </div>
              <p className="text-green-600">+₦50,000.00</p>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <p className="font-medium">Withdrawal</p>
                <p className="text-sm text-muted-foreground">May 18, 2023</p>
              </div>
              <p className="text-red-600">-₦25,000.00</p>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <p className="font-medium">Deposit</p>
                <p className="text-sm text-muted-foreground">May 15, 2023</p>
              </div>
              <p className="text-green-600">+₦35,000.00</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
