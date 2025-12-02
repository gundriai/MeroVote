import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { voteTracker } from "@/lib/vote-tracker";
import { useToast } from "@/hooks/use-toast";
import { ThumbsUp, ThumbsDown, Flame, Star, Minus, MessageSquare, ChevronDown, ChevronUp, Heart, Zap, Check, Share2, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import CommentSection from "./comment-section";
import { PollType } from "@/data/mock-polls";
import { AggregatedPoll, AggregatedPollOption } from "@/services/polls.service";
import { pollsService } from "@/services/polls.service";
import { PollVoteStatusMessages } from "@/enums";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

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
  const [isCopied, setIsCopied] = useState(false);

  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // Use poll options from API if available, otherwise fallback to hardcoded options
  const voteOptions = poll.pollOptions && poll.pollOptions.length > 0
    ? poll.pollOptions.map(option => ({
      type: option.type || option.label || 'unknown',
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
    setHasVoted(poll.votedDetails.alreadyVoted || voteTracker.hasVotedLocally(poll.id));
  }, [poll.id, poll.votedDetails.alreadyVoted]);

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
        setTimeRemaining(t('voting.hours_remaining', { count: hours, defaultValue: '{{count}}h left' }));
      } else {
        setTimeRemaining(t('voting.minutes_remaining', { count: minutes, defaultValue: '{{count}}m left' }));
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [poll.endDate]);

  // Use vote counts from poll options data
  const voteCounts = poll.pollOptions?.reduce((acc, option) => {
    acc[option.type || option.label || 'unknown'] = option.voteCount;
    return acc;
  }, {} as { [key: string]: number }) || {};

  // Real voting with API call
  const handleVoteAction = async (voteType: string) => {
    // Check authentication first
    if (!isAuthenticated) {
      toast({
        title: t('voting.auth_required_title', 'Authentication Required'),
        description: t('voting.auth_required_message', 'You need to login to cast vote'),
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    try {
      // Find the poll option ID for this vote type
      const pollOption = poll.pollOptions?.find(option => option.type === voteType);
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

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/poll/${poll.id}`;
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    toast({
      title: t('share.copied', 'Link Copied!'),
      description: t('share.description', 'Poll link has been copied to clipboard'),
      className: "bg-green-500 text-white border-green-600",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Calculate total votes for percentage
  const totalVotes = Object.values(voteCounts).reduce((a, b) => a + b, 0);

  return (
    <Card className="w-full h-full flex flex-col bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 rounded-xl overflow-hidden">
      <CardHeader className="pb-3 pt-4 px-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Badge variant="secondary" className="rounded-md font-normal bg-gray-100 text-gray-600 hover:bg-gray-200 px-2 py-0.5">
                {getTypeLabel(poll.type, t)}
              </Badge>
              <span>•</span>
              <span className={`font-medium ${isExpired ? "text-red-500" : "text-green-600"}`}>{timeRemaining}</span>
            </div>
            <h3 className="font-bold text-lg leading-snug text-gray-900 line-clamp-2">{poll.title}</h3>
          </div>
          {poll.mediaUrl && (
            <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
              <img
                src={poll.mediaUrl}
                alt="Poll media"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col px-4 pb-4 pt-0">
        {poll.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">{poll.description}</p>
        )}

        {/* Options List */}
        <div className="space-y-2.5 flex-1">
          {voteOptions.map((option) => {
            const count = (voteCounts as any)?.[option.type] || 0;
            const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
            const isSelected = poll.votedDetails.alreadyVoted && poll.votedDetails.optionChosen === option.type;
            const Icon = option.icon;
            const isDisabled = hasVoted || isExpired;

            return (
              <button
                key={option.type}
                onClick={() => handleVote(option.type)}
                disabled={isDisabled}
                className={`group relative w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200 overflow-hidden
                  ${isSelected
                    ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                  ${isDisabled && !isSelected ? 'opacity-70 cursor-default' : 'cursor-pointer'}
                `}
              >
                {/* Progress Bar Background */}
                {(hasVoted || isExpired) && (
                  <div
                    className={`absolute inset-y-0 left-0 bg-blue-100/50 transition-all duration-700 ease-out`}
                    style={{ width: `${percentage}%`, zIndex: 0 }}
                  />
                )}

                <div className="flex items-center gap-3 relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${option.bgColor} text-white shadow-sm`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`font-medium text-sm text-left ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                    {option.label}
                  </span>
                </div>

                <div className="flex flex-col items-end relative z-10 pl-2">
                  {(hasVoted || isExpired) ? (
                    <>
                      <span className="font-bold text-gray-900">{percentage}%</span>
                      <span className="text-[10px] text-gray-500 font-medium">{count} votes</span>
                    </>
                  ) : (
                    <div className={`w-4 h-4 rounded-full border-2 ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300 group-hover:border-gray-400'}`}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between mt-5 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-full">
            <Users className="w-3 h-3" />
            {totalVotes} Votes
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 px-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 gap-1.5 ${showComments ? 'bg-gray-100 text-gray-900' : ''}`}
              onClick={() => setShowComments(!showComments)}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs font-medium hidden sm:inline">{showComments ? "Hide" : "Comments"}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 gap-1.5"
              onClick={handleShare}
            >
              {isCopied ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4" />}
              <span className="text-xs font-medium hidden sm:inline">{isCopied ? "Copied" : "Share"}</span>
            </Button>
          </div>
        </div>

        {/* Comment Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
            <CommentSection pollId={poll.id} showWordLimit={poll.type === "REACTION_BASED"} />
          </div>
        )}

      </CardContent>
    </Card>
  );
}
