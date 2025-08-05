import { 
  type User, type InsertUser, type Poll, type InsertPoll, 
  type Candidate, type InsertCandidate, type Vote, type InsertVote,
  type Comment, type InsertComment, type CommentReaction, type InsertCommentReaction
} from "@shared/schema";
import mockData from "./mock-data.json";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Poll methods
  getPoll(id: string): Promise<Poll | undefined>;
  getActivePolls(): Promise<Poll[]>;
  getPollsByType(type: string): Promise<Poll[]>;
  createPoll(poll: InsertPoll): Promise<Poll>;
  updatePollStatus(id: string, isActive: boolean): Promise<void>;
  getPollWithCandidates(id: string): Promise<Poll & { candidates: Candidate[] } | undefined>;

  // Candidate methods
  getCandidatesByPollId(pollId: string): Promise<Candidate[]>;
  createCandidate(candidate: InsertCandidate): Promise<Candidate>;
  updateCandidateVoteCount(id: string, count: number): Promise<void>;

  // Vote methods
  createVote(vote: InsertVote): Promise<Vote>;
  hasVoted(pollId: string, fingerprint: string, ipAddress: string): Promise<boolean>;
  getVoteCountsByPoll(pollId: string): Promise<{ [key: string]: number }>;
  getVoteCountsByCandidate(candidateId: string): Promise<number>;

  // Comment methods
  getCommentsByPollId(pollId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateCommentReactionCount(commentId: string, reactionType: string, increment: boolean): Promise<void>;
  
  // Comment reaction methods
  createCommentReaction(reaction: InsertCommentReaction): Promise<CommentReaction>;
  hasReactedToComment(commentId: string, fingerprint: string, reactionType: string): Promise<boolean>;

  // Analytics methods
  getTotalVotes(): Promise<number>;
  getActiveVoters(): Promise<number>;
  getTotalPolls(): Promise<number>;
  getActivePolls(): Promise<number>;
  getPendingComments(): Promise<number>;
}

export class MemoryStorage implements IStorage {
  private polls: Poll[] = mockData.polls.map(poll => ({
    ...poll,
    createdAt: new Date(poll.createdAt),
    expiresAt: new Date(poll.expiresAt),
    type: poll.type as "daily_rating" | "political_rating" | "comparison_voting"
  }));
  private candidates: Candidate[] = mockData.candidates as Candidate[];
  private votes: { [pollId: string]: { [voteType: string]: number } } = mockData.votes;
  private comments: Comment[] = mockData.comments.map(comment => ({
    ...comment,
    createdAt: new Date(comment.createdAt)
  }));
  private analytics = mockData.analytics;
  private userVotes: Set<string> = new Set();
  private commentReactions: Set<string> = new Set();

  async getUser(id: string): Promise<User | undefined> {
    // Simplified for mock - return admin user
    return { 
      id: 'admin', 
      username: 'admin', 
      password: 'admin', 
      isAdmin: true, 
      createdAt: new Date() 
    };
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (username === 'admin') {
      return { 
        id: 'admin', 
        username: 'admin', 
        password: 'admin', 
        isAdmin: true, 
        createdAt: new Date() 
      };
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    return { 
      id: 'new-user', 
      username: insertUser.username, 
      password: insertUser.password, 
      isAdmin: insertUser.isAdmin || false, 
      createdAt: new Date() 
    };
  }

  async getPoll(id: string): Promise<Poll | undefined> {
    return this.polls.find(poll => poll.id === id);
  }

  async getActivePolls(): Promise<Poll[]> {
    return this.polls.filter(poll => poll.isActive && new Date(poll.expiresAt) > new Date());
  }

  async getPollsByType(type: string): Promise<Poll[]> {
    return this.polls.filter(poll => poll.type === type && poll.isActive);
  }

  async createPoll(poll: InsertPoll): Promise<Poll> {
    const newId = (this.polls.length + 1).toString();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + poll.duration);
    
    const newPoll: Poll = {
      id: newId,
      title: poll.title,
      description: poll.description || null,
      type: poll.type as any,
      mediaUrl: poll.mediaUrl || null,
      duration: poll.duration,
      isActive: true,
      createdAt: new Date(),
      expiresAt,
      createdBy: poll.createdBy,
    };

    this.polls.push(newPoll);

    // Create candidates if provided
    if (poll.candidates && poll.candidates.length > 0) {
      poll.candidates.forEach(candidate => {
        const newCandidate: Candidate = {
          id: (this.candidates.length + 1).toString(),
          pollId: newId,
          name: candidate.name,
          description: candidate.description || null,
          imageUrl: candidate.imageUrl || null,
          voteCount: 0,
        };
        this.candidates.push(newCandidate);
      });
    }

    return newPoll;
  }

  async updatePollStatus(id: string, isActive: boolean): Promise<void> {
    const poll = this.polls.find(p => p.id === id);
    if (poll) {
      poll.isActive = isActive;
    }
  }

