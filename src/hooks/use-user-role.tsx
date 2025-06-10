
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
        // Using RPC function to get user role
        const { data, error } = await supabase
          .rpc('get_user_role', { user_id_param: user.id });

        if (error) {
          console.error('Error fetching user role:', error);
          setUserRole(null);
        } else if (data) {
          setUserRole(data as UserRole);
        }
      } catch (error: any) {
        console.error('Error in useUserRole hook:', error);
        toast({
          title: "Error fetching role",
          description: "Could not retrieve your role information. Please contact support.",
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
