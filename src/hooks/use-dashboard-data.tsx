
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardData {
  studentsCount: number;
  usersCount: number;
  subjectsCount: number;
  resultsCount: number;
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>({
    studentsCount: 0,
    usersCount: 0,
    subjectsCount: 0,
    resultsCount: 0,
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

        // Fetch users count
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

        setData({
          studentsCount: studentsCount || 0,
          usersCount: usersCount || 0,
          subjectsCount: subjectsCount || 0,
          resultsCount: resultsCount || 0,
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
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
