
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your account preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="font-medium block mb-1">Account Name</label>
                <input 
                  type="text" 
                  value="John Doe" 
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="font-medium block mb-1">Email Address</label>
                <input 
                  type="email" 
                  value="john.doe@example.com" 
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="font-medium block mb-1">Phone Number</label>
                <input 
                  type="text" 
                  value="+234 123 456 7890" 
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <Button className="w-full">Save Changes</Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Update your security settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="font-medium block mb-1">Current Password</label>
                <input 
                  type="password" 
                  placeholder="Enter current password" 
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="font-medium block mb-1">New Password</label>
                <input 
                  type="password" 
                  placeholder="Enter new password" 
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="font-medium block mb-1">Confirm Password</label>
                <input 
                  type="password" 
                  placeholder="Confirm new password" 
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <Button className="w-full">Update Password</Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Configure your notification preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="font-medium">Email Notifications</label>
                <input type="checkbox" className="toggle toggle-primary" checked />
              </div>
              <div className="flex items-center justify-between">
                <label className="font-medium">SMS Notifications</label>
                <input type="checkbox" className="toggle toggle-primary" />
              </div>
              <div className="flex items-center justify-between">
                <label className="font-medium">Transaction Alerts</label>
                <input type="checkbox" className="toggle toggle-primary" checked />
              </div>
              <div className="flex items-center justify-between">
                <label className="font-medium">Marketing Updates</label>
                <input type="checkbox" className="toggle toggle-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions for your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button variant="destructive" className="w-full">Delete Account</Button>
              <p className="text-sm text-muted-foreground">This will permanently delete all your data and cannot be undone.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
