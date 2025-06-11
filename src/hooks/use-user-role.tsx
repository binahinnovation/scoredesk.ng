
// This hook is deprecated and conflicts with use-auth.tsx
// All user role functionality has been moved to use-auth.tsx
// This file is kept for compatibility but should not be used

import { useAuth } from './use-auth';

export function useUserRole() {
  const { userRole, loading } = useAuth();
  
  return { 
    userRole, 
    loading, 
    hasPermission: () => false // Deprecated
  };
}
