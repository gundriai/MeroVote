import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const pollTypeEnum = pgEnum("poll_type", ["daily_rating", "political_rating", "comparison_voting"]);
export const voteTypeEnum = pgEnum("vote_type", ["gajjab", "bekar", "furious", "excellent", "good", "average", "poor"]);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const polls = pgTable("polls", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  type: pollTypeEnum("type").notNull(),
  mediaUrl: text("media_url"),
  duration: integer("duration").notNull(), // in hours
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  expiresAt: timestamp("expires_at").notNull(),
  createdBy: varchar("created_by").notNull().references(() => users.id),
});

export const candidates = pgTable("candidates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pollId: varchar("poll_id").notNull().references(() => polls.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  voteCount: integer("vote_count").notNull().default(0),
});

export const votes = pgTable("votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pollId: varchar("poll_id").notNull().references(() => polls.id, { onDelete: "cascade" }),
  candidateId: varchar("candidate_id").references(() => candidates.id, { onDelete: "cascade" }),
  voteType: voteTypeEnum("vote_type"),
  fingerprint: text("fingerprint").notNull(),
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pollId: varchar("poll_id").notNull().references(() => polls.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  author: text("author").notNull(),
  fingerprint: text("fingerprint").notNull(),
  ipAddress: text("ip_address").notNull(),
  gajjabCount: integer("gajjab_count").notNull().default(0),
  bekarCount: integer("bekar_count").notNull().default(0),
  furiousCount: integer("furious_count").notNull().default(0),
  isModerated: boolean("is_moderated").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const commentReactions = pgTable("comment_reactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  commentId: varchar("comment_id").notNull().references(() => comments.id, { onDelete: "cascade" }),
  reactionType: voteTypeEnum("reaction_type").notNull(),
  fingerprint: text("fingerprint").notNull(),
  ipAddress: text("ip_address").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  polls: many(polls),
}));

export const pollsRelations = relations(polls, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [polls.createdBy],
    references: [users.id],
  }),
  candidates: many(candidates),
  votes: many(votes),
  comments: many(comments),
}));

export const candidatesRelations = relations(candidates, ({ one, many }) => ({
  poll: one(polls, {
    fields: [candidates.pollId],
    references: [polls.id],
  }),
  votes: many(votes),
}));

export const votesRelations = relations(votes, ({ one }) => ({
  poll: one(polls, {
    fields: [votes.pollId],
    references: [polls.id],
  }),
  candidate: one(candidates, {
    fields: [votes.candidateId],
    references: [candidates.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  poll: one(polls, {
    fields: [comments.pollId],
    references: [polls.id],
  }),
  reactions: many(commentReactions),
}));

export const commentReactionsRelations = relations(commentReactions, ({ one }) => ({
  comment: one(comments, {
    fields: [commentReactions.commentId],
    references: [comments.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertPollSchema = createInsertSchema(polls).omit({
  id: true,
  createdAt: true,
  isActive: true,
}).extend({
  candidates: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
  })).optional(),
});

export const insertCandidateSchema = createInsertSchema(candidates).omit({
  id: true,
  voteCount: true,
});

export const insertVoteSchema = createInsertSchema(votes).omit({
  id: true,
  createdAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
  gajjabCount: true,
  bekarCount: true,
  furiousCount: true,
  isModerated: true,
}).extend({
  content: z.string().refine((val) => val.trim().split(/\s+/).length <= 20, {
    message: "Comment cannot exceed 20 words",
  }),
});

export const insertCommentReactionSchema = createInsertSchema(commentReactions).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Poll = typeof polls.$inferSelect;
export type InsertPoll = z.infer<typeof insertPollSchema>;
export type Candidate = typeof candidates.$inferSelect;
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type Vote = typeof votes.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type CommentReaction = typeof commentReactions.$inferSelect;
export type InsertCommentReaction = z.infer<typeof insertCommentReactionSchema>;
