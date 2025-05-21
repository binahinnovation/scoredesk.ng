
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

export default function MonnifyStatusPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Monnify Status</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-800">API Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="mr-2 h-3 w-3 rounded-full bg-green-500"></div>
              <p className="font-medium text-green-800">Operational</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Payment Gateway</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="mr-2 h-3 w-3 rounded-full bg-green-500"></div>
              <p className="font-medium text-green-800">Operational</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Transaction Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="mr-2 h-3 w-3 rounded-full bg-green-500"></div>
              <p className="font-medium text-green-800">Operational</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">Webhook Delivery</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="mr-2 h-3 w-3 rounded-full bg-yellow-500"></div>
              <p className="font-medium text-yellow-800">Partial Outage</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>System Status History</CardTitle>
          <CardDescription>Recent status updates and incidents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4">
              <p className="text-sm text-muted-foreground">May 20, 2023 - 14:30</p>
              <p className="font-medium">All systems operational</p>
              <p className="text-sm">All Monnify services are operating normally.</p>
            </div>
            <div className="border-l-4 border-yellow-500 pl-4">
              <p className="text-sm text-muted-foreground">May 19, 2023 - 10:15</p>
              <p className="font-medium">Webhook delivery delays</p>
              <p className="text-sm">We're experiencing delays in webhook delivery. Our team is working on it.</p>
            </div>
            <div className="border-l-4 border-red-500 pl-4">
              <p className="text-sm text-muted-foreground">May 18, 2023 - 08:00</p>
              <p className="font-medium">API downtime resolved</p>
              <p className="text-sm">The earlier reported API downtime has been resolved.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