  async getPollWithCandidates(id: string): Promise<Poll & { candidates: Candidate[] } | undefined> {
    const poll = await this.getPoll(id);
    if (!poll) return undefined;

    const pollCandidates = await this.getCandidatesByPollId(id);
    return { ...poll, candidates: pollCandidates };
  }

  async getCandidatesByPollId(pollId: string): Promise<Candidate[]> {
    return this.candidates.filter(candidate => candidate.pollId === pollId) || [];
  }

  async createCandidate(candidate: InsertCandidate): Promise<Candidate> {
    const newCandidate: Candidate = {
      id: (this.candidates.length + 1).toString(),
      pollId: candidate.pollId,
      name: candidate.name,
      description: candidate.description || null,
      imageUrl: candidate.imageUrl || null,
      voteCount: 0,
    };
    this.candidates.push(newCandidate);
    return newCandidate;
  }

  async updateCandidateVoteCount(id: string, count: number): Promise<void> {
    const candidate = this.candidates.find(c => c.id === id);
    if (candidate) {
      candidate.voteCount = count;
    }
  }

  async createVote(vote: InsertVote): Promise<Vote> {
    const voteKey = `${vote.pollId}-${vote.fingerprint}-${vote.ipAddress}`;
    this.userVotes.add(voteKey);

    // Update vote counts
    if (vote.voteType) {
      if (!this.votes[vote.pollId]) {
        this.votes[vote.pollId] = {};
      }
      this.votes[vote.pollId][vote.voteType] = (this.votes[vote.pollId][vote.voteType] || 0) + 1;
    }

    // Update candidate vote count if applicable
    if (vote.candidateId) {
      const candidate = this.candidates.find(c => c.id === vote.candidateId);
      if (candidate) {
        candidate.voteCount += 1;
      }
    }

    return {
      id: 'vote-' + Date.now(),
      pollId: vote.pollId,
      candidateId: vote.candidateId,
      voteType: vote.voteType as any,
      fingerprint: vote.fingerprint,
      ipAddress: vote.ipAddress,
      userAgent: vote.userAgent,
      createdAt: new Date(),
    };
  }

  async hasVoted(pollId: string, fingerprint: string, ipAddress: string): Promise<boolean> {
    const voteKey = `${pollId}-${fingerprint}-${ipAddress}`;
    return this.userVotes.has(voteKey);
  }

  async getVoteCountsByPoll(pollId: string): Promise<{ [key: string]: number }> {
    return this.votes[pollId] || {};
  }

  async getVoteCountsByCandidate(candidateId: string): Promise<number> {
    const candidate = this.candidates.find(c => c.id === candidateId);
    return candidate?.voteCount || 0;
  }

  async getCommentsByPollId(pollId: string): Promise<Comment[]> {
    return this.comments.filter(comment => comment.pollId === pollId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const newComment: Comment = {
      id: (this.comments.length + 1).toString(),
      pollId: comment.pollId,
      content: comment.content,
      author: comment.author,
      fingerprint: comment.fingerprint,
      ipAddress: comment.ipAddress,
      gajjabCount: 0,
      bekarCount: 0,
      furiousCount: 0,
      isModerated: false,
      createdAt: new Date(),
    };
    this.comments.push(newComment);
    return newComment;
  }

  async updateCommentReactionCount(commentId: string, reactionType: string, increment: boolean): Promise<void> {
    const comment = this.comments.find(c => c.id === commentId);
    if (comment) {
      const delta = increment ? 1 : -1;
      if (reactionType === 'gajjab') {
        comment.gajjabCount += delta;
      } else if (reactionType === 'bekar') {
        comment.bekarCount += delta;
      } else if (reactionType === 'furious') {
        comment.furiousCount += delta;
      }
    }
  }

  async createCommentReaction(reaction: InsertCommentReaction): Promise<CommentReaction> {
    const reactionKey = `${reaction.commentId}-${reaction.fingerprint}-${reaction.reactionType}`;
    this.commentReactions.add(reactionKey);
    
    // Update comment reaction count
    await this.updateCommentReactionCount(reaction.commentId, reaction.reactionType, true);
    
    return {
      id: 'reaction-' + Date.now(),
      commentId: reaction.commentId,
      reactionType: reaction.reactionType as any,
      fingerprint: reaction.fingerprint,
      ipAddress: reaction.ipAddress,
      createdAt: new Date(),
    };
  }

  async hasReactedToComment(commentId: string, fingerprint: string, reactionType: string): Promise<boolean> {
    const reactionKey = `${commentId}-${fingerprint}-${reactionType}`;
    return this.commentReactions.has(reactionKey);
  }

  async getTotalVotes(): Promise<number> {
    return this.analytics.totalVotes;
  }

  async getActiveVoters(): Promise<number> {
    return this.analytics.activeVoters;
  }

  async getTotalPolls(): Promise<number> {
    return this.analytics.totalPolls;
  }

  async getActivePolls(): Promise<number> {
    return this.analytics.activePolls;
  }

  async getPendingComments(): Promise<number> {
    return this.analytics.pendingComments;
  }
}

export const storage = new MemoryStorage();
