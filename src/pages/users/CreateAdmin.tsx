
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, UserPlus, Save } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const CreateAdmin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    schoolName: '',
    role: 'Principal'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create the user account
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            school_name: formData.schoolName,
            is_super_admin: formData.role === 'Principal'
          },
        },
      });

      if (error) {
        toast({
          title: "Error creating admin",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        // Assign role to the user
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: data.user.id,
            role: formData.role
          });

        if (roleError) {
          console.error('Error assigning role:', roleError);
        }
      }

      toast({
        title: "Admin created successfully",
        description: `${formData.fullName} has been created as ${formData.role}`,
      });

      // Reset form
      setFormData({
        email: '',
        password: '',
        fullName: '',
        schoolName: '',
        role: 'Principal'
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create admin account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Shield className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold">Create Admin</h1>
            <p className="text-gray-600">Create new administrator accounts</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserPlus className="h-5 w-5 mr-2" />
              New Administrator
            </CardTitle>
            <CardDescription>
              Create a new administrator account with specified role and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    placeholder="Enter secure password"
                    minLength={8}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 8 characters with uppercase, lowercase, and numbers
                  </p>
                </div>
                <div>
                  <Label htmlFor="schoolName">School/Institution</Label>
                  <Input
                    id="schoolName"
                    type="text"
                    value={formData.schoolName}
                    onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                    required
                    placeholder="Enter school name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="role">Administrative Role</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Principal">Principal (Full Access)</SelectItem>
                    <SelectItem value="Exam Officer">Exam Officer</SelectItem>
                    <SelectItem value="Form Teacher">Form Teacher</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Creating Admin...' : 'Create Administrator'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Default Super Admin</CardTitle>
            <CardDescription>Use these credentials to access the system as super admin</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>Email:</strong> superadmin@scoredesk.com</p>
              <p><strong>Password:</strong> Admin@2024!</p>
              <p className="text-sm text-gray-600 mt-2">
                This account has full system access and can create other administrators.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateAdmin;
