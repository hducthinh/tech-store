import { useState, useMemo } from 'react';

export function useSearch(data = [], searchFields = []) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase();
    
    return data.filter(item => {
      return searchFields.some(field => {
        const val = item[field];
        return val && String(val).toLowerCase().includes(query);
      });
    });
  }, [data, searchQuery, searchFields]);

  return { searchQuery, setSearchQuery, filteredData };
}
