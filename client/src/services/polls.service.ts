import { apiRequest } from '@/lib/queryClient';

// Types matching the backend aggregated polls response
export interface AggregatedComment {
  id: string;
  pollId: string;
  content: string;
  author: string;
  createdAt: string;
  gajjabCount: number;
  bekarCount: number;
  furiousCount: number;
}

export interface AggregatedCandidate {
  id: string;
  pollId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  voteCount: number;
}

export interface AggregatedPoll {
  id: string;
  title: string;
  description: string | null;
  type: 'ONE_VS_ONE' | 'REACTION_BASED';
  category: string[];
  mediaUrl: string | null;
  startDate: string;
  endDate: string;
  isHidden: boolean;
  comments: AggregatedComment[];
  updatedAt: string;
  createdBy: string;
  createdAt: string;
  candidates?: AggregatedCandidate[];
  voteCounts?: { [key: string]: number };
  totalComments: number;
  totalVotes: number;
}

export interface AggregatedPollsResponse {
  polls: AggregatedPoll[];
  totalPolls: number;
  totalVotes: number;
  totalComments: number;
  categories: {
    [key: string]: number;
  };
  types: {
    [key: string]: number;
  };
}

export interface PollStats {
  totalVotes: number;
  activeVoters: number;
  activePolls: number;
}

class PollsService {
  private baseUrl = '/api';

  // Fetch all aggregated polls
  async getAggregatedPolls(category?: string): Promise<AggregatedPollsResponse> {
    try {
      const url = category && category !== 'All' 
        ? `${this.baseUrl}/aggregated-polls/category/${encodeURIComponent(category)}`
        : `${this.baseUrl}/aggregated-polls`;
      
      const response = await apiRequest('GET', url);
      return await response.json();
    } catch (error) {
      console.error('Error fetching aggregated polls:', error);
      throw new Error('Failed to fetch polls');
    }
  }

  // Fetch single aggregated poll
  async getAggregatedPoll(id: string): Promise<AggregatedPoll> {
    try {
      const response = await apiRequest('GET', `${this.baseUrl}/aggregated-polls/${id}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching poll:', error);
      throw new Error('Failed to fetch poll');
    }
  }

  // Get poll statistics
  async getPollStats(): Promise<PollStats> {
    try {
      const response = await apiRequest('GET', `${this.baseUrl}/aggregated-polls`);
      const data = await response.json();
      
      return {
        totalVotes: data.totalVotes || 0,
        activeVoters: Math.floor((data.totalVotes || 0) * 0.4), // Estimate active voters
        activePolls: data.totalPolls || 0
      };
    } catch (error) {
      console.error('Error fetching poll stats:', error);
      // Return fallback stats
      return {
        totalVotes: 0,
        activeVoters: 0,
        activePolls: 0
      };
    }
  }

  // Vote on a poll
  async voteOnPoll(pollId: string, optionId: string): Promise<void> {
    try {
      await apiRequest('POST', `${this.baseUrl}/votes`, {
        pollId,
        optionId,
        userId: 'anonymous' // This should come from auth context
      });
    } catch (error) {
      console.error('Error voting on poll:', error);
      throw new Error('Failed to vote on poll');
    }
  }
}

export const pollsService = new PollsService();
