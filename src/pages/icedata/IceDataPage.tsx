
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function IceDataPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Ice Data Services</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Data Bundles</CardTitle>
            <CardDescription>Available for purchase</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="font-medium">1GB Data Bundle</p>
                <p className="text-primary font-bold">₦300</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="font-medium">2GB Data Bundle</p>
                <p className="text-primary font-bold">₦600</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="font-medium">5GB Data Bundle</p>
                <p className="text-primary font-bold">₦1,500</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="font-medium">10GB Data Bundle</p>
                <p className="text-primary font-bold">₦3,000</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Purchases</CardTitle>
            <CardDescription>Last 5 data purchases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">5GB Data Bundle</p>
                  <p className="text-sm text-muted-foreground">May 20, 2023</p>
                </div>
                <p className="text-green-600">Delivered</p>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">2GB Data Bundle</p>
                  <p className="text-sm text-muted-foreground">May 18, 2023</p>
                </div>
                <p className="text-green-600">Delivered</p>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">10GB Data Bundle</p>
                  <p className="text-sm text-muted-foreground">May 15, 2023</p>
                </div>
                <p className="text-green-600">Delivered</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Service Status</CardTitle>
            <CardDescription>Current ice data service status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-4">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-800 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="font-bold text-xl">All Systems Operational</p>
                <p className="text-muted-foreground text-sm mt-1">Last checked: 5 minutes ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
