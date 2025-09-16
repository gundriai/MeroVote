import { apiRequest } from '@/lib/queryClient';
import { getUserId, getUserName, isAuthenticated } from '@/lib/auth';

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

export interface AggregatedPollOption {
  id: string;
  pollId: string;
  label: string | null;
  icon: string | null;
  color: string | null;
  candidateId: string | null;
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
  pollOptions?: AggregatedPollOption[];
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
      // Check if user is authenticated
      if (!isAuthenticated()) {
        throw new Error('User must be logged in to vote');
      }

      const userId = getUserId();
      if (!userId) {
        throw new Error('User ID not found');
      }

      await apiRequest('POST', `${this.baseUrl}/votes`, {
        pollId,
        optionId,
        userId
      });
    } catch (error) {
      console.error('Error voting on poll:', error);
      // Preserve the original error message from the API response
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to vote on poll');
    }
  }

  // Add comment to a poll
  async addComment(pollId: string, content: string, author?: string): Promise<void> {
    try {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        throw new Error('User must be logged in to comment');
      }

      // Use authenticated user's name if author not provided
      const commentAuthor = author || getUserName() || 'Anonymous';
      
      // Get current poll
      const poll = await this.getAggregatedPoll(pollId);
      
      // Add new comment to existing comments
      const newComment = {
        id: `comment_${Date.now()}`,
        pollId,
        content,
        author: commentAuthor,
        createdAt: new Date().toISOString(),
        gajjabCount: 0,
        bekarCount: 0,
        furiousCount: 0
      };

      const updatedComments = [...(poll.comments || []), newComment];

      // Update poll with new comment
      await apiRequest('PATCH', `${this.baseUrl}/polls/${pollId}`, {
        comments: updatedComments
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      throw new Error('Failed to add comment');
    }
  }

  // Add reaction to a comment
  async addCommentReaction(pollId: string, commentId: string, reactionType: 'gajjab' | 'bekar' | 'furious'): Promise<void> {
    try {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        throw new Error('User must be logged in to react to comments');
      }

      // Get current poll
      const poll = await this.getAggregatedPoll(pollId);
      
      // Find and update the specific comment
      const updatedComments = poll.comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            [`${reactionType}Count`]: (comment[`${reactionType}Count`] || 0) + 1
          };
        }
        return comment;
      });

      // Update poll with updated comments
      await apiRequest('PATCH', `${this.baseUrl}/polls/${pollId}`, {
        comments: updatedComments
      });
    } catch (error) {
      console.error('Error adding comment reaction:', error);
      throw new Error('Failed to add comment reaction');
    }
  }
}

export const pollsService = new PollsService();
