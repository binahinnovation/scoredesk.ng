
import { useCallback } from 'react';
import { useAuth } from './use-auth';
import { rolePermissionMatrix } from '@/types/user';

export function useUserRole() {
  const { userRole, loading, isSuperAdmin } = useAuth();

  const hasPermission = useCallback((feature: string) => {
    // Super admins have access to everything, overriding the permission matrix.
    if (isSuperAdmin) {
      return true;
    }
    
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
  }, [userRole, isSuperAdmin]);

  return { userRole, loading, hasPermission };
}
