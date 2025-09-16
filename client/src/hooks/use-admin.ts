import { useState, useEffect, useCallback } from 'react';
import { adminService, PollManagementData, AdminStats } from '@/services/admin.service';
import { AggregatedPoll } from '@/services/polls.service';

export interface UseAdminOptions {
  autoFetch?: boolean;
}

export interface UseAdminReturn {
  data: PollManagementData | null;
  stats: AdminStats | null;
  polls: AggregatedPoll[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  togglePollVisibility: (pollId: string) => Promise<void>;
  deletePoll: (pollId: string) => Promise<void>;
  updatePoll: (pollId: string, updateData: any) => Promise<void>;
}

export function useAdmin(options: UseAdminOptions = {}): UseAdminReturn {
  const { autoFetch = true } = options;
  
  const [data, setData] = useState<PollManagementData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!autoFetch) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const adminData = await adminService.getAdminDashboardData();
      setData(adminData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch admin data');
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [autoFetch]);

  const togglePollVisibility = useCallback(async (pollId: string) => {
    try {
      await adminService.togglePollVisibility(pollId);
      // Refetch data to get updated poll visibility
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle poll visibility');
      throw err;
    }
  }, [fetchData]);

  const deletePoll = useCallback(async (pollId: string) => {
    try {
      await adminService.deletePoll(pollId);
      // Refetch data to get updated poll list
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete poll');
      throw err;
    }
  }, [fetchData]);

  const updatePoll = useCallback(async (pollId: string, updateData: any) => {
    try {
      await adminService.updatePoll(pollId, updateData);
      // Refetch data to get updated poll
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update poll');
      throw err;
    }
  }, [fetchData]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    stats: data?.stats || null,
    polls: data?.polls || [],
    isLoading,
    error,
    refetch,
    togglePollVisibility,
    deletePoll,
    updatePoll,
  };
}
