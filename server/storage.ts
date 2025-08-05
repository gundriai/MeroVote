import { 
  users, polls, candidates, votes, comments, commentReactions,
  type User, type InsertUser, type Poll, type InsertPoll, 
  type Candidate, type InsertCandidate, type Vote, type InsertVote,
  type Comment, type InsertComment, type CommentReaction, type InsertCommentReaction
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, gt } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getPoll(id: string): Promise<Poll | undefined> {
    const [poll] = await db.select().from(polls).where(eq(polls.id, id));
    return poll || undefined;
  }

  async getActivePolls(): Promise<Poll[]> {
    return await db.select().from(polls)
      .where(and(eq(polls.isActive, true), gt(polls.expiresAt, new Date())))
      .orderBy(desc(polls.createdAt));
  }

  async getPollsByType(type: string): Promise<Poll[]> {
    return await db.select().from(polls)
      .where(and(eq(polls.type, type as any), eq(polls.isActive, true)))
      .orderBy(desc(polls.createdAt));
  }

  async createPoll(poll: InsertPoll): Promise<Poll> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + poll.duration);
    
    const [createdPoll] = await db.insert(polls).values({
      ...poll,
      expiresAt,
    }).returning();

    // Create candidates if provided
    if (poll.candidates && poll.candidates.length > 0) {
      await db.insert(candidates).values(
        poll.candidates.map(candidate => ({
          ...candidate,
          pollId: createdPoll.id,
        }))
      );
    }

    return createdPoll;
  }

  async updatePollStatus(id: string, isActive: boolean): Promise<void> {
    await db.update(polls).set({ isActive }).where(eq(polls.id, id));
  }

  async getPollWithCandidates(id: string): Promise<Poll & { candidates: Candidate[] } | undefined> {
    const poll = await this.getPoll(id);
    if (!poll) return undefined;

    const pollCandidates = await this.getCandidatesByPollId(id);
    return { ...poll, candidates: pollCandidates };
  }

  async getCandidatesByPollId(pollId: string): Promise<Candidate[]> {
    return await db.select().from(candidates).where(eq(candidates.pollId, pollId));
  }

  async createCandidate(candidate: InsertCandidate): Promise<Candidate> {
    const [createdCandidate] = await db.insert(candidates).values(candidate).returning();
    return createdCandidate;
  }

  async updateCandidateVoteCount(id: string, count: number): Promise<void> {
    await db.update(candidates).set({ voteCount: count }).where(eq(candidates.id, id));
  }

  async createVote(vote: InsertVote): Promise<Vote> {
    const [createdVote] = await db.insert(votes).values(vote).returning();
    
    // Update candidate vote count if applicable
    if (vote.candidateId) {
      const currentCount = await this.getVoteCountsByCandidate(vote.candidateId);
      await this.updateCandidateVoteCount(vote.candidateId, currentCount + 1);
    }

    return createdVote;
  }

  async hasVoted(pollId: string, fingerprint: string, ipAddress: string): Promise<boolean> {
    const [vote] = await db.select().from(votes)
      .where(and(
        eq(votes.pollId, pollId),
        eq(votes.fingerprint, fingerprint),
        eq(votes.ipAddress, ipAddress)
      ));
    return !!vote;
  }

  async getVoteCountsByPoll(pollId: string): Promise<{ [key: string]: number }> {
    const results = await db.select({
      voteType: votes.voteType,
      count: sql<number>`count(*)::int`,
    })
    .from(votes)
    .where(eq(votes.pollId, pollId))
    .groupBy(votes.voteType);

    const counts: { [key: string]: number } = {};
    results.forEach(result => {
      if (result.voteType) {
        counts[result.voteType] = result.count;
      }
    });
    return counts;
  }

  async getVoteCountsByCandidate(candidateId: string): Promise<number> {
    const [result] = await db.select({
      count: sql<number>`count(*)::int`,
    })
    .from(votes)
    .where(eq(votes.candidateId, candidateId));

    return result?.count || 0;
  }

  async getCommentsByPollId(pollId: string): Promise<Comment[]> {
    return await db.select().from(comments)
      .where(eq(comments.pollId, pollId))
      .orderBy(desc(comments.createdAt));
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [createdComment] = await db.insert(comments).values(comment).returning();
    return createdComment;
  }

  async updateCommentReactionCount(commentId: string, reactionType: string, increment: boolean): Promise<void> {
    const delta = increment ? 1 : -1;
    const column = reactionType === 'gajjab' ? 'gajjab_count' :
                   reactionType === 'bekar' ? 'bekar_count' : 'furious_count';
    
    await db.execute(sql`
      UPDATE ${comments} 
      SET ${sql.identifier(column)} = ${sql.identifier(column)} + ${delta}
      WHERE id = ${commentId}
    `);
  }

  async createCommentReaction(reaction: InsertCommentReaction): Promise<CommentReaction> {
    const [createdReaction] = await db.insert(commentReactions).values(reaction).returning();
    
    // Update comment reaction count
    await this.updateCommentReactionCount(reaction.commentId, reaction.reactionType, true);
    
    return createdReaction;
  }

  async hasReactedToComment(commentId: string, fingerprint: string, reactionType: string): Promise<boolean> {
    const [reaction] = await db.select().from(commentReactions)
      .where(and(
        eq(commentReactions.commentId, commentId),
        eq(commentReactions.fingerprint, fingerprint),
        eq(commentReactions.reactionType, reactionType as any)
      ));
    return !!reaction;
  }

  async getTotalVotes(): Promise<number> {
    const [result] = await db.select({
      count: sql<number>`count(*)::int`,
    }).from(votes);
    return result?.count || 0;
  }

  async getActiveVoters(): Promise<number> {
    const [result] = await db.select({
      count: sql<number>`count(distinct fingerprint)::int`,
    }).from(votes);
    return result?.count || 0;
  }

  async getTotalPolls(): Promise<number> {
    const [result] = await db.select({
      count: sql<number>`count(*)::int`,
    }).from(polls);
    return result?.count || 0;
  }

  async getActivePolls(): Promise<number> {
    const [result] = await db.select({
      count: sql<number>`count(*)::int`,
    }).from(polls).where(and(eq(polls.isActive, true), gt(polls.expiresAt, new Date())));
    return result?.count || 0;
  }

  async getPendingComments(): Promise<number> {
    const [result] = await db.select({
      count: sql<number>`count(*)::int`,
    }).from(comments).where(eq(comments.isModerated, false));
    return result?.count || 0;
  }
}

export const storage = new DatabaseStorage();
