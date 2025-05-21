
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';
import { UserRole } from '@/types/user';
import { toast } from '@/components/ui/use-toast';

export function useUserRole() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setUserRole(null);
        setLoading(false);
        return;
      }

      try {
        // We need to use a direct SQL query until the types are updated
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          setUserRole(null);
        } else {
          setUserRole(data.role as UserRole);
        }
      } catch (error: any) {
        console.error('Error in useUserRole hook:', error);
        toast({
          title: "Error fetching role",
          description: error.message || "Could not retrieve your role information",
          variant: "destructive",
        });
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const hasPermission = (feature: string) => {
    if (!userRole) return false;
    
    const permissionEntry = rolePermissionMatrix.find(p => p.name === feature);
    if (!permissionEntry) return false;
    
    switch (userRole) {
      case 'Principal':
        return permissionEntry.principal;
      case 'Exam Officer':
        return permissionEntry.examOfficer;
      case 'Form Teacher':
        return permissionEntry.formTeacher;
      case 'Subject Teacher':
        return permissionEntry.subjectTeacher;
      default:
        return false;
    }
  };

  return { userRole, loading, hasPermission };
}

export const rolePermissionMatrix = [
  { name: "Dashboard", principal: true, examOfficer: true, formTeacher: true, subjectTeacher: true },
  { name: "User Management", principal: true, examOfficer: false, formTeacher: false, subjectTeacher: false },
  { name: "Student Management", principal: true, examOfficer: true, formTeacher: true, subjectTeacher: false },
  { name: "Class/Subject Setup", principal: true, examOfficer: true, formTeacher: false, subjectTeacher: false },
  { name: "Result Upload", principal: false, examOfficer: false, formTeacher: false, subjectTeacher: true },
  { name: "Result Approval", principal: true, examOfficer: true, formTeacher: false, subjectTeacher: false },
  { name: "Position & Ranking", principal: true, examOfficer: true, formTeacher: false, subjectTeacher: false },
  { name: "Report Card Designer", principal: true, examOfficer: true, formTeacher: false, subjectTeacher: false },
  { name: "School Branding", principal: true, examOfficer: false, formTeacher: false, subjectTeacher: false },
  { name: "Scratch Card Generator", principal: true, examOfficer: true, formTeacher: false, subjectTeacher: false },
  { name: "Analytics Dashboard", principal: true, examOfficer: true, formTeacher: false, subjectTeacher: false },
  { name: "Settings", principal: true, examOfficer: false, formTeacher: false, subjectTeacher: false },
];
