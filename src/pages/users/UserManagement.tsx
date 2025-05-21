
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Upload, Search, UserPlus, FilePlus, AlertCircle } from "lucide-react";
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

// Mock data for initial rendering
const mockUsers = [
  { id: "1", name: "John Adebayo", role: "Principal" as UserRole, email: "john@example.com", status: "Active" as const },
  { id: "2", name: "Sarah Nwosu", role: "Exam Officer" as UserRole, email: "sarah@example.com", status: "Active" as const },
  { id: "3", name: "Michael Okoro", role: "Form Teacher" as UserRole, email: "michael@example.com", status: "Active" as const },
  { id: "4", name: "Chioma Eze", role: "Subject Teacher" as UserRole, email: "chioma@example.com", status: "Active" as const },
  { id: "5", name: "David Okafor", role: "Subject Teacher" as UserRole, email: "david@example.com", status: "Inactive" as const },
];

// Create user form schema with validation
const createUserSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  role: z.enum(["Principal", "Exam Officer", "Form Teacher", "Subject Teacher"])
});

const UserManagementPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const { userRole, loading, hasPermission } = useUserRole();
  const { user } = useAuth();
  
  // Set up the form
  const form = useForm<z.infer<typeof createUserSchema>>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "Subject Teacher"
    },
  });
  
  // Filter users based on search query
  const filteredUsers = mockUsers.filter((user) => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Create user function
  const handleCreateUser = async (values: z.infer<typeof createUserSchema>) => {
    setIsProcessing(true);
    
    try {
      // In a real implementation, you would create a user through Supabase or a custom API
      // For this demo, we'll just show a success message
      
      toast({
        title: "User created successfully",
        description: `Created user ${values.name} with ${values.role} role`,
      });
      
      form.reset();
      setIsCreateUserDialogOpen(false);
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
      // In a real implementation, you would process the CSV
      // For this demo, we'll just show a success message
      
      toast({
        title: "CSV uploaded",
        description: `Successfully processed ${csvFile.name}`,
      });
      
      setCsvFile(null);
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
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateUser)} className="space-y-4 py-2">
                  <FormField
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                        <Button variant="ghost" size="sm">Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="active" className="m-0">
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
                          <Button variant="ghost" size="sm">Edit</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="inactive" className="m-0">
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
                          <Button variant="ghost" size="sm">Edit</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagementPage;
