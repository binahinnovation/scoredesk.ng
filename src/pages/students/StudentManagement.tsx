import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { toast } from "@/components/ui/use-toast";
import { Plus, Edit, Trash2, Search, Download, FileText, RefreshCw } from "lucide-react";
import { useUserRole } from '@/hooks/use-user-role';
import { generateStudentId, validateStudentId } from '@/utils/studentIdGenerator';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  student_id: string;
  class_id?: string;
  date_of_birth?: string;
  gender?: string;
  email?: string;
  phone?: string;
  address?: string;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_email?: string;
  admission_date?: string;
  status: string;
  classes?: { name: string };
}

interface Class {
  id: string;
  name: string;
  description?: string;
}

const ITEMS_PER_PAGE = 10;

export default function StudentManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    student_id: '',
    class_id: '',
    date_of_birth: '',
    gender: '',
    email: '',
    phone: '',
    address: '',
    guardian_name: '',
    guardian_phone: '',
    guardian_email: '',
    status: 'Active'
  });
  const [isGeneratingId, setIsGeneratingId] = useState(false);

  const { hasPermission } = useUserRole();
  const queryClient = useQueryClient();

  // Fetch students with class information
  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          classes:class_id (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Student[];
    }
  });

  // Fetch classes for the select dropdown
  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Class[];
    }
  });

  // Create student mutation
  const createStudentMutation = useMutation({
    mutationFn: async (studentData: typeof formData) => {
      // Auto-generate student ID if not provided
      let finalStudentData = { ...studentData };
      
      if (!studentData.student_id.trim()) {
        try {
          finalStudentData.student_id = await generateStudentId({
            schoolId: studentData.class_id ? undefined : undefined // Will use current user's school
          });
        } catch (error) {
          throw new Error('Failed to generate student ID: ' + (error as Error).message);
        }
      } else {
        // Validate manually entered ID
        const validation = validateStudentId(studentData.student_id);
        if (!validation.isValid) {
          throw new Error(validation.message);
        }
      }

      const { data, error } = await supabase
        .from('students')
        .insert([finalStudentData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({ 
        title: "Student created successfully",
        description: `Student ID: ${data.student_id}`
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error creating student",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update student mutation
  const updateStudentMutation = useMutation({
    mutationFn: async ({ id, ...studentData }: typeof formData & { id: string }) => {
      const { data, error } = await supabase
        .from('students')
        .update(studentData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({ title: "Student updated successfully" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error updating student",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete student mutation
  const deleteStudentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({ title: "Student deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting student",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      middle_name: '',
      student_id: '',
      class_id: '',
      date_of_birth: '',
      gender: '',
      email: '',
      phone: '',
      address: '',
      guardian_name: '',
      guardian_phone: '',
      guardian_email: '',
      status: 'Active'
    });
    setEditingStudent(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      first_name: student.first_name,
      last_name: student.last_name,
      middle_name: student.middle_name || '',
      student_id: student.student_id,
      class_id: student.class_id || '',
      date_of_birth: student.date_of_birth || '',
      gender: student.gender || '',
      email: student.email || '',
      phone: student.phone || '',
      address: student.address || '',
      guardian_name: student.guardian_name || '',
      guardian_phone: student.guardian_phone || '',
      guardian_email: student.guardian_email || '',
      status: student.status
    });
    setIsDialogOpen(true);
  };

  const handleGenerateStudentId = async () => {
    setIsGeneratingId(true);
    try {
      const generatedId = await generateStudentId();
      setFormData({ ...formData, student_id: generatedId });
      toast({
        title: "Student ID Generated",
        description: `Generated ID: ${generatedId}`
      });
    } catch (error) {
      toast({
        title: "Error generating ID",
        description: (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setIsGeneratingId(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate student ID if provided
    if (formData.student_id.trim()) {
      const validation = validateStudentId(formData.student_id);
      if (!validation.isValid) {
        toast({
          title: "Invalid Student ID",
          description: validation.message,
          variant: "destructive"
        });
        return;
      }
    }
    
    if (editingStudent) {
      updateStudentMutation.mutate({ ...formData, id: editingStudent.id });
    } else {
      createStudentMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this student?')) {
      deleteStudentMutation.mutate(id);
    }
  };

  // Filter and paginate students
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClass = selectedClass === 'all' || student.class_id === selectedClass;
    
    return matchesSearch && matchesClass;
  });

  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset to first page when filters change
  const handleFilterChange = (newSearchTerm?: string, newClass?: string) => {
    if (newSearchTerm !== undefined) setSearchTerm(newSearchTerm);
    if (newClass !== undefined) setSelectedClass(newClass);
    setCurrentPage(1);
  };

  // Export functions
  const exportToCSV = () => {
    const selectedClassStudents = selectedClass === 'all' ? filteredStudents : 
      filteredStudents.filter(s => s.class_id === selectedClass);
    
    const headers = ['Student ID', 'Name', 'Class', 'Gender', 'Email', 'Phone', 'Guardian Name', 'Guardian Phone', 'Status'];
    const csvData = [
      headers.join(','),
      ...selectedClassStudents.map(student => [
        student.student_id,
        `"${student.first_name} ${student.middle_name ? student.middle_name + ' ' : ''}${student.last_name}"`,
        `"${student.classes?.name || 'No Class'}"`,
        student.gender || 'N/A',
        student.email || '',
        student.phone || '',
        `"${student.guardian_name || ''}"`,
        student.guardian_phone || '',
        student.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `students_${selectedClass === 'all' ? 'all' : classes.find(c => c.id === selectedClass)?.name || 'class'}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: "CSV exported successfully" });
  };

  const exportToPDF = () => {
    const selectedClassStudents = selectedClass === 'all' ? filteredStudents : 
      filteredStudents.filter(s => s.class_id === selectedClass);
    
    // Create a simple HTML table for PDF printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const className = selectedClass === 'all' ? 'All Classes' : classes.find(c => c.id === selectedClass)?.name || 'Class';
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Student List - ${className}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; text-align: center; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
              tr:nth-child(even) { background-color: #f9f9f9; }
              .no-print { display: none; }
              @media print { .no-print { display: none; } }
            </style>
          </head>
          <body>
            <h1>Student List - ${className}</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <p>Total Students: ${selectedClassStudents.length}</p>
            <table>
              <thead>
                <tr>
                  <th>S/N</th>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Class</th>
                  <th>Gender</th>
                  <th>Phone</th>
                  <th>Guardian Name</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${selectedClassStudents.map((student, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${student.student_id}</td>
                    <td>${student.first_name} ${student.middle_name ? student.middle_name + ' ' : ''}${student.last_name}</td>
                    <td>${student.classes?.name || 'No Class'}</td>
                    <td>${student.gender || 'N/A'}</td>
                    <td>${student.phone || 'N/A'}</td>
                    <td>${student.guardian_name || 'N/A'}</td>
                    <td>${student.status}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
    
    toast({ title: "PDF export initiated" });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Active': return 'default';
      case 'Inactive': return 'secondary';
      case 'Graduated': return 'outline';
      case 'Transferred': return 'destructive';
      default: return 'outline';
    }
  };

  const canManageStudents = hasPermission('Student Management');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
        {canManageStudents && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingStudent ? 'Edit Student' : 'Add New Student'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="middle_name">Middle Name</Label>
                    <Input
                      id="middle_name"
                      value={formData.middle_name}
                      onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="student_id">Student ID</Label>
                    <div className="flex gap-2">
                      <Input
                        id="student_id"
                        value={formData.student_id}
                        onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                        placeholder="Auto-generated if empty"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateStudentId}
                        disabled={isGeneratingId}
                        className="whitespace-nowrap"
                      >
                        {isGeneratingId ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                        Generate
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Leave empty for auto-generation or enter custom ID (format: prefix-12345)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="class_id">Class</Label>
                    <Select value={formData.class_id} onValueChange={(value) => setFormData({ ...formData, class_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Graduated">Graduated</SelectItem>
                        <SelectItem value="Transferred">Transferred</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="guardian_name">Guardian Name</Label>
                    <Input
                      id="guardian_name"
                      value={formData.guardian_name}
                      onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="guardian_phone">Guardian Phone</Label>
                    <Input
                      id="guardian_phone"
                      value={formData.guardian_phone}
                      onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="guardian_email">Guardian Email</Label>
                  <Input
                    id="guardian_email"
                    type="email"
                    value={formData.guardian_email}
                    onChange={(e) => setFormData({ ...formData, guardian_email: e.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createStudentMutation.isPending || updateStudentMutation.isPending}>
                    {editingStudent ? 'Update Student' : 'Create Student'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <CardTitle>Students</CardTitle>
            
            {/* Filters and Export */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
              {/* Search */}
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="w-64"
                />
              </div>
              
              {/* Class Filter */}
              <Select value={selectedClass} onValueChange={(value) => handleFilterChange(undefined, value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Export Buttons */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={exportToCSV}>
                  <Download className="w-4 h-4 mr-2" />
                  Excel
                </Button>
                <Button variant="outline" size="sm" onClick={exportToPDF}>
                  <FileText className="w-4 h-4 mr-2" />
                  PDF
                </Button>
              </div>
            </div>
          </div>
          
          {/* Results summary */}
          <div className="text-sm text-gray-600">
            Showing {paginatedStudents.length} of {filteredStudents.length} students
            {selectedClass !== 'all' && (
              <span> in {classes.find(c => c.id === selectedClass)?.name}</span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading students...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contact</TableHead>
                    {canManageStudents && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.student_id}</TableCell>
                      <TableCell>
                        {`${student.first_name} ${student.middle_name ? student.middle_name + ' ' : ''}${student.last_name}`}
                      </TableCell>
                      <TableCell>{student.classes?.name || 'No Class'}</TableCell>
                      <TableCell>{student.gender || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(student.status)}>
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{student.email || student.phone || 'N/A'}</TableCell>
                      {canManageStudents && (
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(student)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(student.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      {currentPage > 1 && (
                        <PaginationItem>
                          <PaginationPrevious 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(currentPage - 1);
                            }}
                          />
                        </PaginationItem>
                      )}
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            isActive={page === currentPage}
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(page);
                            }}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      {currentPage < totalPages && (
                        <PaginationItem>
                          <PaginationNext 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(currentPage + 1);
                            }}
                          />
                        </PaginationItem>
                      )}
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
