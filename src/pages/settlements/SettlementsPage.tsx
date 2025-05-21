
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettlementsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settlements</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Settlement History</CardTitle>
          <CardDescription>View all your settlement transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted">
                <tr>
                  <th scope="col" className="px-6 py-3">Reference</th>
                  <th scope="col" className="px-6 py-3">Date</th>
                  <th scope="col" className="px-6 py-3">Amount</th>
                  <th scope="col" className="px-6 py-3">Account</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white border-b">
                  <td className="px-6 py-4">#STL8765</td>
                  <td className="px-6 py-4">05/18/2023</td>
                  <td className="px-6 py-4">₦150,000.00</td>
                  <td className="px-6 py-4">Access Bank - 0123456789</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 rounded-full bg-green-100 text-green-800">Completed</span></td>
                </tr>
                <tr className="bg-white border-b">
                  <td className="px-6 py-4">#STL8764</td>
                  <td className="px-6 py-4">05/11/2023</td>
                  <td className="px-6 py-4">₦80,000.00</td>
                  <td className="px-6 py-4">GTBank - 9876543210</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 rounded-full bg-green-100 text-green-800">Completed</span></td>
                </tr>
                <tr className="bg-white border-b">
                  <td className="px-6 py-4">#STL8763</td>
                  <td className="px-6 py-4">05/04/2023</td>
                  <td className="px-6 py-4">₦100,000.00</td>
                  <td className="px-6 py-4">UBA - 5432109876</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">Processing</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
