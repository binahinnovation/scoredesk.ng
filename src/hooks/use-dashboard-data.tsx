
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardData {
  studentsCount: number;
  usersCount: number;
  subjectsCount: number;
  resultsCount: number; // Approved results
  classesCount: number;
  pendingResultsCount: number;
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>({
    studentsCount: 0,
    usersCount: 0,
    subjectsCount: 0,
    resultsCount: 0,
    classesCount: 0,
    pendingResultsCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch students count
        const { count: studentsCount, error: studentsError } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true });
        if (studentsError) throw studentsError;

        // Fetch users count (excluding Principal, assuming 'profiles' is for general users)
        // If you have a specific way to count "System Users" excluding certain roles, adjust here.
        // For now, it counts all profiles.
        const { count: usersCount, error: usersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        if (usersError) throw usersError;

        // Fetch subjects count
        const { count: subjectsCount, error: subjectsError } = await supabase
          .from('subjects')
          .select('*', { count: 'exact', head: true });
        if (subjectsError) throw subjectsError;

        // Fetch approved results count
        const { count: resultsCount, error: resultsError } = await supabase
          .from('results')
          .select('*', { count: 'exact', head: true })
          .eq('is_approved', true);
        if (resultsError) throw resultsError;

        // Fetch classes count
        const { count: classesCount, error: classesError } = await supabase
          .from('classes')
          .select('*', { count: 'exact', head: true });
        if (classesError) throw classesError;
        
        // Fetch pending results count
        const { count: pendingResultsCount, error: pendingResultsErr } = await supabase
          .from('results')
          .select('*', { count: 'exact', head: true })
          .eq('is_approved', false);
        if (pendingResultsErr) throw pendingResultsErr;

        setData({
          studentsCount: studentsCount || 0,
          usersCount: usersCount || 0,
          subjectsCount: subjectsCount || 0,
          resultsCount: resultsCount || 0,
          classesCount: classesCount || 0,
          pendingResultsCount: pendingResultsCount || 0,
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err : new Error('Unknown error fetching dashboard data'));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return {
    ...data,
    loading,
    error,
  };
}
