import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';

/**
 * Hook to get the current user's school_id
 * This ensures proper data isolation between schools
 */
export function useSchoolId() {
  const { user } = useAuth();
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSchoolId = async () => {
      if (!user) {
        setSchoolId(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get user's profile with school_id
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('school_id, school_name')
          .eq('id', user.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        // If user doesn't have a school_id, they need to be assigned one
        if (!profile?.school_id) {
          console.warn('User does not have a school_id assigned. This should be set during signup or by an admin.');
          setSchoolId(null);
        } else {
          setSchoolId(profile.school_id);
        }
      } catch (err) {
        console.error('Error fetching school_id:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch school ID'));
        setSchoolId(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolId();
  }, [user]);

  return { schoolId, loading, error };
}

/**
 * Utility function to get current user's school_id (non-reactive)
 * Use this for one-time operations, use useSchoolId hook for reactive component needs
 */
export async function getCurrentUserSchoolId(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', user.id)
      .single();

    return profile?.school_id || null;
  } catch (error) {
    console.error('Error getting school_id:', error);
    return null;
  }
}

