
import { useState, useEffect, useCallback } from 'react';
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
        // Using RPC function to get user role, which is the single source of truth.
        const { data, error } = await supabase
          .rpc('get_user_role', { user_id_param: user.id });

        if (error) {
          throw error;
        }
        
        setUserRole(data as UserRole);

      } catch (error: any) {
        console.error('Error fetching user role:', error);
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

  const hasPermission = useCallback((feature: string) => {
    if (!userRole) return false;
    
    // Super admins have access to everything, overriding the permission matrix.
    // This logic is now consistent with the database functions.
    const superAdminEmails = ['deepmindfx01@gmail.com', 'aleeyuwada01@gmail.com', 'superadmin@scoredesk.com'];
    const isSuperAdminByEmail = user?.email && superAdminEmails.includes(user.email);
    const isSuperAdminByFlag = user?.user_metadata?.is_super_admin === true;

    if (isSuperAdminByEmail || isSuperAdminByFlag) {
      return true;
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
  }, [userRole, user]);

  return { userRole, loading, hasPermission };
}
