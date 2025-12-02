import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();

  const pollsQuery = useQuery({
    queryKey: ['polls', category],
    queryFn: () => pollsService.getAggregatedPolls(category),
    enabled: autoFetch,
  });

  const statsQuery = useQuery({
    queryKey: ['poll-stats'],
    queryFn: () => pollsService.getPollStats(),
    enabled: autoFetch,
  });

  const refetch = async () => {
    await Promise.all([pollsQuery.refetch(), statsQuery.refetch()]);
  };

  return {
    polls: pollsQuery.data?.polls || [],
    stats: statsQuery.data || { totalVotes: 0, activeVoters: 0, activePolls: 0 },
    isLoading: pollsQuery.isLoading || statsQuery.isLoading,
    error: (pollsQuery.error as Error)?.message || (statsQuery.error as Error)?.message || null,
    refetch,
    setCategory: () => { } // No-op, handled by prop change
  };
}
