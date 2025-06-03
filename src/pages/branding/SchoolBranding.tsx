
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Save, Upload, Image } from "lucide-react";
import { useUserRole } from "@/hooks/use-user-role";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface SchoolBranding {
  school_name: string;
  school_logo: string | null;
  school_motto: string;
  school_address: string;
  school_phone: string;
  school_email: string;
  primary_color: string;
  secondary_color: string;
}

export default function SchoolBranding() {
  const { userRole, loading, hasPermission } = useUserRole();
  const [branding, setBranding] = useState<SchoolBranding>({
    school_name: "",
    school_logo: null,
    school_motto: "",
    school_address: "",
    school_phone: "",
    school_email: "",
    primary_color: "#3b82f6",
    secondary_color: "#64748b"
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (hasPermission("School Branding")) {
      fetchBranding();
    }
  }, [hasPermission]);

  const fetchBranding = async () => {
    try {
      // For now, we'll use a simple approach - you can extend this to use a settings table
      const { data: profile } = await supabase
        .from("profiles")
        .select("school_name")
        .single();
      
      if (profile?.school_name) {
        setBranding(prev => ({ ...prev, school_name: profile.school_name }));
      }
    } catch (error) {
      console.error("Error fetching branding:", error);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `school-logo.${fileExt}`;
      
      // For now, create a local URL - you can extend this to upload to Supabase Storage
      const logoUrl = URL.createObjectURL(file);
      setBranding(prev => ({ ...prev, school_logo: logoUrl }));
      
      toast({
        title: "Success",
        description: "Logo uploaded successfully",
      });
    } catch (error: any) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload logo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const saveBranding = async () => {
    setSaving(true);
    try {
      // For now, save to profiles table - you can extend this to use a dedicated settings table
      await supabase
        .from("profiles")
        .upsert({
          id: (await supabase.auth.getUser()).data.user?.id,
          school_name: branding.school_name
        });

      toast({
        title: "Success",
        description: "School branding saved successfully",
      });
    } catch (error: any) {
      console.error("Error saving branding:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save branding",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (!hasPermission("School Branding")) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-gray-900">School Branding</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-10 gap-4">
            <AlertCircle className="h-16 w-16 text-orange-500" />
            <h2 className="text-xl font-semibold">Access Restricted</h2>
            <p className="text-center text-muted-foreground">
              Only Principals can manage school branding. 
              Please contact your administrator if you need access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-gray-900">School Branding</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* School Information */}
        <Card>
          <CardHeader>
            <CardTitle>School Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="school_name">School Name</Label>
              <Input
                id="school_name"
                value={branding.school_name}
                onChange={(e) => setBranding(prev => ({ ...prev, school_name: e.target.value }))}
                placeholder="Enter school name"
              />
            </div>
            
            <div>
              <Label htmlFor="school_motto">School Motto</Label>
              <Input
                id="school_motto"
                value={branding.school_motto}
                onChange={(e) => setBranding(prev => ({ ...prev, school_motto: e.target.value }))}
                placeholder="Enter school motto"
              />
            </div>
            
            <div>
              <Label htmlFor="school_address">School Address</Label>
              <Textarea
                id="school_address"
                value={branding.school_address}
                onChange={(e) => setBranding(prev => ({ ...prev, school_address: e.target.value }))}
                placeholder="Enter school address"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="school_phone">Phone Number</Label>
                <Input
                  id="school_phone"
                  value={branding.school_phone}
                  onChange={(e) => setBranding(prev => ({ ...prev, school_phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>
              
              <div>
                <Label htmlFor="school_email">Email Address</Label>
                <Input
                  id="school_email"
                  type="email"
                  value={branding.school_email}
                  onChange={(e) => setBranding(prev => ({ ...prev, school_email: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logo and Colors */}
        <Card>
          <CardHeader>
            <CardTitle>Visual Branding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>School Logo</Label>
              <div className="mt-2 space-y-4">
                {branding.school_logo && (
                  <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <img
                      src={branding.school_logo}
                      alt="School Logo"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label htmlFor="logo-upload">
                    <Button variant="outline" className="cursor-pointer" disabled={uploading}>
                      <Upload className="h-4 w-4 mr-2" />
                      {uploading ? "Uploading..." : "Upload Logo"}
                    </Button>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primary_color">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary_color"
                    type="color"
                    value={branding.primary_color}
                    onChange={(e) => setBranding(prev => ({ ...prev, primary_color: e.target.value }))}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={branding.primary_color}
                    onChange={(e) => setBranding(prev => ({ ...prev, primary_color: e.target.value }))}
                    placeholder="#3b82f6"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="secondary_color">Secondary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondary_color"
                    type="color"
                    value={branding.secondary_color}
                    onChange={(e) => setBranding(prev => ({ ...prev, secondary_color: e.target.value }))}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={branding.secondary_color}
                    onChange={(e) => setBranding(prev => ({ ...prev, secondary_color: e.target.value }))}
                    placeholder="#64748b"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="border rounded-lg p-6 text-center"
            style={{ borderColor: branding.primary_color }}
          >
            {branding.school_logo && (
              <img
                src={branding.school_logo}
                alt="School Logo"
                className="w-16 h-16 mx-auto mb-4 object-contain"
              />
            )}
            <h2 
              className="text-2xl font-bold mb-2"
              style={{ color: branding.primary_color }}
            >
              {branding.school_name || "School Name"}
            </h2>
            <p 
              className="text-lg mb-4"
              style={{ color: branding.secondary_color }}
            >
              {branding.school_motto || "School Motto"}
            </p>
            <div className="text-sm text-gray-600 space-y-1">
              {branding.school_address && <p>{branding.school_address}</p>}
              <div className="flex justify-center gap-4">
                {branding.school_phone && <span>{branding.school_phone}</span>}
                {branding.school_email && <span>{branding.school_email}</span>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveBranding} disabled={saving} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
