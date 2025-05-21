
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Settings, User, Lock, Bell, Shield } from "lucide-react";

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully."
      });
    }, 1000);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Account</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">API</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Privacy</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Account Settings</CardTitle>
              <CardDescription>Manage your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue="Muhammad Ismail" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" defaultValue="abberhismael@gmail.com" type="email" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" defaultValue="+234 123 4567 890" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" defaultValue="Administrator" readOnly />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <select 
                      id="language" 
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                    >
                      <option value="en">English (US)</option>
                      <option value="fr">French</option>
                      <option value="es">Spanish</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <select
                      id="timezone"
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                    >
                      <option value="GMT+1">Africa/Lagos (GMT+1)</option>
                      <option value="GMT+0">London (GMT+0)</option>
                      <option value="GMT-5">New York (GMT-5)</option>
                      <option value="GMT+8">Singapore (GMT+8)</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Security Settings</CardTitle>
              <CardDescription>Manage your security preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Change Password</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base">Enable Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Switch />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Notification Settings</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Notifications</h3>
                <div className="space-y-3">
                  {[
                    "Transaction alerts",
                    "Settlement notifications",
                    "System updates",
                    "Marketing communications",
                    "Security alerts"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Label htmlFor={`email-${i}`} className="flex-1 cursor-pointer">{item}</Label>
                      <Switch id={`email-${i}`} defaultChecked={i !== 3} />
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">SMS Notifications</h3>
                <div className="space-y-3">
                  {[
                    "Transaction alerts",
                    "Settlement notifications",
                    "Security alerts"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Label htmlFor={`sms-${i}`} className="flex-1 cursor-pointer">{item}</Label>
                      <Switch id={`sms-${i}`} defaultChecked={i === 2} />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">API Settings</CardTitle>
              <CardDescription>Manage your API keys and integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">API Keys</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="api-key">Live API Key</Label>
                    <div className="flex gap-2">
                      <Input id="api-key" value="sk_live_3x4mpl3k3y..." readOnly className="font-mono" />
                      <Button variant="outline">Show</Button>
                      <Button variant="outline">Copy</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="test-api-key">Test API Key</Label>
                    <div className="flex gap-2">
                      <Input id="test-api-key" value="sk_test_3x4mpl3k3y..." readOnly className="font-mono" />
                      <Button variant="outline">Show</Button>
                      <Button variant="outline">Copy</Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Webhooks</h3>
                    <p className="text-sm text-muted-foreground">Configure webhook endpoints to receive event notifications</p>
                  </div>
                  <Button variant="outline">Configure Webhooks</Button>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Privacy Settings</CardTitle>
              <CardDescription>Manage your privacy preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Data Privacy</h3>
                <div className="space-y-3">
                  {[
                    "Allow data collection for service improvements",
                    "Share usage statistics with partners",
                    "Enable personalized recommendations"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Label htmlFor={`privacy-${i}`} className="flex-1 cursor-pointer">{item}</Label>
                      <Switch id={`privacy-${i}`} defaultChecked={i === 0} />
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Account Actions</h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full sm:w-auto">Export My Data</Button>
                  <Button variant="destructive" className="w-full sm:w-auto">Delete My Account</Button>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
