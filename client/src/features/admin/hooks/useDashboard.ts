import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export const useDashboardOverview = (timeframe = 'Tháng này') => {
  return useQuery({
    queryKey: ['dashboard', 'overview', timeframe],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/overview?timeframe=' + encodeURIComponent(timeframe));
      return data.data;
    },
    staleTime: STALE_TIME,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};


