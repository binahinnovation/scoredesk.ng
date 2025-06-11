
import { usePermission } from '@/hooks/use-permission';
import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  permission?: string;
  adminOnly?: boolean;
}

export function ProtectedRoute({ children, permission, adminOnly }: ProtectedRouteProps) {
  const { hasPermission, isAdmin } = usePermission();

  if (adminOnly && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  if (permission && !hasPermission(permission)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
