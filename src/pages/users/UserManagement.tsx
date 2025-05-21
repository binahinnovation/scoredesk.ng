
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

// Mock data for initial rendering
const mockUsers = [
  { id: "1", name: "John Adebayo", role: "Principal" as UserRole, email: "john@example.com", status: "Active" as const },
  { id: "2", name: "Sarah Nwosu", role: "Exam Officer" as UserRole, email: "sarah@example.com", status: "Active" as const },
  { id: "3", name: "Michael Okoro", role: "Form Teacher" as UserRole, email: "michael@example.com", status: "Active" as const },
  { id: "4", name: "Chioma Eze", role: "Subject Teacher" as UserRole, email: "chioma@example.com", status: "Active" as const },
  { id: "5", name: "David Okafor", role: "Subject Teacher" as UserRole, email: "david@example.com", status: "Inactive" as const },
];

const UserManagementPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("Subject Teacher");
  const [isProcessing, setIsProcessing] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const { userRole, loading } = useUserRole();
  const { user } = useAuth();
  
  // Filter users based on search query
  const filteredUsers = mockUsers.filter((user) => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Invite user function
  const handleInviteUser = async () => {
    if (!inviteEmail) {
      toast({
        title: "Email required",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // In a real implementation, you would send an invite email through Supabase or a custom API
      // For this demo, we'll just show a success message
      
      toast({
        title: "Invitation sent",
        description: `Invitation email sent to ${inviteEmail} with ${selectedRole} role`,
      });
      
      setInviteEmail("");
      setSelectedRole("Subject Teacher");
      setIsInviteDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Invitation failed",
        description: error.message || "Could not send invitation",
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

  // Role-based access control
  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading user permissions...</div>;
  }

  if (userRole !== "Principal") {
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
                  Upload a CSV file to bulk import users. The CSV should have columns: name, email, role.
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
                    name,email,role
                    <br />
                    John Doe,john@school.com,Principal
                    <br />
                    Jane Smith,jane@school.com,Exam Officer
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

          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Invite User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite New User</DialogTitle>
                <DialogDescription>
                  Send an invitation email to add a new staff member to the system.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="col-span-3"
                    placeholder="staff@school.com"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Role
                  </Label>
                  <Select
                    value={selectedRole}
                    onValueChange={(value) => setSelectedRole(value as UserRole)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Principal">Principal</SelectItem>
                      <SelectItem value="Exam Officer">Exam Officer</SelectItem>
                      <SelectItem value="Form Teacher">Form Teacher</SelectItem>
                      <SelectItem value="Subject Teacher">Subject Teacher</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleInviteUser} disabled={isProcessing}>
                  {isProcessing ? "Sending..." : "Send Invitation"}
                </Button>
              </DialogFooter>
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
