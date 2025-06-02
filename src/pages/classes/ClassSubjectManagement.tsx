
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { Plus, Edit, Trash2, BookOpen, Users } from "lucide-react";
import { useUserRole } from '@/hooks/use-user-role';

interface Class {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

interface Subject {
  id: string;
  name: string;
  code?: string;
  description?: string;
  created_at: string;
}

interface ClassSubject {
  id: string;
  class_id: string;
  subject_id: string;
  classes: { name: string };
  subjects: { name: string; code?: string };
}

export default function ClassSubjectManagement() {
  const [isClassDialogOpen, setIsClassDialogOpen] = useState(false);
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const [classFormData, setClassFormData] = useState({
    name: '',
    description: ''
  });

  const [subjectFormData, setSubjectFormData] = useState({
    name: '',
    code: '',
    description: ''
  });

  const { hasPermission } = useUserRole();
  const queryClient = useQueryClient();

  // Fetch classes
  const { data: classes = [], isLoading: classesLoading } = useQuery({
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

  // Fetch subjects
  const { data: subjects = [], isLoading: subjectsLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Subject[];
    }
  });

  // Fetch class-subject assignments
  const { data: classSubjects = [] } = useQuery({
    queryKey: ['class-subjects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('class_subjects')
        .select(`
          *,
          classes:class_id (name),
          subjects:subject_id (name, code)
        `)
        .order('class_id');

      if (error) throw error;
      return data as ClassSubject[];
    }
  });

  // Class mutations
  const createClassMutation = useMutation({
    mutationFn: async (classData: typeof classFormData) => {
      const { data, error } = await supabase
        .from('classes')
        .insert([classData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast({ title: "Class created successfully" });
      setIsClassDialogOpen(false);
      resetClassForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error creating class",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateClassMutation = useMutation({
    mutationFn: async ({ id, ...classData }: typeof classFormData & { id: string }) => {
      const { data, error } = await supabase
        .from('classes')
        .update(classData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast({ title: "Class updated successfully" });
      setIsClassDialogOpen(false);
      resetClassForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error updating class",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteClassMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast({ title: "Class deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting class",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Subject mutations
  const createSubjectMutation = useMutation({
    mutationFn: async (subjectData: typeof subjectFormData) => {
      const { data, error } = await supabase
        .from('subjects')
        .insert([subjectData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast({ title: "Subject created successfully" });
      setIsSubjectDialogOpen(false);
      resetSubjectForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error creating subject",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateSubjectMutation = useMutation({
    mutationFn: async ({ id, ...subjectData }: typeof subjectFormData & { id: string }) => {
      const { data, error } = await supabase
        .from('subjects')
        .update(subjectData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast({ title: "Subject updated successfully" });
      setIsSubjectDialogOpen(false);
      resetSubjectForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error updating subject",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast({ title: "Subject deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting subject",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Assign subjects to class mutation
  const assignSubjectsMutation = useMutation({
    mutationFn: async ({ classId, subjectIds }: { classId: string; subjectIds: string[] }) => {
      // First, remove existing assignments for this class
      await supabase
        .from('class_subjects')
        .delete()
        .eq('class_id', classId);

      // Then add new assignments
      const assignments = subjectIds.map(subjectId => ({
        class_id: classId,
        subject_id: subjectId
      }));

      const { error } = await supabase
        .from('class_subjects')
        .insert(assignments);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-subjects'] });
      toast({ title: "Subjects assigned successfully" });
      setIsAssignDialogOpen(false);
      setSelectedClass('');
      setSelectedSubjects([]);
    },
    onError: (error: any) => {
      toast({
        title: "Error assigning subjects",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const resetClassForm = () => {
    setClassFormData({ name: '', description: '' });
    setEditingClass(null);
  };

  const resetSubjectForm = () => {
    setSubjectFormData({ name: '', code: '', description: '' });
    setEditingSubject(null);
  };

  const openCreateClassDialog = () => {
    resetClassForm();
    setIsClassDialogOpen(true);
  };

  const openEditClassDialog = (cls: Class) => {
    setEditingClass(cls);
    setClassFormData({
      name: cls.name,
      description: cls.description || ''
    });
    setIsClassDialogOpen(true);
  };

  const openCreateSubjectDialog = () => {
    resetSubjectForm();
    setIsSubjectDialogOpen(true);
  };

  const openEditSubjectDialog = (subject: Subject) => {
    setEditingSubject(subject);
    setSubjectFormData({
      name: subject.name,
      code: subject.code || '',
      description: subject.description || ''
    });
    setIsSubjectDialogOpen(true);
  };

  const openAssignDialog = (classId: string) => {
    setSelectedClass(classId);
    // Get currently assigned subjects for this class
    const currentAssignments = classSubjects
      .filter(cs => cs.class_id === classId)
      .map(cs => cs.subject_id);
    setSelectedSubjects(currentAssignments);
    setIsAssignDialogOpen(true);
  };

  const handleClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClass) {
      updateClassMutation.mutate({ ...classFormData, id: editingClass.id });
    } else {
      createClassMutation.mutate(classFormData);
    }
  };

  const handleSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSubject) {
      updateSubjectMutation.mutate({ ...subjectFormData, id: editingSubject.id });
    } else {
      createSubjectMutation.mutate(subjectFormData);
    }
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    assignSubjectsMutation.mutate({
      classId: selectedClass,
      subjectIds: selectedSubjects
    });
  };

  const handleSubjectToggle = (subjectId: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const canManageClasses = hasPermission('Class/Subject Setup');

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-gray-900">Class & Subject Management</h1>

      <Tabs defaultValue="classes" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="classes">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Classes
                </CardTitle>
                {canManageClasses && (
                  <Dialog open={isClassDialogOpen} onOpenChange={setIsClassDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={openCreateClassDialog}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Class
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingClass ? 'Edit Class' : 'Add New Class'}
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleClassSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="class_name">Class Name *</Label>
                          <Input
                            id="class_name"
                            value={classFormData.name}
                            onChange={(e) => setClassFormData({ ...classFormData, name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="class_description">Description</Label>
                          <Textarea
                            id="class_description"
                            value={classFormData.description}
                            onChange={(e) => setClassFormData({ ...classFormData, description: e.target.value })}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setIsClassDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createClassMutation.isPending || updateClassMutation.isPending}>
                            {editingClass ? 'Update Class' : 'Create Class'}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {classesLoading ? (
                <div className="text-center py-4">Loading classes...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Created</TableHead>
                      {canManageClasses && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classes.map((cls) => (
                      <TableRow key={cls.id}>
                        <TableCell className="font-medium">{cls.name}</TableCell>
                        <TableCell>{cls.description || 'No description'}</TableCell>
                        <TableCell>{new Date(cls.created_at).toLocaleDateString()}</TableCell>
                        {canManageClasses && (
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditClassDialog(cls)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openAssignDialog(cls.id)}
                              >
                                <BookOpen className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this class?')) {
                                    deleteClassMutation.mutate(cls.id);
                                  }
                                }}
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Subjects
                </CardTitle>
                {canManageClasses && (
                  <Dialog open={isSubjectDialogOpen} onOpenChange={setIsSubjectDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={openCreateSubjectDialog}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Subject
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingSubject ? 'Edit Subject' : 'Add New Subject'}
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSubjectSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="subject_name">Subject Name *</Label>
                          <Input
                            id="subject_name"
                            value={subjectFormData.name}
                            onChange={(e) => setSubjectFormData({ ...subjectFormData, name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="subject_code">Subject Code</Label>
                          <Input
                            id="subject_code"
                            value={subjectFormData.code}
                            onChange={(e) => setSubjectFormData({ ...subjectFormData, code: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="subject_description">Description</Label>
                          <Textarea
                            id="subject_description"
                            value={subjectFormData.description}
                            onChange={(e) => setSubjectFormData({ ...subjectFormData, description: e.target.value })}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setIsSubjectDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createSubjectMutation.isPending || updateSubjectMutation.isPending}>
                            {editingSubject ? 'Update Subject' : 'Create Subject'}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {subjectsLoading ? (
                <div className="text-center py-4">Loading subjects...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Created</TableHead>
                      {canManageClasses && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjects.map((subject) => (
                      <TableRow key={subject.id}>
                        <TableCell className="font-medium">{subject.name}</TableCell>
                        <TableCell>
                          {subject.code && <Badge variant="outline">{subject.code}</Badge>}
                        </TableCell>
                        <TableCell>{subject.description || 'No description'}</TableCell>
                        <TableCell>{new Date(subject.created_at).toLocaleDateString()}</TableCell>
                        {canManageClasses && (
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditSubjectDialog(subject)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this subject?')) {
                                    deleteSubjectMutation.mutate(subject.id);
                                  }
                                }}
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle>Class-Subject Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>Assigned Subjects</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.map((cls) => {
                    const assignedSubjects = classSubjects
                      .filter(cs => cs.class_id === cls.id)
                      .map(cs => cs.subjects);

                    return (
                      <TableRow key={cls.id}>
                        <TableCell className="font-medium">{cls.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {assignedSubjects.length > 0 ? (
                              assignedSubjects.map((subject, index) => (
                                <Badge key={index} variant="secondary">
                                  {subject.code ? `${subject.code} - ${subject.name}` : subject.name}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-gray-500">No subjects assigned</span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Assign Subjects Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Subjects to Class</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAssignSubmit} className="space-y-4">
            <div>
              <Label>Select Subjects:</Label>
              <div className="space-y-2 max-h-64 overflow-y-auto border rounded p-2">
                {subjects.map((subject) => (
                  <div key={subject.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={subject.id}
                      checked={selectedSubjects.includes(subject.id)}
                      onCheckedChange={() => handleSubjectToggle(subject.id)}
                    />
                    <Label htmlFor={subject.id} className="flex-1">
                      {subject.code ? `${subject.code} - ${subject.name}` : subject.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={assignSubjectsMutation.isPending}>
                Assign Subjects
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
