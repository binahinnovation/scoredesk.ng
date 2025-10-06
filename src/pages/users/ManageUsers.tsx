import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, Edit, Trash2, Shield, Eye } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";
import { RoleLabel } from "@/components/RoleLabel";
import { UserStatusBadge } from "@/components/UserStatusBadge";
import { exportUsersToExcel, exportUsersToPDF } from "@/utils/userExport";
import { RoleAssignmentDialog } from "@/components/RoleAssignmentDialog";
import { UserEditDialog } from "@/components/UserEditDialog";
import { UserPasswordDialog } from "@/components/UserPasswordDialog";
import { TeacherAssignmentDialog } from "@/components/TeacherAssignmentDialog";
import { useSchoolId } from '@/hooks/use-school-id';

interface UserWithRole {
  id: string;
  user_id: string;
  role: string;
  full_name: string | null;
  school_name: string | null;
}

const ROLES = [
  "Principal",
  "Exam Officer",
  "Form Teacher",
  "Subject Teacher",
  "No Role Assigned",
];

const PAGE_SIZE = 10;

const ManageUsers = () => {
  const { schoolId, loading: schoolIdLoading } = useSchoolId();
  
  const { data: usersData, loading, error, refetch } = useSupabaseQuery<UserWithRole[]>(
    async () => {
      if (!schoolId) {
        return { data: [], error: null };
      }

      try {
        // First, get all profiles from the current school
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, school_name, school_id')
          .eq('school_id', schoolId)
          .order('full_name');

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          return { data: null, error: profilesError.message };
        }

        if (!profiles || profiles.length === 0) {
          return { data: [], error: null };
        }

        // Then get user roles for these profiles
        const userIds = profiles.map(p => p.id);
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id, role, school_id')
          .in('user_id', userIds)
          .eq('school_id', schoolId);

        if (rolesError) {
          console.error('Error fetching user roles:', rolesError);
          return { data: null, error: rolesError.message };
        }

        // Transform data to match expected format
        const transformedData = profiles.map(profile => {
          const userRole = userRoles?.find(role => role.user_id === profile.id);
          return {
            id: profile.id,
            user_id: profile.id,
            role: userRole?.role || 'No Role Assigned',
            full_name: profile.full_name,
            school_name: profile.school_name
          };
        });

        return { data: transformedData, error: null };
      } catch (err) {
        console.error('Error in user query:', err);
        return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
      }
    },
    [schoolId]
  );
  const users = usersData || [];
  const [roleTab, setRoleTab] = React.useState(ROLES[0]);
  const [selectedUser, setSelectedUser] = React.useState<UserWithRole | null>(null);
  const [showRoleDialog, setShowRoleDialog] = React.useState(false);
  const [showEditDialog, setShowEditDialog] = React.useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = React.useState(false);
  const [showAssignmentDialog, setShowAssignmentDialog] = React.useState(false);
  
  const filteredUsers = users.filter(u => u.role === roleTab ||
    (roleTab === "No Role Assigned" && (!ROLES.includes(u.role)))
  );
  // Pagination logic
  const [page, setPage] = React.useState(1);
  const pageCount = Math.ceil(filteredUsers.length / PAGE_SIZE);
  const pagedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  React.useEffect(() => { setPage(1); }, [roleTab]);

  const handleExportExcel = async () => {
    await exportUsersToExcel(filteredUsers, roleTab);
  };
  const handleExportPDF = async () => {
    await exportUsersToPDF(filteredUsers, roleTab);
  };

  const handleAssignRole = (user: UserWithRole) => {
    setSelectedUser(user);
    setShowRoleDialog(true);
  };

  const handleRoleUpdated = () => {
    refetch();
  };

  const handleEditUser = (user: UserWithRole) => {
    setSelectedUser(user);
    setShowEditDialog(true);
  };

  const handleShowPassword = (user: UserWithRole) => {
    setSelectedUser(user);
    setShowPasswordDialog(true);
  };

  const handleManageAssignments = (user: UserWithRole) => {
    setSelectedUser(user);
    setShowAssignmentDialog(true);
  };

  const handleDeleteUser = async (user: UserWithRole) => {
    if (!confirm(`Are you sure you want to delete user "${user.full_name || user.user_id}"? This action cannot be undone.`)) {
      return;
    }

    try {
      // Delete user role first
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.user_id);

      if (roleError) throw roleError;

      // Delete profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.user_id);

      if (profileError) throw profileError;

      // Note: Actual user deletion from auth.users would require admin API
      // For now, we just remove from our tables

      toast({
        title: "Success",
        description: "User deleted successfully",
      });

      refetch();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    }
  };
  
  if (loading || schoolIdLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-2">Loading users...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading users: {error}</p>
          <Button onClick={refetch} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!schoolId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-600 mb-2">No school assigned. Please contact an administrator.</p>
          <Button onClick={refetch} variant="outline">
            Retry
          </Button>
        </div>
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
            All users categorized by role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={roleTab} onValueChange={setRoleTab}>
            <TabsList className="mb-4 flex flex-wrap">
              {ROLES.map(role => (
                <TabsTrigger key={role} value={role}>
                  {role}
                </TabsTrigger>
              ))}
            </TabsList>
            {ROLES.map(role => (
              <TabsContent key={role} value={role}>
                <div className="flex mb-3 gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleExportExcel}
                    disabled={filteredUsers.length === 0}
                  >
                    Export as Excel
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleExportPDF}
                    disabled={filteredUsers.length === 0}
                  >
                    Export as PDF
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>School</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Password</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedUsers.length > 0 ? (
                      pagedUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            {user.full_name || user.user_id || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {user.school_name || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <RoleLabel role={user.role as any} />
                          </TableCell>
                          <TableCell>
                            <UserStatusBadge status="Active" />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleShowPassword(user)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleAssignRole(user)}
                              >
                                <Shield className="h-4 w-4 mr-1" />
                                Role
                              </Button>
                              {user.role === 'Subject Teacher' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleManageAssignments(user)}
                                >
                                  <Users className="h-4 w-4 mr-1" />
                                  Assign
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditUser(user)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteUser(user)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          No users found for {role}.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                {pageCount > 1 && (
                  <Pagination className="mt-4">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setPage(page - 1)}
                          aria-disabled={page === 1}
                          tabIndex={page === 1 ? -1 : 0}
                        />
                      </PaginationItem>
                      {Array.from({ length: pageCount }).map((_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink
                            isActive={page === i + 1}
                            onClick={() => setPage(i + 1)}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setPage(page + 1)}
                          aria-disabled={page === pageCount}
                          tabIndex={page === pageCount ? -1 : 0}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <RoleAssignmentDialog
        open={showRoleDialog}
        onOpenChange={setShowRoleDialog}
        user={selectedUser}
        onRoleUpdated={handleRoleUpdated}
      />

      <UserEditDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        user={selectedUser}
        onUserUpdated={refetch}
      />

      <UserPasswordDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        user={selectedUser}
      />

      <TeacherAssignmentDialog
        open={showAssignmentDialog}
        onOpenChange={setShowAssignmentDialog}
        teacher={selectedUser}
        onAssignmentsUpdated={refetch}
      />
    </div>
  );
};

export default ManageUsers;
