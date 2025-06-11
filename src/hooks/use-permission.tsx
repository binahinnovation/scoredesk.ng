
import { useAuth } from './use-auth';
import { UserRole, rolePermissionMatrix } from '@/types/user';

export function usePermission() {
  const { userRole } = useAuth();

  const hasPermission = (feature: string): boolean => {
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

  const isAdmin = (): boolean => {
    return userRole === 'Principal';
  };

  const canAccessUserManagement = (): boolean => {
    return hasPermission('User Management');
  };

  const canUploadResults = (): boolean => {
    return hasPermission('Result Upload');
  };

  const canGenerateScratchCards = (): boolean => {
    return hasPermission('Scratch Card Generator');
  };

  return {
    userRole,
    hasPermission,
    isAdmin,
    canAccessUserManagement,
    canUploadResults,
    canGenerateScratchCards
  };
}
