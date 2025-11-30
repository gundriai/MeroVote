import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { voteTracker } from "@/lib/vote-tracker";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { MessageSquare, ChevronDown, ChevronUp, Clock, Users, TrendingUp, Zap, Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import CommentSection from "./comment-section";
import { AggregatedPoll } from "@/services/polls.service";
import { pollsService } from "@/services/polls.service";
import { PollVoteStatusMessages } from "@/enums";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

interface Candidate {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  voteCount: number;
}

export default function ComparisonCard(poll: AggregatedPoll) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [hasVoted, setHasVoted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // Check if user has voted (from API or locally)
  useEffect(() => {
    // Use API data if available, otherwise fallback to local storage
    setHasVoted(poll.votedDetails.alreadyVoted || voteTracker.hasVotedLocally(poll.id));
  }, [poll.id, poll.votedDetails.alreadyVoted]);

  // Calculate time remaining
  useEffect(() => {
    const updateTimeRemaining = () => {
      const now = new Date();
      const expires = new Date(poll?.endDate);
      const diff = expires.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining(t('poll_ended'));
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        setTimeRemaining(t('days_left', { count: days }));
      } else if (hours > 0) {
        setTimeRemaining(t('voting.hours_remaining', { count: hours, defaultValue: '{{count}}h left' }));
      } else {
        setTimeRemaining(t('voting.minutes_remaining', { count: minutes, defaultValue: '{{count}}m left' }));
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [poll?.endDate]);

  // Use candidates directly from poll data
  const candidates = (poll as any)?.candidates || [];
  const totalVotes = candidates.reduce((sum: number, candidate: any) => sum + candidate.voteCount, 0);

  // Real voting with API call
  const handleVoteAction = async (candidateId: string) => {
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
      // Find the poll option ID for this candidate
      const pollOption = poll.pollOptions?.find(option => option.candidateId === candidateId);
      if (!pollOption) {
        throw new Error('Poll option not found for this candidate');
      }

      await pollsService.voteOnPoll(poll.id, pollOption.id);

      voteTracker.recordVote(poll.id);
      setHasVoted(true);
      toast({
        title: t('success'),
        description: t('vote_success'),
      });
    } catch (error) {
      console.error('Error voting:', error);

      let errorMessage = t('vote_failed', 'मत दिन असफल');

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

  const handleVote = (candidateId: string) => {
    if (hasVoted) {
      toast({
        title: t('info'),
        description: t('already_voted'),
      });
      return;
    }

    if (new Date() > new Date(poll?.endDate)) {
      toast({
        title: t('info'),
        description: t('poll_ended'),
      });
      return;
    }

    handleVoteAction(candidateId);
  };

  const getPercentage = (voteCount: number): number => {
    return totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
  };

  const getCandidateColor = (index: number) => {
    const colors = [
      {
        bg: "from-blue-500 to-indigo-600",
        border: "border-blue-500",
        text: "text-blue-600",
        progress: "bg-blue-500",
        lightBg: "from-blue-50 to-indigo-50",
        waterFill: "from-blue-400 to-blue-600"
      },
      {
        bg: "from-green-500 to-emerald-600",
        border: "border-green-500",
        text: "text-green-600",
        progress: "bg-green-500",
        lightBg: "from-green-50 to-emerald-50",
        waterFill: "from-green-400 to-green-600"
      },
      {
        bg: "from-orange-500 to-amber-600",
        border: "border-orange-500",
        text: "text-orange-600",
        progress: "bg-orange-500",
        lightBg: "from-orange-50 to-amber-50",
        waterFill: "from-orange-400 to-orange-600"
      },
      {
        bg: "from-purple-500 to-violet-600",
        border: "border-purple-500",
        text: "text-purple-600",
        progress: "bg-purple-500",
        lightBg: "from-purple-50 to-violet-50",
        waterFill: "from-purple-400 to-purple-600"
      },
    ];
    return colors[index % colors.length];
  };

  const isExpired = new Date() > new Date(poll?.endDate);

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

  return (
    <div className="relative w-full h-full flex flex-col">
      <Card className="bg-white shadow-lg border-0 rounded-2xl overflow-hidden w-full h-full flex flex-col relative" style={{
        backgroundImage: 'url(/assets/Mero Vote.png)',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay',
        backgroundColor: 'rgba(255, 255, 255, 0.95)'
      }}>
        {/* Countdown Banner */}
        {!isExpired && (
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-3 md:px-4 py-2 md:py-3 text-center">
            <div className="text-white text-xs md:text-sm font-medium">
              {t('voting_ends_in')}: <span className="text-xl md:text-2xl font-bold text-yellow-200">{timeRemaining}</span>
            </div>
          </div>
        )}

        {/* Top Section - Poll Details */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-4 border-b border-gray-200">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1 rounded-full">
                  {t('comparison_voting')}
                </Badge>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">{timeRemaining}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{totalVotes} {t('vote')}</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                <span>{t('active')}</span>
              </div>
            </div>

            <div className="mt-3">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 leading-tight">
                {poll.title}
              </h3>
              {poll.description && (
                <p className="text-gray-600 text-xs md:text-sm mt-2 leading-relaxed">
                  {poll.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Main Comparison Section */}
        <CardContent className="p-4 space-y-6 flex-1 flex flex-col justify-between">
          {/* Candidates Comparison */}
          <div className="space-y-4">
            {candidates.length === 2 ? (
              <div className="flex flex-row gap-3 items-stretch">
                {/* First Candidate */}
                <div className="flex-1">
                  <div className="text-center h-full flex flex-col">
                    <div className="relative mb-3">
                      <div className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full overflow-hidden border-3 border-gray-200 shadow-lg hover:border-blue-500 transition-all duration-300 relative">
                        {candidates[0].imageUrl ? (
                          <img
                            src={candidates[0].imageUrl}
                            alt={candidates[0].name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                            <span className="text-2xl md:text-3xl">👤</span>
                          </div>
                        )}
                        {/* Check if this candidate was chosen */}
                        {poll.votedDetails.alreadyVoted && poll.pollOptions?.find(option => option.candidateId === candidates[0].id)?.id === poll.votedDetails.optionChosen && (
                          <div className="absolute inset-0 bg-green-500 bg-opacity-80 flex items-center justify-center rounded-full">
                            <span className="text-white font-bold text-xs">VOTED</span>
                          </div>
                        )}
                      </div>
                      {!hasVoted && !isExpired && (
                        <Button
                          onClick={() => handleVote(candidates[0].id)}
                          className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 md:px-3 py-1 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          {t('vote')}
                        </Button>
                      )}
                    </div>

                    <h4 className="text-sm md:text-base font-semibold text-gray-900 mb-2">
                      {candidates[0].name}
                    </h4>
                    {candidates[0].description && (
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {candidates[0].description}
                      </p>
                    )}

                    {/* Water Filling Effect - Vote Stats */}
                    <div className="flex-1 flex flex-col justify-end">
                      <div className="relative h-20 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        {/* Water filling effect */}
                        <div
                          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${getCandidateColor(0).waterFill} transition-all duration-1000 ease-out`}
                          style={{ height: `${getPercentage(candidates[0].voteCount)}%` }}
                        />
                        {/* Vote count overlay */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white font-bold">
                          <div className="text-lg md:text-xl drop-shadow-lg">
                            {candidates[0].voteCount}
                          </div>
                          <div className="text-xs drop-shadow-lg">
                            {getPercentage(candidates[0].voteCount)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* VS Section */}
                <div className="flex flex-col items-center justify-center px-2">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-2 md:p-3 shadow-lg">
                    <Zap className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                </div>

                {/* Second Candidate */}
                <div className="flex-1">
                  <div className="text-center h-full flex flex-col">
                    <div className="relative mb-3">
                      <div className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full overflow-hidden border-3 border-gray-200 shadow-lg hover:border-green-500 transition-all duration-300 relative">
                        {candidates[1].imageUrl ? (
                          <img
                            src={candidates[1].imageUrl}
                            alt={candidates[1].name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                            <span className="text-2xl md:text-3xl">👤</span>
                          </div>
                        )}
                        {/* Check if this candidate was chosen */}
                        {poll.votedDetails.alreadyVoted && poll.pollOptions?.find(option => option.candidateId === candidates[1].id)?.id === poll.votedDetails.optionChosen && (
                          <div className="absolute inset-0 bg-green-500 bg-opacity-80 flex items-center justify-center rounded-full">
                            <span className="text-white font-bold text-xs">VOTED</span>
                          </div>
                        )}
                      </div>
                      {!hasVoted && !isExpired && (
                        <Button
                          onClick={() => handleVote(candidates[1].id)}
                          className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-green-600 hover:bg-green-700 text-white text-xs px-2 md:px-3 py-1 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          {t('vote')}
                        </Button>
                      )}
                    </div>

                    <h4 className="text-sm md:text-base font-semibold text-gray-900 mb-2">
                      {candidates[1].name}
                    </h4>
                    {candidates[1].description && (
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {candidates[1].description}
                      </p>
                    )}

                    {/* Water Filling Effect - Vote Stats */}
                    <div className="flex-1 flex flex-col justify-end">
                      <div className="relative h-20 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        {/* Water filling effect */}
                        <div
                          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${getCandidateColor(1).waterFill} transition-all duration-1000 ease-out`}
                          style={{ height: `${getPercentage(candidates[1].voteCount)}%` }}
                        />
                        {/* Vote count overlay */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white font-bold">
                          <div className="text-lg md:text-xl drop-shadow-lg">
                            {candidates[1].voteCount}
                          </div>
                          <div className="text-xs drop-shadow-lg">
                            {getPercentage(candidates[1].voteCount)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Handle more than 2 candidates
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {candidates.map((candidate: Candidate, index: number) => {
                  const colorScheme = getCandidateColor(index);
                  const isDisabled = hasVoted || isExpired;
                  return (
                    <div key={candidate.id} className="text-center">
                      <div className="relative mb-3">
                        <div className={`w-20 h-20 mx-auto rounded-full overflow-hidden border-3 border-gray-200 shadow-lg hover:border-${colorScheme.border} transition-all duration-300`}>
                          {candidate.imageUrl ? (
                            <img
                              src={candidate.imageUrl}
                              alt={candidate.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                              <span className="text-2xl">👤</span>
                            </div>
                          )}
                        </div>
                        {!isDisabled && (
                          <Button
                            onClick={() => handleVote(candidate.id)}
                            className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-${colorScheme.bg} text-white text-xs px-2 py-1 rounded-full shadow-lg hover:shadow-xl transition-all duration-300`}
                          >
                            {t('vote')}
                          </Button>
                        )}
                      </div>

                      <h4 className="text-sm font-semibold text-gray-900 mb-1">
                        {candidate.name}
                      </h4>
                      {candidate.description && (
                        <p className="text-xs text-gray-600 mb-2">
                          {candidate.description}
                        </p>
                      )}

                      {/* Water Filling Effect for multiple candidates */}
                      <div className="relative h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        <div
                          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${colorScheme.waterFill} transition-all duration-1000 ease-out`}
                          style={{ height: `${getPercentage(candidate.voteCount)}%` }}
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white font-bold">
                          <div className="text-sm drop-shadow-lg">
                            {candidate.voteCount}
                          </div>
                          <div className="text-xs drop-shadow-lg">
                            {getPercentage(candidate.voteCount)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Voting Status */}
          {/* {hasVoted && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <div className="text-green-800 font-medium">
              ✅ {t('already_voted')}
            </div>
            <div className="text-green-600 text-sm mt-1">
              {t('thank_you_voting')}
            </div>
          </div>
        )} */}

          {/* Comment Toggle and Share Button */}
          <div className="flex items-center gap-2 mb-4">
            <Button
              onClick={() => setShowComments(!showComments)}
              variant="outline"
              className="flex-1 flex items-center justify-center space-x-2 hover:bg-gray-50"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{showComments ? "टिप्पणी लुकाउनुहोस्" : "टिप्पणी देखाउनुहोस्"}</span>
              {showComments ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>

            <Button
              variant="outline"
              className={`flex items-center gap-2 transition-all duration-300 ${isCopied ? 'bg-green-50 text-green-600 border-green-200' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              onClick={handleShare}
            >
              {isCopied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              <span className="text-sm font-medium">{isCopied ? "Copied" : "Share"}</span>
            </Button>
          </div>

          {/* Comment Section */}
          {showComments && (
            <div className="border-t border-gray-100 pt-4">
              <CommentSection pollId={poll.id} showWordLimit={false} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

