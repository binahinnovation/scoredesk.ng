
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
    // Set loading to true at the start of any attempt,
    // unless it's a subsequent automatic retry, in which case it's already true.
    if (attempt === 1) {
        setLoading(true);
    }
    setError(null);
    
    try {
      const result = await queryFn();
      
      if (result.error) {
        // This handles errors returned by the queryFn, not thrown errors
        throw new Error(typeof result.error === 'string' ? result.error : result.error?.message || 'Query function returned an unspecified error');
      }
      
      setData(result.data);
      setLoading(false); // Data successfully set, so loading is false.
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      
      if (attempt < retryCount) {
        console.log(`Query failed (attempt ${attempt}/${retryCount}), retrying in ${retryDelay}ms...`);
        setTimeout(() => executeQuery(attempt + 1), retryDelay);
        // setLoading remains true here, because a retry is pending.
      } else {
        console.error(`Query failed after ${retryCount} attempts:`, errorMessage);
        setError(errorMessage);
        setLoading(false); // All retries exhausted, set loading false.
      }
    }
  };

  useEffect(() => {
    executeQuery();
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps
  // Added eslint-disable-line because executeQuery is stable if queryFn and options are stable.
  // Dependencies array controls re-fetching.

  const refetch = () => {
    // Reset data to null when refetching to avoid showing stale data during load
    // setData(null); // Optional: consider if this UX is desired
    executeQuery(); // This will set loading to true
  }

  return { data, loading, error, refetch };
}

