import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { voteTracker } from "@/lib/vote-tracker";
import { useToast } from "@/hooks/use-toast";
import { ThumbsUp, ThumbsDown, Flame, MessageSquare, User } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { pollsService } from "@/services/polls.service";
import { isAuthenticated, getUserName } from "@/lib/auth";

interface CommentSectionProps {
  pollId: string;
  showWordLimit?: boolean;
}

interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  gajjabCount: number;
  bekarCount: number;
  furiousCount: number;
}

export default function CommentSection({ pollId, showWordLimit = false }: CommentSectionProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [comment, setComment] = useState("");

  // Fetch real comments from API
  const { data: pollData, isLoading } = useQuery({
    queryKey: ['poll', pollId],
    queryFn: () => pollsService.getAggregatedPoll(pollId),
    enabled: !!pollId,
  });

  const comments = pollData?.comments || [];

  // Real comment submission with API
  const handleSubmitComment = async () => {
    if (!comment.trim()) {
      toast({
        title: t('error', 'Error'),
        description: t('comments.errors.fill_comment', 'Please enter a comment'),
        variant: "destructive",
      });
      return;
    }

    if (!isAuthenticated()) {
      toast({
        title: t('error', 'Error'),
        description: t('comments.errors.login_required', 'You must be logged in to comment'),
        variant: "destructive",
      });
      return;
    }

    const wordCount = getWordCount(comment);
    if (showWordLimit && wordCount > 20) {
      toast({
        title: t('error', 'Error'),
        description: t('comments.errors.word_limit', 'Comment cannot be more than 20 words'),
        variant: "destructive",
      });
      return;
    }

    try {
      await pollsService.addComment(pollId, comment.trim());

      // Invalidate and refetch poll data to show new comment
      queryClient.invalidateQueries({ queryKey: ['poll', pollId] });
      queryClient.invalidateQueries({ queryKey: ['aggregated-polls'] });

      setComment("");
      toast({
        title: t('success', 'Success'),
        description: t('comments.success.comment_posted', 'Your comment has been posted'),
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: t('error', 'Error'),
        description: error instanceof Error ? error.message : t('comments.errors.failed', 'Failed to add comment'),
        variant: "destructive",
      });
    }
  };

  // Real comment reaction with API
  const handleReactToComment = async (commentId: string, reactionType: string) => {
    if (!isAuthenticated()) {
      toast({
        title: t('error', 'Error'),
        description: t('comments.errors.login_required', 'You must be logged in to react to comments'),
        variant: "destructive",
      });
      return;
    }

    try {
      await pollsService.addCommentReaction(pollId, commentId, reactionType as 'gajjab' | 'bekar' | 'furious');

      // Invalidate and refetch poll data to show updated reaction counts
      queryClient.invalidateQueries({ queryKey: ['poll', pollId] });
      queryClient.invalidateQueries({ queryKey: ['aggregated-polls'] });

      toast({
        title: t('success', 'Success'),
        description: t('comments.success.reaction_added', 'Reaction added'),
      });
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast({
        title: t('error', 'Error'),
        description: error instanceof Error ? error.message : t('comments.errors.reaction_failed', 'Failed to add reaction'),
        variant: "destructive",
      });
    }
  };

  const getWordCount = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - commentDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const wordCount = getWordCount(comment);
  const isOverLimit = showWordLimit && wordCount > 20;

  // Helper to get initials
    const getInitials = (name: string | null | undefined) => {
      if (!name) return '?';
      return name.trim().charAt(0).toUpperCase();
    };

  // Helper to get random pastel color for avatar
  const getAvatarColor = (name: string) => {
    const colors = ['bg-red-100 text-red-600', 'bg-green-100 text-green-600', 'bg-blue-100 text-blue-600', 'bg-yellow-100 text-yellow-600', 'bg-purple-100 text-purple-600', 'bg-pink-100 text-pink-600'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <section className="mt-4 space-y-4" aria-label="Comments section">
      {/* Comment Form */}
      <form
        className="flex gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmitComment();
        }}
        aria-label="Add a comment"
      >
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0" aria-hidden="true">
          {isAuthenticated() ? (
            <span className="text-xs font-bold text-gray-600" aria-label={`${getUserName() || 'User'}'s avatar`}>
              {getInitials(getUserName())}
            </span>
          ) : (
            <User className="w-4 h-4 text-gray-400" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <Input
            placeholder={showWordLimit ? t('comments.placeholders.comment_with_limit', 'Write a comment... (20 words max)') : t('comments.placeholders.comment', 'Write a comment...')}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className={`bg-gray-50 border-gray-200 focus:bg-white transition-colors ${isOverLimit ? "border-red-500 focus:ring-red-200" : ""}`}
            aria-label="Comment text"
            aria-describedby={showWordLimit ? "word-count" : undefined}
            aria-invalid={isOverLimit}
          />
          <div className="flex items-center justify-between">
            {showWordLimit && (
              <span
                id="word-count"
                className={`text-xs ${isOverLimit ? 'text-red-500 font-medium' : 'text-gray-400'}`}
                aria-live="polite"
              >
                {wordCount}/20 words
              </span>
            )}
            <Button
              type="submit"
              disabled={!comment.trim() || isOverLimit || !isAuthenticated()}
              className="ml-auto bg-blue-600 hover:bg-blue-700 text-white h-8 px-4 text-xs rounded-full"
              size="sm"
              aria-label="Post comment"
            >
              {t('comments.actions.post', 'Post')}
            </Button>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4 pt-2" role="feed" aria-label="User comments">
        {isLoading ? (
          <div className="text-center py-4" role="status" aria-live="polite">
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600" aria-hidden="true"></div>
            <span className="sr-only">Loading comments...</span>
          </div>
        ) : !comments || !Array.isArray(comments) || comments.length === 0 ? (
          <div className="text-center py-6 bg-gray-50/50 rounded-lg border border-dashed border-gray-200" role="status">
            <p className="text-sm text-gray-500">{t('comments.empty', 'No comments yet. Be the first to share your thoughts!')}</p>
          </div>
        ) : (
          (comments as Comment[]).map((comment: Comment) => (
            <article key={comment.id} className="flex gap-3 group" itemScope itemType="https://schema.org/Comment">
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${getAvatarColor(comment.author)}`} aria-hidden="true">
                <span className="text-xs font-bold">{getInitials(comment.author)}</span>
              </div>

              <div className="flex-1 space-y-1">
                {/* Header */}
                <header className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900" itemProp="author" itemScope itemType="https://schema.org/Person">
                    <span itemProp="name">{comment.author}</span>
                  </span>
                  <span className="text-xs text-gray-400" aria-hidden="true">•</span>
                  <time className="text-xs text-gray-400" dateTime={comment.createdAt} itemProp="datePublished">
                    {formatTimeAgo(comment.createdAt)}
                  </time>
                </header>

                {/* Content */}
                <p className="text-sm text-gray-700 leading-relaxed" itemProp="text">{comment.content}</p>

                {/* Actions */}
                <footer className="flex items-center gap-4 pt-1" role="group" aria-label="Comment reactions">
                  <button
                    onClick={() => handleReactToComment(comment.id, "gajjab")}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-green-600 transition-colors group/btn"
                    aria-label={`Like comment (${comment.gajjabCount || 0} likes)`}
                    title="Like this comment"
                  >
                    <div className="p-1 rounded-full group-hover/btn:bg-green-50" aria-hidden="true">
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-medium" aria-label={`${comment.gajjabCount || 0} likes`}>{comment.gajjabCount || 0}</span>
                  </button>

                  <button
                    onClick={() => handleReactToComment(comment.id, "bekar")}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 transition-colors group/btn"
                    aria-label={`Dislike comment (${comment.bekarCount || 0} dislikes)`}
                    title="Dislike this comment"
                  >
                    <div className="p-1 rounded-full group-hover/btn:bg-red-50" aria-hidden="true">
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-medium" aria-label={`${comment.bekarCount || 0} dislikes`}>{comment.bekarCount || 0}</span>
                  </button>

                  <button
                    onClick={() => handleReactToComment(comment.id, "furious")}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-orange-600 transition-colors group/btn"
                    aria-label={`React with furious (${comment.furiousCount || 0} reactions)`}
                    title="React as furious to this comment"
                  >
                    <div className="p-1 rounded-full group-hover/btn:bg-orange-50" aria-hidden="true">
                      <Flame className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-medium" aria-label={`${comment.furiousCount || 0} furious reactions`}>{comment.furiousCount || 0}</span>
                  </button>
                </footer>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
