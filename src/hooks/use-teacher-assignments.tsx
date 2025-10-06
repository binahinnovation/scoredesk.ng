import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';
import { useSchoolId } from './use-school-id';

interface TeacherAssignment {
  id: string;
  teacher_id: string;
  subject_id: string;
  class_id: string;
  school_id: string;
  is_active: boolean;
  subjects: {
    id: string;
    name: string;
    code: string;
  };
  classes: {
    id: string;
    name: string;
  };
}

interface TeacherSubjects {
  subject_id: string;
  subject_name: string;
  subject_code: string;
}

interface TeacherClasses {
  class_id: string;
  class_name: string;
}

/**
 * Hook to get teacher assignments for the current user
 * This replaces the old user_metadata.subjects approach
 */
export function useTeacherAssignments() {
  const { user } = useAuth();
  const { schoolId, loading: schoolIdLoading } = useSchoolId();
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [subjects, setSubjects] = useState<TeacherSubjects[]>([]);
  const [classes, setClasses] = useState<TeacherClasses[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fallback function for user metadata when teacher_assignments table doesn't exist
  const fallbackToUserMetadata = async () => {
    try {
      if (!user?.user_metadata?.subjects || !user?.user_metadata?.classes) {
        setAssignments([]);
        setSubjects([]);
        setClasses([]);
        return;
      }

      // Get subjects and classes from metadata
      const subjectNames = Array.isArray(user.user_metadata.subjects) 
        ? user.user_metadata.subjects 
        : [user.user_metadata.subjects];
      
      const classNames = Array.isArray(user.user_metadata.classes) 
        ? user.user_metadata.classes 
        : [user.user_metadata.classes];

      // Fetch subject and class details
      const [subjectsRes, classesRes] = await Promise.all([
        supabase.from('subjects').select('id, name, code').eq('school_id', schoolId).in('name', subjectNames),
        supabase.from('classes').select('id, name').eq('school_id', schoolId).in('name', classNames)
      ]);

      if (subjectsRes.error) throw subjectsRes.error;
      if (classesRes.error) throw classesRes.error;

      const subjectsList = subjectsRes.data || [];
      const classesList = classesRes.data || [];

      setSubjects(subjectsList.map(s => ({
        subject_id: s.id,
        subject_name: s.name,
        subject_code: s.code
      })));

      setClasses(classesList.map(c => ({
        class_id: c.id,
        class_name: c.name
      })));

      setAssignments([]); // No assignments in fallback mode

    } catch (err) {
      console.error('Error in fallback to user metadata:', err);
      throw err;
    }
  };

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!user || !schoolId || schoolIdLoading) {
        setLoading(schoolIdLoading);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch teacher assignments with subject and class details
        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from('teacher_assignments')
          .select(`
            id,
            teacher_id,
            subject_id,
            class_id,
            school_id,
            is_active,
            subjects:subject_id (
              id,
              name,
              code
            ),
            classes:class_id (
              id,
              name
            )
          `)
          .eq('teacher_id', user.id)
          .eq('school_id', schoolId)
          .eq('is_active', true)
          .order('subjects(name)');

        if (assignmentsError) {
          // If table doesn't exist yet (before migration), fall back to user metadata
          console.warn('Teacher assignments table not found, falling back to user metadata:', assignmentsError.message);
          return fallbackToUserMetadata();
        }

        const assignmentsList = assignmentsData || [];
        setAssignments(assignmentsList);

        // Extract unique subjects and classes
        const uniqueSubjects = new Map<string, TeacherSubjects>();
        const uniqueClasses = new Map<string, TeacherClasses>();

        assignmentsList.forEach(assignment => {
          if (assignment.subjects) {
            uniqueSubjects.set(assignment.subjects.id, {
              subject_id: assignment.subjects.id,
              subject_name: assignment.subjects.name,
              subject_code: assignment.subjects.code
            });
          }
          if (assignment.classes) {
            uniqueClasses.set(assignment.classes.id, {
              class_id: assignment.classes.id,
              class_name: assignment.classes.name
            });
          }
        });

        setSubjects(Array.from(uniqueSubjects.values()));
        setClasses(Array.from(uniqueClasses.values()));

      } catch (err) {
        console.error('Error fetching teacher assignments:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch teacher assignments'));
        setAssignments([]);
        setSubjects([]);
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [user, schoolId, schoolIdLoading]);

  /**
   * Check if teacher is assigned to a specific subject-class combination
   */
  const isAssignedToSubjectClass = (subjectId: string, classId: string): boolean => {
    return assignments.some(assignment => 
      assignment.subject_id === subjectId && 
      assignment.class_id === classId &&
      assignment.is_active
    );
  };

  /**
   * Get all classes for a specific subject
   */
  const getClassesForSubject = (subjectId: string): TeacherClasses[] => {
    const classIds = assignments
      .filter(assignment => assignment.subject_id === subjectId && assignment.is_active)
      .map(assignment => assignment.class_id);
    
    return classes.filter(cls => classIds.includes(cls.class_id));
  };

  /**
   * Get all subjects for a specific class
   */
  const getSubjectsForClass = (classId: string): TeacherSubjects[] => {
    const subjectIds = assignments
      .filter(assignment => assignment.class_id === classId && assignment.is_active)
      .map(assignment => assignment.subject_id);
    
    return subjects.filter(subject => subjectIds.includes(subject.subject_id));
  };

  return {
    assignments,
    subjects,
    classes,
    loading,
    error,
    isAssignedToSubjectClass,
    getClassesForSubject,
    getSubjectsForClass
  };
}

