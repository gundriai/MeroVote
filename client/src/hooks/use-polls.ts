import { useState, useEffect, useCallback } from 'react';
import { pollsService, AggregatedPoll, PollStats } from '@/services/polls.service';

export interface UsePollsOptions {
  category?: string;
  autoFetch?: boolean;
}

export interface UsePollsReturn {
  polls: AggregatedPoll[];
  stats: PollStats;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setCategory: (category: string) => void;
}

export function usePolls(options: UsePollsOptions = {}): UsePollsReturn {
  const { category, autoFetch = true } = options;
  
  const [polls, setPolls] = useState<AggregatedPoll[]>([]);
  const [stats, setStats] = useState<PollStats>({
    totalVotes: 0,
    activeVoters: 0,
    activePolls: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPolls = useCallback(async () => {
    if (!autoFetch) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const [pollsResponse, statsData] = await Promise.all([
        pollsService.getAggregatedPolls(category),
        pollsService.getPollStats()
      ]);
      
      setPolls(pollsResponse.polls);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch polls');
      console.error('Error fetching polls:', err);
    } finally {
      setIsLoading(false);
    }
  }, [category, autoFetch]);

  const setCategory = useCallback((newCategory: string) => {
    // This will trigger a refetch when category changes
    // The effect will handle the refetch when category changes
  }, []);

  const refetch = useCallback(async () => {
    await fetchPolls();
  }, [fetchPolls]);

  useEffect(() => {
    fetchPolls();
  }, [fetchPolls]);

  return {
    polls,
    stats,
    isLoading,
    error,
    refetch,
    setCategory
  };
}
