import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, Edit, Trash2, Shield } from 'lucide-react';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";
import { RoleLabel } from "@/components/RoleLabel";
import { UserStatusBadge } from "@/components/UserStatusBadge";
import { exportUsersToExcel, exportUsersToPDF } from "@/utils/userExport";

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
  const { data: usersData, loading, error, refetch } = useSupabaseQuery<UserWithRole[]>(
    async () => {
      const { data, error } = await supabase.rpc('get_manageable_users');
      return { data, error: error ? error.message : null };
    },
    []
  );
  const users = usersData || [];
  const [roleTab, setRoleTab] = React.useState(ROLES[0]);
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
    </div>
  );
};

export default ManageUsers;
