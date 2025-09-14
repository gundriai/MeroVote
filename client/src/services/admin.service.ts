import { apiRequest } from '@/lib/queryClient';
import { AggregatedPoll, AggregatedPollsResponse } from './polls.service';

export interface AdminStats {
  totalPolls: number;
  activePolls: number;
  totalComments: number;
  totalVotes: number;
}

export interface PollManagementData {
  polls: AggregatedPoll[];
  stats: AdminStats;
}

class AdminService {
  private baseUrl = '/api';

  // Get all polls for admin management
  async getAllPolls(): Promise<AggregatedPoll[]> {
    try {
      const response = await apiRequest('GET', `${this.baseUrl}/polls`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching all polls:', error);
      throw new Error('Failed to fetch polls');
    }
  }

  // Get aggregated polls with full data
  async getAggregatedPolls(): Promise<AggregatedPollsResponse> {
    try {
      const response = await apiRequest('GET', `${this.baseUrl}/aggregated-polls`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching aggregated polls:', error);
      throw new Error('Failed to fetch aggregated polls');
    }
  }

  // Get admin dashboard data
  async getAdminDashboardData(): Promise<PollManagementData> {
    try {
      const [pollsResponse, aggregatedResponse] = await Promise.all([
        this.getAllPolls(),
        this.getAggregatedPolls()
      ]);

      const stats: AdminStats = {
        totalPolls: pollsResponse.length,
        activePolls: aggregatedResponse.polls.filter(poll => !poll.isHidden).length,
        totalComments: aggregatedResponse.totalComments,
        totalVotes: aggregatedResponse.totalVotes
      };

      return {
        polls: aggregatedResponse.polls,
        stats
      };
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      throw new Error('Failed to fetch admin dashboard data');
    }
  }

  // Update poll visibility
  async togglePollVisibility(pollId: string): Promise<void> {
    try {
      await apiRequest('PATCH', `${this.baseUrl}/polls/${pollId}/toggle-visibility`);
    } catch (error) {
      console.error('Error toggling poll visibility:', error);
      throw new Error('Failed to toggle poll visibility');
    }
  }

  // Delete poll
  async deletePoll(pollId: string): Promise<void> {
    try {
      await apiRequest('DELETE', `${this.baseUrl}/polls/${pollId}`);
    } catch (error) {
      console.error('Error deleting poll:', error);
      throw new Error('Failed to delete poll');
    }
  }

  // Update poll
  async updatePoll(pollId: string, updateData: any): Promise<void> {
    try {
      await apiRequest('PATCH', `${this.baseUrl}/polls/${pollId}`, updateData);
    } catch (error) {
      console.error('Error updating poll:', error);
      throw new Error('Failed to update poll');
    }
  }

  // Get poll by ID
  async getPollById(pollId: string): Promise<AggregatedPoll> {
    try {
      const response = await apiRequest('GET', `${this.baseUrl}/aggregated-polls/${pollId}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching poll by ID:', error);
      throw new Error('Failed to fetch poll');
    }
  }
}

export const adminService = new AdminService();
