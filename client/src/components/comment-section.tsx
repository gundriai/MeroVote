import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { voteTracker } from "@/lib/vote-tracker";
import { useToast } from "@/hooks/use-toast";
import { ThumbsUp, ThumbsDown, Flame, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

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
  const [author, setAuthor] = useState("");

  // Use hardcoded comments data
  const mockComments = [
    {
      id: "1",
      content: "रवि लामिछाने नै उत्तम विकल्प हो",
      author: "राम बहादुर",
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      gajjabCount: 12,
      bekarCount: 2,
      furiousCount: 1,
    },
    {
      id: "2",
      content: "गगन थापाको नेतृत्व चाहिन्छ",
      author: "सीता देवी", 
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      gajjabCount: 8,
      bekarCount: 5,
      furiousCount: 0,
    }
  ];
  const comments = mockComments;
  const isLoading = false;

  // Simulate comment submission without API
  const handleSubmitComment = () => {
    if (!comment.trim() || !author.trim()) {
      toast({
        title: t('error', 'Error'),
        description: t('comments.errors.fill_fields', 'Please fill in both comment and name'),
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

    setComment("");
    setAuthor("");
    toast({
      title: t('success', 'Success'),
      description: t('comments.success.comment_posted', 'Your comment has been posted'),
    });
  };

  // Simulate comment reaction without API
  const handleReactToComment = (commentId: string, reactionType: string) => {
    toast({
      title: t('success', 'Success'),
      description: t('comments.success.reaction_added', 'Reaction added'),
    });
  };

  const getWordCount = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - commentDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return t('time.just_now', 'just now');
    if (diffInMinutes < 60) return t('time.minutes_ago', { count: diffInMinutes, defaultValue: '{{count}} minutes ago' });
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return t('time.hours_ago', { count: diffInHours, defaultValue: '{{count}} hours ago' });
    
    const diffInDays = Math.floor(diffInHours / 24);
    return t('time.days_ago', { count: diffInDays, defaultValue: '{{count}} days ago' });
  };

  const wordCount = getWordCount(comment);
  const isOverLimit = showWordLimit && wordCount > 20;

  return (
    <Card className="bg-white shadow-sm border border-gray-200 mt-4">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-lg">
          <MessageSquare className="w-5 h-5" />
          <span>टिप्पणीहरू</span>
          {showWordLimit && <span className="text-sm font-normal text-gray-500">(२० शब्द सीमा)</span>}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Comments List */}
        <div className="space-y-3 mb-6">
          {isLoading ? (
            <div className="text-center py-4">
              <h3 className="text-lg font-semibold">{t('comments.title', 'Comments')}</h3>
              <p className="text-gray-500">{t('loading', 'Loading...')}</p>
            </div>
          ) : !comments || !Array.isArray(comments) || comments.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">{t('comments.empty', 'No comments')}</p>
            </div>
          ) : (
            (comments as Comment[]).map((comment: Comment) => (
              <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">{comment.content}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-xs text-gray-500">{comment.author}</span>
                      <p className="text-sm text-gray-500">{comment.author} • {formatTimeAgo(comment.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleReactToComment(comment.id, "gajjab")}
                      className="text-green-500 hover:text-green-700 text-xs flex items-center space-x-1"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>{comment.gajjabCount}</span>
                    </button>
                    <button
                      onClick={() => handleReactToComment(comment.id, "bekar")}
                      className="text-red-500 hover:text-red-700 text-xs flex items-center space-x-1"
                    >
                      <ThumbsDown className="w-3 h-3" />
                      <span>{comment.bekarCount}</span>
                    </button>
                    <button
                      onClick={() => handleReactToComment(comment.id, "furious")}
                      className="text-orange-500 hover:text-orange-700 text-xs flex items-center space-x-1"
                    >
                      <Flame className="w-3 h-3" />
                      <span>{comment.furiousCount}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment Form */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Input
              placeholder={t('comments.placeholders.name', 'Your name')}
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="mb-2"
            />
            <div className="md:col-span-2">
              <Input
                placeholder={showWordLimit ? t('comments.placeholders.comment_with_limit', 'Your comment (20 words limit)') : t('comments.placeholders.comment', 'Your comment')}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className={isOverLimit ? "border-red-500" : ""}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            {showWordLimit && (
              <p className={`text-xs ${isOverLimit ? 'text-red-500' : 'text-gray-500'}`}>
                {t('comments.word_count', 'Word count')}: {wordCount}/२०
              </p>
            )}
            <Button
              onClick={handleSubmitComment}
              disabled={!comment.trim() || !author.trim() || isOverLimit}
              className="bg-nepal-red hover:bg-red-700 text-white ml-auto"
              size="sm"
            >
              {t('comments.actions.post_comment', 'Post Comment')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
