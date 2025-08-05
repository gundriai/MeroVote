import { browserFingerprint } from './fingerprint';

export interface VoteTrackingData {
  fingerprint: string;
  pollId: string;
  timestamp: number;
}

class VoteTracker {
  private readonly STORAGE_KEY = 'merovote_votes';

  private getStoredVotes(): VoteTrackingData[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  private storeVote(vote: VoteTrackingData): void {
    try {
      const votes = this.getStoredVotes();
      votes.push(vote);
      
      // Keep only last 100 votes to prevent storage bloat
      if (votes.length > 100) {
        votes.splice(0, votes.length - 100);
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(votes));
    } catch (e) {
      console.warn('Failed to store vote locally:', e);
    }
  }

  hasVotedLocally(pollId: string): boolean {
    const votes = this.getStoredVotes();
    const fingerprint = browserFingerprint.generateFingerprint().fingerprint;
    
    return votes.some(vote => 
      vote.pollId === pollId && 
      vote.fingerprint === fingerprint
    );
  }

  recordVote(pollId: string): void {
    const fingerprint = browserFingerprint.generateFingerprint().fingerprint;
    
    this.storeVote({
      fingerprint,
      pollId,
      timestamp: Date.now()
    });
  }

  getFingerprint(): string {
    return browserFingerprint.generateFingerprint().fingerprint;
  }

  clearOldVotes(olderThanDays: number = 30): void {
    try {
      const votes = this.getStoredVotes();
      const cutoff = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
      
      const recentVotes = votes.filter(vote => vote.timestamp > cutoff);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(recentVotes));
    } catch (e) {
      console.warn('Failed to clear old votes:', e);
    }
  }
}

export const voteTracker = new VoteTracker();
