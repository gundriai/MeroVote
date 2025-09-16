import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { voteTracker } from "@/lib/vote-tracker";
import { useToast } from "@/hooks/use-toast";
import { ThumbsUp, ThumbsDown, Flame, Star, Minus, MessageSquare, ChevronDown, ChevronUp, Heart, Zap, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import CommentSection from "./comment-section";
import { PollType } from "@/data/mock-polls";
import { AggregatedPoll, AggregatedPollOption } from "@/services/polls.service";
import { pollsService } from "@/services/polls.service";
import { PollVoteStatusMessages } from "@/enums";

interface VotingCardProps {
  poll: AggregatedPoll;
}

interface VoteOption {
  type: string;
  label: string;
  icon: any;
  color: string;
  bgColor: string;
  hoverColor: string;
}

// Helper functions for icon and color mapping
const getIconFromName = (iconName: string) => {
  const iconMap: { [key: string]: any } = {
    'thumbs-up': ThumbsUp,
    'thumbs-down': ThumbsDown,
    'flame': Flame,
    'star': Star,
    'minus': Minus,
    'heart': Heart,
    'zap': Zap,
  };
  return iconMap[iconName] || ThumbsUp;
};

const getColorClass = (color: string) => {
  const colorMap: { [key: string]: string } = {
    'green': 'text-green-700',
    'red': 'text-red-700',
    'blue': 'text-blue-700',
    'yellow': 'text-yellow-700',
    'purple': 'text-purple-700',
    'orange': 'text-orange-700',
    'pink': 'text-pink-700',
  };
  return colorMap[color] || 'text-gray-700';
};

const getBgColorClass = (color: string) => {
  const colorMap: { [key: string]: string } = {
    'green': 'bg-green-500',
    'red': 'bg-red-500',
    'blue': 'bg-blue-500',
    'yellow': 'bg-yellow-500',
    'purple': 'bg-purple-500',
    'orange': 'bg-orange-500',
    'pink': 'bg-pink-500',
  };
  return colorMap[color] || 'bg-gray-500';
};

const getHoverColorClass = (color: string) => {
  const colorMap: { [key: string]: string } = {
    'green': 'hover:bg-green-50 hover:border-green-500',
    'red': 'hover:bg-red-50 hover:border-red-500',
    'blue': 'hover:bg-blue-50 hover:border-blue-500',
    'yellow': 'hover:bg-yellow-50 hover:border-yellow-500',
    'purple': 'hover:bg-purple-50 hover:border-purple-500',
    'orange': 'hover:bg-orange-50 hover:border-orange-500',
    'pink': 'hover:bg-pink-50 hover:border-pink-500',
  };
  return colorMap[color] || 'hover:bg-gray-50 hover:border-gray-500';
};

const getVoteOptions = (pollType: string, t: any): VoteOption[] => {
  if (pollType === PollType.REACTION_BASED) {
    return [
      { type: "gajjab", label: t('voting.ratings.gajjab', 'Gajjab'), icon: ThumbsUp, color: "text-green-700", bgColor: "bg-green-500", hoverColor: "hover:bg-green-50 hover:border-green-500" },
      { type: "bekar", label: t('voting.ratings.bekar', 'Bekar'), icon: ThumbsDown, color: "text-red-700", bgColor: "bg-red-500", hoverColor: "hover:bg-red-50 hover:border-red-500" },
      { type: "furious", label: t('voting.ratings.furious', 'Furious'), icon: Flame, color: "text-orange-700", bgColor: "bg-orange-500", hoverColor: "hover:bg-orange-50 hover:border-orange-500" },
    ];
  } 
  // TODO: Need to think if it is needed or not.
  else if (pollType === "REACTION_BASED") {
    return [
      { type: "excellent", label: t('voting.ratings.excellent', 'Excellent'), icon: Star, color: "text-green-700", bgColor: "bg-green-500", hoverColor: "hover:bg-green-50 hover:border-green-500" },
      { type: "good", label: t('voting.ratings.good', 'Good'), icon: ThumbsUp, color: "text-blue-700", bgColor: "bg-blue-500", hoverColor: "hover:bg-blue-50 hover:border-blue-500" },
      { type: "average", label: t('voting.ratings.average', 'Average'), icon: Minus, color: "text-yellow-700", bgColor: "bg-yellow-500", hoverColor: "hover:bg-yellow-50 hover:border-yellow-500" },
      { type: "poor", label: t('voting.ratings.poor', 'Poor'), icon: ThumbsDown, color: "text-red-700", bgColor: "bg-red-500", hoverColor: "hover:bg-red-50 hover:border-red-500" },
    ];
  }
  return [];
};

const getTypeLabel = (type: string, t: any): string => {
  switch (type) {
    case "REACTION_BASED": return t('voting.types.reaction_based', 'Reaction-Based');
    case "ONE_VS_ONE": return t('voting.types.one_vs_one', 'One vs One');
    default: return t('voting.types.default', 'Vote');
  }
};

const getTypeBadgeColor = (type: string): string => {
  switch (type) {
    case "REACTION_BASED": return "bg-green-600";
    case "ONE_VS_ONE": return "bg-blue-600";
    default: return "bg-gray-600";
  }
};

export default function VotingCard({ poll }: VotingCardProps) {
  const { toast } = useToast();
  const [hasVoted, setHasVoted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [showComments, setShowComments] = useState(false);

  const { t } = useTranslation();
  
  // Use poll options from API if available, otherwise fallback to hardcoded options
  const voteOptions = poll.pollOptions && poll.pollOptions.length > 0 
    ? poll.pollOptions.map(option => ({
        type: option.label || 'unknown',
        label: option.label || 'Unknown',
        icon: getIconFromName(option.icon || 'thumbs-up'),
        color: getColorClass(option.color || 'blue'),
        bgColor: getBgColorClass(option.color || 'blue'),
        hoverColor: getHoverColorClass(option.color || 'blue'),
      }))
    : getVoteOptions(poll.type, t);

  // Check if user has voted (from API or locally)
  useEffect(() => {
    // Use API data if available, otherwise fallback to local storage
    setHasVoted(poll.alreadyVoted || voteTracker.hasVotedLocally(poll.id));
  }, [poll.id, poll.alreadyVoted]);

  // Calculate time remaining
  useEffect(() => {
    const updateTimeRemaining = () => {
      const now = new Date();
      const expires = new Date(poll.endDate);
      const diff = expires.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining(t('voting.ended', 'Ended'));
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        setTimeRemaining(t('voting.days_remaining', { count: days, defaultValue: '{{count}} days left' }));
      } else if (hours > 0) {
        setTimeRemaining(t('voting.hours_remaining', { count: hours, defaultValue: '{{count}} hours left' }));
      } else {
        setTimeRemaining(t('voting.minutes_remaining', { count: minutes, defaultValue: '{{count}} minutes left' }));
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [poll.endDate]);

  // Use vote counts from poll options data
  const voteCounts = poll.pollOptions?.reduce((acc, option) => {
    acc[option.label || 'unknown'] = option.voteCount;
    return acc;
  }, {} as { [key: string]: number }) || {};

  // Real voting with API call
  const handleVoteAction = async (voteType: string) => {
    try {
      // Find the poll option ID for this vote type
      const pollOption = poll.pollOptions?.find(option => option.label === voteType);
      if (!pollOption) {
        throw new Error('Poll option not found');
      }

      await pollsService.voteOnPoll(poll.id, pollOption.id);
      
      voteTracker.recordVote(poll.id);
      setHasVoted(true);
      toast({
        title: "सफलता",
        description: "तपाईंको मत सफलतापूर्वक दर्ता भयो",
      });
    } catch (error) {
      console.error('Error voting:', error);
      
      let errorMessage = "मत दिन असफल";
      
      if (error instanceof Error) {
        // Get the full error message
        const errorText = error.message;
        
        // Check if the error text contains any of our enum values using includes()
        if (errorText.includes(PollVoteStatusMessages.ALREADY_VOTED)) {
          errorMessage = t('voting.errors.already_voted', 'तपाईंले यो पोलमा पहिले नै मत दिनुभएको छ');
        } else if (errorText.includes(PollVoteStatusMessages.POLL_NOT_ACTIVE)) {
          errorMessage = t('voting.errors.poll_not_active', 'यो पोल अहिले सक्रिय छैन');
        } else if (errorText.includes(PollVoteStatusMessages.POLL_OPTION_NOT_FOUND)) {
          errorMessage = t('voting.errors.poll_option_not_found', 'पोल विकल्प फेला परेन');
        } else if (errorText.includes(PollVoteStatusMessages.USER_NOT_LOGGED_IN)) {
          errorMessage = t('voting.errors.user_not_logged_in', 'मत दिनका लागि तपाईंले लग इन गर्नुपर्छ');
        } else if (errorText.includes(PollVoteStatusMessages.POLL_NOT_FOUND)) {
          errorMessage = t('voting.errors.poll_not_found', 'पोल फेला परेन');
        } else if (errorText.includes(PollVoteStatusMessages.VOTING_ENDED)) {
          errorMessage = t('voting.errors.voting_ended', 'यो पोलको मतदान समाप्त भएको छ');
        } else {
          // If no enum value is found, try to extract message after colon if it exists
          if (errorText.includes(':')) {
            const parts = errorText.split(':');
            if (parts.length > 1) {
              errorMessage = parts[1].trim();
            } else {
              errorMessage = errorText;
            }
          } else {
            errorMessage = errorText;
          }
        }
      }
      
      toast({
        title: t('voting.errors.title', 'त्रुटि'),
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleVote = (voteType: string) => {
    if (hasVoted) {
      toast({
        title: "जानकारी",
        description: "तपाईंले यस पोलमा पहिले नै मत दिनुभएको छ",
      });
      return;
    }

    if (new Date() > new Date(poll.endDate)) {
      toast({
        title: "जानकारी",
        description: "यो पोल समाप्त भएको छ",
      });
      return;
    }

    handleVoteAction(voteType);
  };

  const isExpired = new Date() > new Date(poll.endDate);

  return (
    <div className="relative w-full">
      <Card className="bg-white shadow-sm border border-gray-200 w-full relative overflow-hidden" style={{
        backgroundImage: 'url(/assets/Mero Vote.png)',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay',
        backgroundColor: 'rgba(255, 255, 255, 0.95)'
      }}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge className={`${getTypeBadgeColor(poll.type)} text-white text-xs`}>
                {getTypeLabel(poll.type, t)}
              </Badge>
              <span className="text-sm text-gray-500">{timeRemaining}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{poll.title}</h3>
            {poll.description && (
              <p className="text-gray-600 text-sm mb-4">{poll.description}</p>
            )}
          </div>
          {poll.mediaUrl && (
            <div className="rounded-lg overflow-hidden ml-4 flex items-center justify-center" style={{ width: 128, height: 128 }}>
              <img 
                src={poll.mediaUrl} 
                alt="Poll media" 
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Voting Options */}
        <div className={`grid gap-4 mb-6 ${voteOptions.length === 3 ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
          {voteOptions.map((option) => {
            const Icon = option.icon;
            const count = (voteCounts as any)?.[option.type] || 0;
            const isDisabled = hasVoted || isExpired;

            return (
              <Button
                key={option.type}
                onClick={() => handleVote(option.type)}
                disabled={isDisabled}
                variant="outline"
                className={`vote-button flex flex-col items-center p-4 h-auto border-2 border-gray-200 ${option.hoverColor} transition-all ${isDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}
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



        {/* Comment Toggle Button */}
        <Button
          onClick={() => setShowComments(!showComments)}
          variant="outline"
          className="w-full mb-4 flex items-center justify-center space-x-2 hover:bg-gray-50"
        >
          <MessageSquare className="w-4 h-4" />
          <span>{showComments ? "टिप्पणी लुकाउनुहोस्" : "टिप्पणी देखाउनुहोस्"}</span>
          {showComments ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>

        {/* Comment Section */}
        {showComments && (
          <CommentSection pollId={poll.id} showWordLimit={poll.type === "REACTION_BASED"} />
        )}
      </CardContent>
    </Card>
    
    {/* VOTED Sticker */}
    {hasVoted && (
      <div className="absolute top-4 right-4 pointer-events-none z-10">
        <div className="bg-green-600 text-white px-3 py-1 rounded-full shadow-md opacity-60">
          <span className="text-sm font-medium">VOTED</span>
        </div>
      </div>
    )}
  </div>
  );
}
