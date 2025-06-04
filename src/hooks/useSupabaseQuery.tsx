
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseSupabaseQueryOptions {
  retryCount?: number;
  retryDelay?: number;
}

export function useSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  dependencies: any[] = [],
  options: UseSupabaseQueryOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { retryCount = 3, retryDelay = 1000 } = options;

  const executeQuery = async (attempt = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await queryFn();
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      setData(result.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      
      if (attempt < retryCount) {
        console.log(`Query failed (attempt ${attempt}/${retryCount}), retrying in ${retryDelay}ms...`);
        setTimeout(() => executeQuery(attempt + 1), retryDelay);
      } else {
        setError(errorMessage);
      }
    } finally {
      if (attempt >= retryCount) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    executeQuery();
  }, dependencies);

  const refetch = () => executeQuery();

  return { data, loading, error, refetch };
}
