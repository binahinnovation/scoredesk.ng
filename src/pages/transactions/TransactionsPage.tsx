
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Transactions</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>View and manage your transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted">
                <tr>
                  <th scope="col" className="px-6 py-3">Transaction ID</th>
                  <th scope="col" className="px-6 py-3">Date</th>
                  <th scope="col" className="px-6 py-3">Type</th>
                  <th scope="col" className="px-6 py-3">Amount</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white border-b">
                  <td className="px-6 py-4">#TRX12345</td>
                  <td className="px-6 py-4">05/21/2023</td>
                  <td className="px-6 py-4">Payment</td>
                  <td className="px-6 py-4">₦45,000.00</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 rounded-full bg-green-100 text-green-800">Completed</span></td>
                </tr>
                <tr className="bg-white border-b">
                  <td className="px-6 py-4">#TRX12344</td>
                  <td className="px-6 py-4">05/20/2023</td>
                  <td className="px-6 py-4">Withdrawal</td>
                  <td className="px-6 py-4">₦25,000.00</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 rounded-full bg-green-100 text-green-800">Completed</span></td>
                </tr>
                <tr className="bg-white border-b">
                  <td className="px-6 py-4">#TRX12343</td>
                  <td className="px-6 py-4">05/19/2023</td>
                  <td className="px-6 py-4">Deposit</td>
                  <td className="px-6 py-4">₦30,000.00</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">Pending</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
