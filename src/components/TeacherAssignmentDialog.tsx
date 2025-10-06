import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { getCurrentUserSchoolId } from '@/utils/auditLogger';

interface TeacherAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: {
    id: string;
    full_name: string | null;
    role: string;
  } | null;
  onAssignmentsUpdated: () => void;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface Class {
  id: string;
  name: string;
}

interface Assignment {
  id: string;
  subject_id: string;
  class_id: string;
  is_active: boolean;
  subjects: {
    name: string;
    code: string;
  };
  classes: {
    name: string;
  };
}

export const TeacherAssignmentDialog: React.FC<TeacherAssignmentDialogProps> = ({
  open,
  onOpenChange,
  teacher,
  onAssignmentsUpdated
}) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [currentAssignments, setCurrentAssignments] = useState<Assignment[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && teacher) {
      fetchData();
    }
  }, [open, teacher]);

  const fetchData = async () => {
    if (!teacher) return;

    setLoading(true);
    try {
      const schoolId = await getCurrentUserSchoolId();
      if (!schoolId) {
        toast({
          title: "Error",
          description: "School ID not found",
          variant: "destructive",
        });
        return;
      }

      // Fetch subjects and classes
      const [subjectsRes, classesRes, assignmentsRes] = await Promise.all([
        supabase.from('subjects').select('id, name, code').eq('school_id', schoolId).order('name'),
        supabase.from('classes').select('id, name').eq('school_id', schoolId).order('name'),
        supabase
          .from('teacher_assignments')
          .select(`
            id,
            subject_id,
            class_id,
            is_active,
            subjects:subject_id (
              name,
              code
            ),
            classes:class_id (
              name
            )
          `)
          .eq('teacher_id', teacher.id)
          .eq('school_id', schoolId)
          .eq('is_active', true)
      ]);

      if (subjectsRes.error) throw subjectsRes.error;
      if (classesRes.error) throw classesRes.error;
      if (assignmentsRes.error) throw assignmentsRes.error;

      setSubjects(subjectsRes.data || []);
      setClasses(classesRes.data || []);
      setCurrentAssignments(assignmentsRes.data || []);

      // Set selected subjects and classes based on current assignments
      const assignedSubjectIds = (assignmentsRes.data || []).map(a => a.subject_id);
      const assignedClassIds = (assignmentsRes.data || []).map(a => a.class_id);
      
      setSelectedSubjects([...new Set(assignedSubjectIds)]);
      setSelectedClasses([...new Set(assignedClassIds)]);

    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!teacher) return;

    setSaving(true);
    try {
      const schoolId = await getCurrentUserSchoolId();
      if (!schoolId) {
        toast({
          title: "Error",
          description: "School ID not found",
          variant: "destructive",
        });
        return;
      }

      // Deactivate all current assignments
      if (currentAssignments.length > 0) {
        const { error: deactivateError } = await supabase
          .from('teacher_assignments')
          .update({ is_active: false })
          .eq('teacher_id', teacher.id)
          .eq('school_id', schoolId);

        if (deactivateError) throw deactivateError;
      }

      // Create new assignments for each subject-class combination
      if (selectedSubjects.length > 0 && selectedClasses.length > 0) {
        const newAssignments = [];
        for (const subjectId of selectedSubjects) {
          for (const classId of selectedClasses) {
            newAssignments.push({
              teacher_id: teacher.id,
              subject_id: subjectId,
              class_id: classId,
              school_id: schoolId,
              assigned_by: (await supabase.auth.getUser()).data.user?.id
            });
          }
        }

        if (newAssignments.length > 0) {
          const { error: insertError } = await supabase
            .from('teacher_assignments')
            .insert(newAssignments);

          if (insertError) throw insertError;
        }
      }

      toast({
        title: "Success",
        description: "Teacher assignments updated successfully",
      });

      onAssignmentsUpdated();
      onOpenChange(false);

    } catch (error: any) {
      console.error('Error saving assignments:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save assignments",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSubjectChange = (subjectId: string, checked: boolean) => {
    if (checked) {
      setSelectedSubjects([...selectedSubjects, subjectId]);
    } else {
      setSelectedSubjects(selectedSubjects.filter(id => id !== subjectId));
    }
  };

  const handleClassChange = (classId: string, checked: boolean) => {
    if (checked) {
      setSelectedClasses([...selectedClasses, classId]);
    } else {
      setSelectedClasses(selectedClasses.filter(id => id !== classId));
    }
  };

  const getAssignmentCount = () => {
    return selectedSubjects.length * selectedClasses.length;
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading teacher assignments...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Teacher Assignments</DialogTitle>
          <DialogDescription>
            Assign subjects and classes to {teacher?.full_name || 'teacher'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Assignments Summary */}
          {currentAssignments.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Current Assignments</h4>
              <div className="text-sm text-blue-700">
                {currentAssignments.map((assignment, index) => (
                  <span key={assignment.id}>
                    {assignment.subjects.name} - {assignment.classes.name}
                    {index < currentAssignments.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Assignment Count */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-1">New Assignment Summary</h4>
            <p className="text-sm text-green-700">
              {selectedSubjects.length} subjects × {selectedClasses.length} classes = {getAssignmentCount()} assignments
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Subjects */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Select Subjects</Label>
              <div className="max-h-60 overflow-y-auto border rounded-md p-3 space-y-2">
                {subjects.map((subject) => (
                  <div key={subject.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`subject-${subject.id}`}
                      checked={selectedSubjects.includes(subject.id)}
                      onCheckedChange={(checked) => handleSubjectChange(subject.id, checked as boolean)}
                    />
                    <Label htmlFor={`subject-${subject.id}`} className="text-sm cursor-pointer">
                      {subject.name} ({subject.code})
                    </Label>
                  </div>
                ))}
              </div>
              {selectedSubjects.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedSubjects.map((subjectId) => {
                    const subject = subjects.find(s => s.id === subjectId);
                    return subject ? (
                      <span
                        key={subjectId}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center"
                      >
                        {subject.name}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-1"
                          onClick={() => handleSubjectChange(subjectId, false)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            {/* Classes */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Select Classes</Label>
              <div className="max-h-60 overflow-y-auto border rounded-md p-3 space-y-2">
                {classes.map((cls) => (
                  <div key={cls.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`class-${cls.id}`}
                      checked={selectedClasses.includes(cls.id)}
                      onCheckedChange={(checked) => handleClassChange(cls.id, checked as boolean)}
                    />
                    <Label htmlFor={`class-${cls.id}`} className="text-sm cursor-pointer">
                      {cls.name}
                    </Label>
                  </div>
                ))}
              </div>
              {selectedClasses.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedClasses.map((classId) => {
                    const cls = classes.find(c => c.id === classId);
                    return cls ? (
                      <span
                        key={classId}
                        className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center"
                      >
                        {cls.name}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-1"
                          onClick={() => handleClassChange(classId, false)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || getAssignmentCount() === 0}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Assignments'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
