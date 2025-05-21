
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Shield, Upload, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";

const profileFormSchema = z.object({
  fullName: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  schoolName: z.string().min(2, {
    message: "School name must be at least 2 characters.",
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileSettings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: "",
      schoolName: "",
    },
  });

  useEffect(() => {
    if (!user) return;
    
    async function getProfile() {
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          form.reset({
            fullName: data.full_name || "",
            schoolName: data.school_name || "",
          });
          
          if (data.avatar_url) {
            setAvatarUrl(data.avatar_url);
          }
        }
      } catch (error: any) {
        console.error("Error loading profile:", error.message);
        toast({
          variant: "destructive",
          title: "Error loading profile",
          description: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    getProfile();
  }, [user, form]);

  async function onSubmit(data: ProfileFormValues) {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Update profile data
      const updates = {
        id: user.id,
        full_name: data.fullName,
        school_name: data.schoolName,
        updated_at: new Date().toISOString(),
      };
      
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);
      
      if (error) throw error;
      
      // Upload avatar if selected
      if (avatarFile) {
        await uploadAvatar();
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error.message);
      toast({
        variant: "destructive",
        title: "Error updating profile",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    
    const file = event.target.files[0];
    setAvatarFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadAvatar = async () => {
    if (!avatarFile || !user) return;
    
    setUploading(true);
    
    try {
      // Upload file to storage
      const fileExt = avatarFile.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      // Update user profile with avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user.id);
      
      if (updateError) throw updateError;
      
      setAvatarUrl(data.publicUrl);
    } catch (error: any) {
      console.error("Error uploading avatar:", error.message);
      toast({
        variant: "destructive",
        title: "Error uploading avatar",
        description: error.message,
      });
    } finally {
      setUploading(false);
    }
  };

  // Generate initials for avatar fallback
  const getInitials = () => {
    const fullName = form.watch("fullName") || "";
    if (!fullName) return "SC";
    
    return fullName
      .split(" ")
      .map(name => name[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your school profile and settings</p>
        </div>
        <Separator />
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-slide-in">
          <Card className="col-span-1 lg:col-span-1 hover-scale card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                School Logo
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarUrl || ""} alt="School Logo" />
                <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex flex-col items-center gap-2 w-full">
                <label htmlFor="avatar" className="w-full">
                  <Button 
                    variant="outline" 
                    className="w-full cursor-pointer" 
                    type="button"
                    disabled={uploading}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {uploading ? "Uploading..." : "Upload Logo"}
                  </Button>
                  <input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                <p className="text-xs text-muted-foreground text-center">
                  Recommended: Square image, at least 500x500px
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-1 lg:col-span-2 hover-scale card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                School Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>School Admin Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormDescription>
                          This is the name of the school administrator.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="schoolName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>School Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your school name" {...field} />
                        </FormControl>
                        <FormDescription>
                          This is the official name of your school.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving Changes..." : "Save Changes"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
