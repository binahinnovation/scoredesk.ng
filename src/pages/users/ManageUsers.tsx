
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, Edit, Trash2, Shield } from 'lucide-react';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface UserRoleWithProfile {
  id: string;
  user_id: string;
  role: string;
  full_name?: string;
  school_name?: string;
}

const ManageUsers = () => {
  const { data: usersData, loading, error, refetch } = useSupabaseQuery<UserRoleWithProfile[]>(
    async () => {
      // First get user roles
      const { data: userRoles, error: userRolesError } = await supabase
        .from('user_roles')
        .select('id, user_id, role');

      if (userRolesError) {
        throw userRolesError;
      }

      // Then get profiles for each user
      const userIds = userRoles?.map(ur => ur.user_id) || [];
      
      if (userIds.length === 0) {
        return { data: [], error: null };
      }

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, school_name')
        .in('id', userIds);

      if (profilesError) {
        throw profilesError;
      }

      // Combine the data
      const combinedData = userRoles?.map(userRole => {
        const profile = profiles?.find(p => p.id === userRole.user_id);
        return {
          ...userRole,
          full_name: profile?.full_name,
          school_name: profile?.school_name
        };
      }) || [];

      return { data: combinedData, error: null };
    },
    []
  );

  const users = usersData || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-2">Loading users...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold">Manage Users</h1>
              <p className="text-gray-600">View and manage user accounts and permissions</p>
            </div>
          </div>
          <Button onClick={refetch} variant="outline">
            Retry
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p>Error loading users: {error}</p>
              <Button onClick={refetch} className="mt-4">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Users className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold">Manage Users</h1>
            <p className="text-gray-600">View and manage user accounts and permissions</p>
          </div>
        </div>
        <Button onClick={refetch} variant="outline">
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Accounts</CardTitle>
          <CardDescription>
            All users with their roles and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>School</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      {user.full_name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {user.school_name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">Active</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Shield className="h-4 w-4 mr-1" />
                          Permissions
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No users found. Create some user accounts to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageUsers;
