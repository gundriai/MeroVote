import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPollSchema, insertVoteSchema, insertCommentSchema, insertCommentReactionSchema } from "@shared/schema";
import { z } from "zod";

function getClientIP(req: any): string {
  return req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 
         (req.connection.socket ? req.connection.socket.remoteAddress : '127.0.0.1');
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all active polls
  app.get("/api/polls", async (req, res) => {
    try {
      const type = req.query.type as string;
      const polls = type ? await storage.getPollsByType(type) : await storage.getActivePolls();
      res.json(polls);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch polls" });
    }
  });

  // Get specific poll with candidates
  app.get("/api/polls/:id", async (req, res) => {
    try {
      const poll = await storage.getPollWithCandidates(req.params.id);
      if (!poll) {
        return res.status(404).json({ message: "Poll not found" });
      }
      res.json(poll);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch poll" });
    }
  });

  // Create new poll (admin only)
  app.post("/api/polls", async (req, res) => {
    try {
      const validatedData = insertPollSchema.parse(req.body);
      const poll = await storage.createPoll(validatedData);
      res.json(poll);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid poll data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create poll" });
    }
  });

  // Submit vote
  app.post("/api/votes", async (req, res) => {
    try {
      const voteData = {
        ...req.body,
        ipAddress: getClientIP(req),
        userAgent: req.get('User-Agent') || '',
      };
      
      const validatedData = insertVoteSchema.parse(voteData);
      
      // Check if user has already voted
      const hasVoted = await storage.hasVoted(
        validatedData.pollId, 
        validatedData.fingerprint, 
        validatedData.ipAddress
      );
      
      if (hasVoted) {
        return res.status(409).json({ message: "तपाईंले यस पोलमा पहिले नै मत दिनुभएको छ" });
      }

      const vote = await storage.createVote(validatedData);
      res.json(vote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid vote data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to submit vote" });
    }
  });

  // Get vote counts for a poll
  app.get("/api/polls/:id/votes", async (req, res) => {
    try {
      const counts = await storage.getVoteCountsByPoll(req.params.id);
      res.json(counts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vote counts" });
    }
  });

  // Get comments for a poll
  app.get("/api/polls/:id/comments", async (req, res) => {
    try {
      const comments = await storage.getCommentsByPollId(req.params.id);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Submit comment
  app.post("/api/comments", async (req, res) => {
    try {
      const commentData = {
        ...req.body,
        ipAddress: getClientIP(req),
      };
      
      const validatedData = insertCommentSchema.parse(commentData);
      const comment = await storage.createComment(validatedData);
      res.json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid comment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to submit comment" });
    }
  });

  // React to comment
  app.post("/api/comments/:id/reactions", async (req, res) => {
    try {
      const reactionData = {
        commentId: req.params.id,
        reactionType: req.body.reactionType,
        fingerprint: req.body.fingerprint,
        ipAddress: getClientIP(req),
      };
      
      const validatedData = insertCommentReactionSchema.parse(reactionData);
      
      // Check if user has already reacted with this type
      const hasReacted = await storage.hasReactedToComment(
        validatedData.commentId,
        validatedData.fingerprint,
        validatedData.reactionType
      );
      
      if (hasReacted) {
        return res.status(409).json({ message: "तपाईंले यस टिप्पणीमा पहिले नै प्रतिक्रिया दिनुभएको छ" });
      }

      const reaction = await storage.createCommentReaction(validatedData);
      res.json(reaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid reaction data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to submit reaction" });
    }
  });

  // Analytics endpoints
  app.get("/api/analytics/stats", async (req, res) => {
    try {
      const stats = {
        totalVotes: await storage.getTotalVotes(),
        activeVoters: await storage.getActiveVoters(),
        totalPolls: await storage.getTotalPolls(),
        activePolls: await storage.getActivePolls(),
        pendingComments: await storage.getPendingComments(),
      };
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
