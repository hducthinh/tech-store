import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

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

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/summary');
      return data.data;
    },
    staleTime: STALE_TIME,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useRevenueChart = (timeframe = 'Tháng này') => {
  return useQuery({
    queryKey: ['dashboard', 'revenueChart', timeframe],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/revenue?timeframe=' + encodeURIComponent(timeframe));
      return data.data;
    },
    staleTime: STALE_TIME,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useRevenueByCategory = () => {
  return useQuery({
    queryKey: ['dashboard', 'categoryRevenue'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/category-revenue');
      return data.data;
    },
    staleTime: STALE_TIME,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useRecentOrders = () => {
  return useQuery({
    queryKey: ['dashboard', 'recentOrders'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/recent-orders');
      return data.data;
    },
    staleTime: STALE_TIME,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useTopProducts = () => {
  return useQuery({
    queryKey: ['dashboard', 'topProducts'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/top-products');
      return data.data;
    },
    staleTime: STALE_TIME,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
