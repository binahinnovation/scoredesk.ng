
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

export type SchoolData = {
  schoolName: string;
  fullName: string;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
