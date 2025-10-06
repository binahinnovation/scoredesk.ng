
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Save, User, Mail, School, Calendar, Settings, Shield, Palette, Database, FileText, Clock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  full_name: string;
  school_name: string;
  avatar_url: string | null;
  email: string;
  created_at: string;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>({
    full_name: "",
    school_name: "",
    avatar_url: null,
    email: "",
    created_at: ""
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user?.id) return;
    
    try {
      // Get profile data
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      // Get user auth data
      const { data: { user: authUser } } = await supabase.auth.getUser();

      setProfile({
        full_name: profileData?.full_name || "",
        school_name: profileData?.school_name || "",
        avatar_url: profileData?.avatar_url || null,
        email: authUser?.email || "",
        created_at: authUser?.created_at || ""
      });
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: profile.full_name,
          school_name: profile.school_name,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!user?.email) return;
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password reset email sent to your email address",
      });
    } catch (error: any) {
      console.error("Error sending reset email:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={profile.full_name}
                onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                value={profile.email}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Email cannot be changed. Contact administrator if needed.
              </p>
            </div>
            
            <div>
              <Label htmlFor="school_name">School Name</Label>
              <Input
                id="school_name"
                value={profile.school_name}
                onChange={(e) => setProfile(prev => ({ ...prev, school_name: e.target.value }))}
                placeholder="Enter your school name"
              />
            </div>

            <Button onClick={saveProfile} disabled={saving} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Email Address</p>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                </div>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Account Created</p>
                  <p className="text-sm text-muted-foreground">
                    {profile.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    }) : "N/A"}
                  </p>
                </div>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">School</p>
                  <p className="text-sm text-muted-foreground">
                    {profile.school_name || "Not specified"}
                  </p>
                </div>
                <School className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Categories */}
      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-24 space-y-2"
              onClick={() => navigate('/settings/terms')}
            >
              <Clock className="h-6 w-6" />
              <span>Term Management</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-24 space-y-2"
              onClick={() => navigate('/branding')}
            >
              <Palette className="h-6 w-6" />
              <span>School Branding</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-24 space-y-2"
              onClick={() => navigate('/users')}
            >
              <Shield className="h-6 w-6" />
              <span>User Permissions</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-24 space-y-2"
            >
              <Database className="h-6 w-6" />
              <span>Data Backup</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-24 space-y-2"
              onClick={() => navigate('/reportcards')}
            >
              <FileText className="h-6 w-6" />
              <span>Report Templates</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-24 space-y-2"
            >
              <Settings className="h-6 w-6" />
              <span>Email Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Password</p>
              <p className="text-sm text-muted-foreground">
                Change your account password
              </p>
            </div>
            <Button variant="outline" onClick={changePassword}>
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">User ID</p>
              <p className="text-muted-foreground font-mono">{user?.id}</p>
            </div>
            <div>
              <p className="font-medium">Last Sign In</p>
              <p className="text-muted-foreground">
                {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "N/A"}
              </p>
            </div>
            <div>
              <p className="font-medium">Email Confirmed</p>
              <p className="text-muted-foreground">
                {user?.email_confirmed_at ? "Yes" : "No"}
              </p>
            </div>
            <div>
              <p className="font-medium">Account Provider</p>
              <p className="text-muted-foreground">
                {user?.app_metadata?.provider || "Email"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
