
// This hook is deprecated and conflicts with use-auth.tsx
// All user role functionality has been moved to use-auth.tsx and use-permission.tsx
// This file is kept for compatibility but should not be used

import { usePermission } from './use-permission';

export function useUserRole() {
  const { userRole, hasPermission } = usePermission();
  
  return { 
    userRole, 
    loading: false,
    hasPermission
  };
}
