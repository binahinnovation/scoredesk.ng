import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Upload, Search, UserPlus, FilePlus, AlertCircle, Pencil, UserX } from "lucide-react";
import { RoleLabel } from "@/components/RoleLabel";
import { UserStatusBadge } from "@/components/UserStatusBadge";
import { UserRole, rolePermissionMatrix } from "@/types/user";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useUserRole } from "@/hooks/use-user-role";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Create user form schema with validation
const createUserSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  role: z.enum(["Principal", "Exam Officer", "Form Teacher", "Subject Teacher"])
});

// Update user form schema with validation
const updateUserSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  role: z.enum(["Principal", "Exam Officer", "Form Teacher", "Subject Teacher"]),
  status: z.enum(["Active", "Inactive"])
});

// Type for users from Supabase
type UserData = {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  status: 'Active' | 'Inactive';
  created_at?: string;
};

const UserManagementPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { userRole, loading, hasPermission } = useUserRole();
  const { user } = useAuth();
  
  // Set up the forms
  const createForm = useForm<z.infer<typeof createUserSchema>>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "Subject Teacher"
    },
  });
  
  const editForm = useForm<z.infer<typeof updateUserSchema>>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: "",
      role: "Subject Teacher",
      status: "Active"
    },
  });
  
  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch users from Supabase
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Get users from the profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error fetching users",
          description: error.message,
          variant: "destructive",
        });
        setUsers([]);
      } else if (data) {
        // Fetch user roles for each user
        const usersWithRoles = await Promise.all(
          data.map(async (profile) => {
            // Get user role
            const { data: roleData, error: roleError } = await supabase
              .rpc('get_user_role', { user_id_param: profile.id });
            
            // Get user email and status from auth users
            const userEmail = await getUserEmail(profile.id);
            const isUserActive = await isUserActive(profile.id);
            
            let role: UserRole = roleData as UserRole || 'Subject Teacher';
            
            return {
              id: profile.id,
              name: profile.full_name || 'Unknown',
              role: role,
              email: userEmail || 'unknown@email.com',
              status: isUserActive ? 'Active' : 'Inactive' as 'Active' | 'Inactive',
              created_at: profile.created_at
            };
          })
        );

        setUsers(usersWithRoles);
      }
    } catch (error: any) {
      console.error('Error in fetchUsers:', error);
      toast({
        title: "Error fetching users",
        description: error.message || "Could not fetch users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get user email
  const getUserEmail = async (userId: string): Promise<string | null> => {
    try {
      // We can't directly access auth.users, so we'll use a public function or endpoint
      // This is a simplified approach - in a real application, you'd implement a secure way to get emails
      return null; // Returning null for now since we can't directly access auth.users
    } catch (error) {
      console.error('Error getting user email:', error);
      return null;
    }
  };

  // Helper function to check if user is active
  const isUserActive = async (userId: string): Promise<boolean> => {
    try {
      // We can't directly access auth.users ban status, so we'll assume all users are active for now
      return true;
    } catch (error) {
      console.error('Error checking user status:', error);
      return false;
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter((user) => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Create user function
  const handleCreateUser = async (values: z.infer<typeof createUserSchema>) => {
    setIsProcessing(true);
    
    try {
      // Create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.name
          }
        }
      });

      if (authError) {
        toast({
          title: "User creation failed",
          description: authError.message,
          variant: "destructive",
        });
        return;
      }

      if (!authData.user) {
        toast({
          title: "User creation failed",
          description: "Could not create user",
          variant: "destructive",
        });
        return;
      }

      // Insert the user's role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: values.role
        });

      if (roleError) {
        console.error('Error setting user role:', roleError);
        toast({
          title: "Error setting user role",
          description: roleError.message,
          variant: "destructive",
        });
      }
      
      toast({
        title: "User created successfully",
        description: `Created user ${values.name} with ${values.role} role`,
      });
      
      createForm.reset();
      setIsCreateUserDialogOpen(false);
      
      // Refresh user list
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "User creation failed",
        description: error.message || "Could not create user",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle edit user button click
  const handleEditClick = (userData: UserData) => {
    setSelectedUser(userData);
    editForm.reset({
      name: userData.name,
      role: userData.role,
      status: userData.status
    });
    setIsEditUserDialogOpen(true);
  };

  // Handle update user
  const handleUpdateUser = async (values: z.infer<typeof updateUserSchema>) => {
    if (!selectedUser) return;
    
    setIsProcessing(true);
    try {
      // Update user profile (name)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: values.name })
        .eq('id', selectedUser.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        toast({
          title: "Update failed",
          description: profileError.message,
          variant: "destructive",
        });
        return;
      }

      // Update user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({ 
          user_id: selectedUser.id,
          role: values.role
        }, {
          onConflict: 'user_id'
        });

      if (roleError) {
        console.error('Error updating role:', roleError);
        toast({
          title: "Error updating user role",
          description: roleError.message,
          variant: "destructive",
        });
      }

      // We can't directly update user status in auth.users,
      // but in a real application, you'd implement a secure way to do this
      
      toast({
        title: "User updated",
        description: `User ${values.name} has been updated successfully`,
      });
      
      setIsEditUserDialogOpen(false);
      // Refresh user list
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Could not update user",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle CSV upload
  const handleCsvUpload = async () => {
    if (!csvFile) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to upload",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Parse CSV content
      const fileContent = await csvFile.text();
      const lines = fileContent.split('\n');
      const headers = lines[0].split(',');
      
      // Check if headers are valid
      const expectedHeaders = ['name', 'email', 'password', 'role'];
      if (!expectedHeaders.every(header => headers.includes(header))) {
        throw new Error('Invalid CSV format. Expected headers: name, email, password, role');
      }
      
      // Create users from CSV
      let createdCount = 0;
      const creationPromises = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',');
        const userData = {
          name: values[0].trim(),
          email: values[1].trim(),
          password: values[2].trim(),
          role: values[3].trim() as UserRole
        };
        
        if (!userData.email || !userData.password) continue;
        
        // Add the creation promise to our array
        creationPromises.push(createUserFromCSV(userData));
      }
      
      // Wait for all user creation promises to resolve
      const results = await Promise.allSettled(creationPromises);
      
      // Count successful creations
      createdCount = results.filter(result => result.status === 'fulfilled' && result.value === true).length;
      
      toast({
        title: "CSV processed",
        description: `Successfully created ${createdCount} users out of ${creationPromises.length} entries`,
      });
      
      setCsvFile(null);
      // Refresh user list
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Could not process CSV file",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper function to create a user from CSV
  const createUserFromCSV = async (userData: { name: string, email: string, password: string, role: UserRole }): Promise<boolean> => {
    try {
      // Create the user
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.name
          }
        }
      });
      
      if (error || !data.user) {
        console.error('Error creating user from CSV:', error);
        return false;
      }
      
      // Set user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: data.user.id,
          role: userData.role
        });
      
      if (roleError) {
        console.error('Error setting role for CSV-imported user:', roleError);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Exception creating user from CSV:', error);
      return false;
    }
  };

  // Check if user is a super admin either by email or metadata
  const isSuperAdmin = () => {
    const superAdminEmails = ['deepmindfx01@gmail.com', 'aleeyuwada01@gmail.com'];
    return (
      userRole === 'Principal' || 
      (user?.email && superAdminEmails.includes(user.email)) ||
      user?.user_metadata?.is_super_admin === true
    );
  };

  // Role-based access control
  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading user permissions...</div>;
  }

  if (!isSuperAdmin()) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-10 gap-4">
            <AlertCircle className="h-16 w-16 text-orange-500" />
            <h2 className="text-xl font-semibold">Access Restricted</h2>
            <p className="text-center text-muted-foreground">
              User management is restricted to administrators with Principal role.
              Please contact your school administrator for assistance.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FilePlus className="h-4 w-4 mr-2" />
                Import CSV
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Users</DialogTitle>
                <DialogDescription>
                  Upload a CSV file to bulk import users. The CSV should have columns: name, email, password, role.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Label htmlFor="csv-file">CSV File</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                />
                <div className="text-sm text-muted-foreground">
                  <p>Expected CSV format:</p>
                  <pre className="mt-2 p-2 bg-slate-100 rounded text-xs">
                    name,email,password,role
                    <br />
                    John Doe,john@school.com,securepass,Principal
                    <br />
                    Jane Smith,jane@school.com,password123,Exam Officer
                  </pre>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCsvUpload} disabled={isProcessing}>
                  {isProcessing ? "Processing..." : "Upload CSV"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Create User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Add a new staff member to the system with their role and credentials.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(handleCreateUser)} className="space-y-4 py-2">
                  <FormField
                    control={createForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="staff@school.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Principal">Principal</SelectItem>
                            <SelectItem value="Exam Officer">Exam Officer</SelectItem>
                            <SelectItem value="Form Teacher">Form Teacher</SelectItem>
                            <SelectItem value="Subject Teacher">Subject Teacher</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter className="pt-4">
                    <Button type="submit" disabled={isProcessing}>
                      {isProcessing ? "Creating..." : "Create User"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Edit User Dialog */}
          <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
                <DialogDescription>
                  Update user details and access privileges.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(handleUpdateUser)} className="space-y-4 py-2">
                  <FormField
                    control={editForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Principal">Principal</SelectItem>
                            <SelectItem value="Exam Officer">Exam Officer</SelectItem>
                            <SelectItem value="Form Teacher">Form Teacher</SelectItem>
                            <SelectItem value="Subject Teacher">Subject Teacher</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter className="pt-4">
                    <Button type="submit" disabled={isProcessing}>
                      {isProcessing ? "Updating..." : "Update User"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <AlertCircle className="h-4 w-4 mr-2" />
                Role Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Role Access Preview</DialogTitle>
                <DialogDescription>
                  This table shows which features are accessible to each user role.
                </DialogDescription>
              </DialogHeader>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Feature</TableHead>
                      <TableHead>Principal</TableHead>
                      <TableHead>Exam Officer</TableHead>
                      <TableHead>Form Teacher</TableHead>
                      <TableHead>Subject Teacher</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rolePermissionMatrix.map((permission) => (
                      <TableRow key={permission.name}>
                        <TableCell>{permission.name}</TableCell>
                        <TableCell>
                          {permission.principal ? (
                            <Checkbox checked={true} disabled />
                          ) : null}
                        </TableCell>
                        <TableCell>
                          {permission.examOfficer ? (
                            <Checkbox checked={true} disabled />
                          ) : null}
                        </TableCell>
                        <TableCell>
                          {permission.formTeacher ? (
                            <Checkbox checked={true} disabled />
                          ) : null}
                        </TableCell>
                        <TableCell>
                          {permission.subjectTeacher ? (
                            <Checkbox checked={true} disabled />
                          ) : null}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Staff & Teachers</CardTitle>
          <CardDescription>
            Manage staff accounts and assign roles to control access levels.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="all">All Users</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="inactive">Inactive</TabsTrigger>
              </TabsList>
              
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search users..."
                  className="w-[250px] pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <TabsContent value="all" className="m-0">
              {isLoading ? (
                <div className="py-8 text-center">Loading users...</div>
              ) : filteredUsers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell><RoleLabel role={user.role} /></TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <UserStatusBadge status={user.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEditClick(user)}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No users found. Create your first user to get started.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="active" className="m-0">
              {isLoading ? (
                <div className="py-8 text-center">Loading users...</div>
              ) : filteredUsers.filter(user => user.status === 'Active').length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers
                      .filter(user => user.status === 'Active')
                      .map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell><RoleLabel role={user.role} /></TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <UserStatusBadge status={user.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEditClick(user)}
                            >
                              <Pencil className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No active users found.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="inactive" className="m-0">
              {isLoading ? (
                <div className="py-8 text-center">Loading users...</div>
              ) : filteredUsers.filter(user => user.status === 'Inactive').length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers
                      .filter(user => user.status === 'Inactive')
                      .map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell><RoleLabel role={user.role} /></TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <UserStatusBadge status={user.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEditClick(user)}
                            >
                              <Pencil className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No inactive users found.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagementPage;