/**
 * Hook to get teacher assignments for a specific teacher (admin use)
 */
export function useTeacherAssignmentsForUser(teacherId: string) {
  const { schoolId, loading: schoolIdLoading } = useSchoolId();
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [subjects, setSubjects] = useState<TeacherSubjects[]>([]);
  const [classes, setClasses] = useState<TeacherClasses[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fallback function for user metadata when teacher_assignments table doesn't exist
  const fallbackToUserMetadata = async () => {
    try {
      // Get user metadata from profiles or auth
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', teacherId)
        .single();

      if (!profile) {
        setAssignments([]);
        setSubjects([]);
        setClasses([]);
        return;
      }

      // This is a simplified fallback - in practice, you'd need to store subjects/classes differently
      // For now, return empty arrays to prevent errors
      setAssignments([]);
      setSubjects([]);
      setClasses([]);

    } catch (err) {
      console.error('Error in fallback to user metadata:', err);
      throw err;
    }
  };

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!teacherId || !schoolId || schoolIdLoading) {
        setLoading(schoolIdLoading);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch teacher assignments with subject and class details
        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from('teacher_assignments')
          .select(`
            id,
            teacher_id,
            subject_id,
            class_id,
            school_id,
            is_active,
            subjects:subject_id (
              id,
              name,
              code
            ),
            classes:class_id (
              id,
              name
            )
          `)
          .eq('teacher_id', teacherId)
          .eq('school_id', schoolId)
          .eq('is_active', true)
          .order('subjects(name)');

        if (assignmentsError) {
          // If table doesn't exist yet (before migration), fall back to user metadata
          console.warn('Teacher assignments table not found, falling back to user metadata:', assignmentsError.message);
          return fallbackToUserMetadata();
        }

        const assignmentsList = assignmentsData || [];
        setAssignments(assignmentsList);

        // Extract unique subjects and classes
        const uniqueSubjects = new Map<string, TeacherSubjects>();
        const uniqueClasses = new Map<string, TeacherClasses>();

        assignmentsList.forEach(assignment => {
          if (assignment.subjects) {
            uniqueSubjects.set(assignment.subjects.id, {
              subject_id: assignment.subjects.id,
              subject_name: assignment.subjects.name,
              subject_code: assignment.subjects.code
            });
          }
          if (assignment.classes) {
            uniqueClasses.set(assignment.classes.id, {
              class_id: assignment.classes.id,
              class_name: assignment.classes.name
            });
          }
        });

        setSubjects(Array.from(uniqueSubjects.values()));
        setClasses(Array.from(uniqueClasses.values()));

      } catch (err) {
        console.error('Error fetching teacher assignments:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch teacher assignments'));
        setAssignments([]);
        setSubjects([]);
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [teacherId, schoolId, schoolIdLoading]);

  return {
    assignments,
    subjects,
    classes,
    loading,
    error
  };
}
