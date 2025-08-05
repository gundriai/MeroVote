import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { voteTracker } from "@/lib/vote-tracker";
import { useToast } from "@/hooks/use-toast";
import { ThumbsUp, ThumbsDown, Flame, Star, Minus } from "lucide-react";
import { useState, useEffect } from "react";

interface VotingCardProps {
  poll: {
    id: string;
    title: string;
    description?: string;
    type: string;
    mediaUrl?: string;
    expiresAt: string;
    isActive: boolean;
  };
}

interface VoteOption {
  type: string;
  label: string;
  icon: any;
  color: string;
  bgColor: string;
  hoverColor: string;
}

const getVoteOptions = (pollType: string): VoteOption[] => {
  if (pollType === "daily_rating") {
    return [
      { type: "gajjab", label: "गजब", icon: ThumbsUp, color: "text-green-700", bgColor: "bg-green-500", hoverColor: "hover:bg-green-50 hover:border-green-500" },
      { type: "bekar", label: "बेकार", icon: ThumbsDown, color: "text-red-700", bgColor: "bg-red-500", hoverColor: "hover:bg-red-50 hover:border-red-500" },
      { type: "furious", label: "यस्तो नी हुन्छ गथे", icon: Flame, color: "text-orange-700", bgColor: "bg-orange-500", hoverColor: "hover:bg-orange-50 hover:border-orange-500" },
    ];
  } else if (pollType === "political_rating") {
    return [
      { type: "excellent", label: "उत्कृष्ट", icon: Star, color: "text-green-700", bgColor: "bg-green-500", hoverColor: "hover:bg-green-50 hover:border-green-500" },
      { type: "good", label: "राम्रो", icon: ThumbsUp, color: "text-blue-700", bgColor: "bg-blue-500", hoverColor: "hover:bg-blue-50 hover:border-blue-500" },
      { type: "average", label: "औसत", icon: Minus, color: "text-yellow-700", bgColor: "bg-yellow-500", hoverColor: "hover:bg-yellow-50 hover:border-yellow-500" },
      { type: "poor", label: "खराब", icon: ThumbsDown, color: "text-red-700", bgColor: "bg-red-500", hoverColor: "hover:bg-red-50 hover:border-red-500" },
    ];
  }
  return [];
};

const getTypeLabel = (type: string): string => {
  switch (type) {
    case "daily_rating": return "दैनिक मूल्याङ्कन";
    case "political_rating": return "राजनैतिक मूल्याङ्कन";
    default: return "मतदान";
  }
};

const getTypeBadgeColor = (type: string): string => {
  switch (type) {
    case "daily_rating": return "bg-nepal-orange";
    case "political_rating": return "bg-purple-600";
    default: return "bg-gray-600";
  }
};

export default function VotingCard({ poll }: VotingCardProps) {
  const { toast } = useToast();
  const [hasVoted, setHasVoted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");

  const voteOptions = getVoteOptions(poll.type);

  // Check if user has voted locally
  useEffect(() => {
    setHasVoted(voteTracker.hasVotedLocally(poll.id));
  }, [poll.id]);

  // Calculate time remaining
  useEffect(() => {
    const updateTimeRemaining = () => {
      const now = new Date();
      const expires = new Date(poll.expiresAt);
      const diff = expires.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining("समाप्त");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        setTimeRemaining(`${days} दिन बाँकी`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours} घण्टा बाँकी`);
      } else {
        setTimeRemaining(`${minutes} मिनेट बाँकी`);
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [poll.expiresAt]);

  // Fetch vote counts
  const { data: voteCounts } = useQuery({
    queryKey: ["/api/polls", poll.id, "votes"],
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async (voteType: string) => {
      const fingerprint = voteTracker.getFingerprint();
      const response = await apiRequest("POST", "/api/votes", {
        pollId: poll.id,
        voteType,
        fingerprint,
      });
      return response.json();
    },
    onSuccess: (_, voteType) => {
      voteTracker.recordVote(poll.id);
      setHasVoted(true);
      toast({
        title: "सफलता",
        description: "तपाईंको मत सफलतापूर्वक दर्ता भयो",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/polls", poll.id, "votes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/stats"] });
    },
    onError: (error: any) => {
      const message = error.message || "मत दिन सकिएन";
      toast({
        title: "त्रुटि",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleVote = (voteType: string) => {
    if (hasVoted) {
      toast({
        title: "जानकारी",
        description: "तपाईंले यस पोलमा पहिले नै मत दिनुभएको छ",
      });
      return;
    }

    if (!poll.isActive || new Date() > new Date(poll.expiresAt)) {
      toast({
        title: "जानकारी",
        description: "यो पोल समाप्त भएको छ",
      });
      return;
    }

    voteMutation.mutate(voteType);
  };

  const isExpired = !poll.isActive || new Date() > new Date(poll.expiresAt);

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge className={`${getTypeBadgeColor(poll.type)} text-white text-xs`}>
                {getTypeLabel(poll.type)}
              </Badge>
              <span className="text-sm text-gray-500">{timeRemaining}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{poll.title}</h3>
            {poll.description && (
              <p className="text-gray-600 text-sm mb-4">{poll.description}</p>
            )}
          </div>
          {poll.mediaUrl && (
            <img 
              src={poll.mediaUrl} 
              alt="Poll media" 
              className="rounded-lg w-32 h-20 object-cover ml-4"
            />
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Voting Options */}
        <div className={`grid gap-4 mb-6 ${voteOptions.length === 3 ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
          {voteOptions.map((option) => {
            const Icon = option.icon;
            const count = (voteCounts as any)?.[option.type] || 0;
            const isDisabled = hasVoted || isExpired || voteMutation.isPending;

            return (
              <Button
                key={option.type}
                onClick={() => handleVote(option.type)}
                disabled={isDisabled}
                variant="outline"
                className={`vote-button flex flex-col items-center p-4 h-auto border-2 border-gray-200 ${option.hoverColor} transition-all ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className={`w-10 h-10 ${option.bgColor} rounded-full flex items-center justify-center mb-2`}>
                  <Icon className="text-white w-5 h-5" />
                </div>
                <span className={`font-medium ${option.color} text-sm`}>{option.label}</span>
                <span className="text-xs text-gray-500">{count}</span>
              </Button>
            );
          })}
        </div>

        {/* Vote Tracking Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">तपाईंको मत सुरक्षित छ</span>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-nepal-blue rounded-full"></div>
                <span className="text-gray-600">ब्राउजर पहिचान</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">IP ट्र्याकिङ</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-gray-600">स्थानीय भण्डारण</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
