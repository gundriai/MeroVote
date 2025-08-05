import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { voteTracker } from "@/lib/vote-tracker";
import { useToast } from "@/hooks/use-toast";
import { ThumbsUp, ThumbsDown, Flame, MessageSquare } from "lucide-react";
import { useState } from "react";

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
        title: "त्रुटि",
        description: "कृपया टिप्पणी र नाम दुवै भर्नुहोस्",
        variant: "destructive",
      });
      return;
    }

    const wordCount = getWordCount(comment);
    if (showWordLimit && wordCount > 20) {
      toast({
        title: "त्रुटि",
        description: "टिप्पणी २० शब्द भन्दा बढी हुन सक्दैन",
        variant: "destructive",
      });
      return;
    }

    setComment("");
    setAuthor("");
    toast({
      title: "सफलता",
      description: "तपाईंको टिप्पणी पोस्ट भयो",
    });
  };

  // Simulate comment reaction without API
  const handleReactToComment = (commentId: string, reactionType: string) => {
    toast({
      title: "सफलता",
      description: "प्रतिक्रिया दिइयो",
    });
  };

  const getWordCount = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - commentDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "अहिले";
    if (diffInMinutes < 60) return `${diffInMinutes} मिनेट अगाडि`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} घण्टा अगाडि`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} दिन अगाडि`;
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
              <p className="text-gray-500">टिप्पणीहरू लोड गर्दै...</p>
            </div>
          ) : !comments || !Array.isArray(comments) || comments.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">कुनै टिप्पणी छैन</p>
            </div>
          ) : (
            (comments as Comment[]).map((comment: Comment) => (
              <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">{comment.content}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-xs text-gray-500">{comment.author}</span>
                      <span className="text-xs text-gray-500">{formatTimeAgo(comment.createdAt)}</span>
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
              placeholder="तपाईंको नाम"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="md:col-span-1"
            />
            <div className="md:col-span-2">
              <Input
                placeholder={showWordLimit ? "तपाईंको टिप्पणी यहाँ लेख्नुहोस् (२० शब्द मात्र)..." : "तपाईंको टिप्पणी यहाँ लेख्नुहोस्..."}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className={isOverLimit ? "border-red-500" : ""}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            {showWordLimit && (
              <p className={`text-xs ${isOverLimit ? 'text-red-500' : 'text-gray-500'}`}>
                शब्द गणना: {wordCount}/२०
              </p>
            )}
            <Button
              onClick={handleSubmitComment}
              disabled={!comment.trim() || !author.trim() || isOverLimit}
              className="bg-nepal-red hover:bg-red-700 text-white ml-auto"
              size="sm"
            >
              पठाउनुहोस्
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
