
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';
import { UserRole } from '@/types/user';
import { toast } from '@/components/ui/use-toast';
import { rolePermissionMatrix } from '@/types/user';

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
        // Use explicit typing to avoid TypeScript errors
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          setUserRole(null);
        } else if (data) {
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
    
    // Special case for super admin
    if (user?.email === 'deepmindfx01@gmail.com') {
      return true; // Super admin has access to everything
    }
    
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
