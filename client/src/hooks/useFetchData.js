import { useState, useEffect, useCallback } from 'react';
import { useAsync } from './useAsync';

export function useFetchData(fetcher, initialData = []) {
  const [data, setData] = useState(initialData);
  const { execute, loading, error } = useAsync(fetcher);
  
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const refetch = useCallback(async (...args) => {
    try {
      const result = await execute(...args);
      setData(result);
      return result;
    } catch (err) {
      console.error(err);
    } finally {
      setIsInitialLoad(false);
    }
  }, [execute]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, setData, loading: loading || isInitialLoad, error, refetch };
}
