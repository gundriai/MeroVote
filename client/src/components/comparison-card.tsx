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
import PollSEO from "./PollSEO";
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

  const isExpired = new Date() > new Date(poll?.endDate);

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

      // Invalidate queries to refresh data immediately
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      queryClient.invalidateQueries({ queryKey: ['poll-stats'] });

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

        // Handle 401 specifically
        if (errorText.includes('401')) {
          toast({
            title: t('voting.auth_required_title', 'Authentication Required'),
            description: t('voting.session_expired', 'Your session has expired. Please login again.'),
            variant: 'destructive',
          });
          navigate('/login');
          return;
        }

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
          // Try to parse JSON error message if present
          // Format is usually "Status: JSON" or just "JSON"
          const jsonMatch = errorText.match(/(\{.*\})/);
          if (jsonMatch) {
            try {
              const errorObj = JSON.parse(jsonMatch[1]);
              if (errorObj.message) {
                errorMessage = errorObj.message;
              }
            } catch (e) {
              // Failed to parse JSON, fall back to simple split
              if (errorText.includes(':')) {
                const parts = errorText.split(':');
                if (parts.length > 1) {
                  errorMessage = parts.slice(1).join(':').trim();
                } else {
                  errorMessage = errorText;
                }
              } else {
                errorMessage = errorText;
              }
            }
          } else if (errorText.includes(':')) {
            // Fallback for non-JSON "Status: Message" format
            const parts = errorText.split(':');
            if (parts.length > 1) {
              errorMessage = parts.slice(1).join(':').trim();
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
    <Card className="w-full h-full flex flex-col bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 rounded-xl overflow-hidden">
      {/* Dynamic SEO Tags */}
      <PollSEO poll={poll} />
      
      {/* Countdown Banner - Optional, maybe keep it subtle or remove if using the header badge */}
      {/* Keeping it clean, moving time to header like VotingCard */}

      <CardHeader className="pb-3 pt-4 px-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Badge variant="secondary" className="rounded-md font-normal bg-blue-50 text-blue-700 hover:bg-blue-100 px-2 py-0.5">
                {t('comparison_voting')}
              </Badge>
              <span>•</span>
              <span className={`font-medium ${isExpired ? "text-red-500" : "text-green-600"}`}>{timeRemaining}</span>
            </div>
            <h3 className="font-bold text-lg leading-snug text-gray-900 line-clamp-2">{poll.title}</h3>
          </div>
          {/* VS Badge or Icon */}
          <div className="w-10 h-10 shrink-0 rounded-full bg-yellow-100 flex items-center justify-center border border-yellow-200">
            <Zap className="w-5 h-5 text-yellow-600" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col px-4 pb-4 pt-0">
        {poll.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">{poll.description}</p>
        )}

        {/* Candidates VS Layout */}
        <div className="flex-1 flex flex-col justify-center py-4">
          {candidates.length === 2 ? (
            (() => {
              const c1 = candidates[0];
              const c2 = candidates[1];
              let c1Scheme = {
                border: 'border-slate-500 ring-4 ring-slate-100',
                liquid: 'bg-slate-400/50',
                shadow: '0 0 20px rgba(148, 163, 184, 0.3)',
                crest: 'bg-slate-400/50',
                text: 'text-slate-700',
                btnBg: 'bg-slate-800 hover:bg-slate-900',
                btnText: 'text-white',
                btnShadow: 'shadow-slate-200',
                btnBorder: 'border-slate-200', // Not used in voted state but good to have
                btnHoverText: 'text-slate-700'
              };
              let c2Scheme = { ...c1Scheme };

              // Always calculate winner/loser colors since results are always shown
              if (true) {
                if (c1.voteCount > c2.voteCount) {
                  // C1 Wins -> Green
                  c1Scheme = {
                    border: 'border-green-500 ring-4 ring-green-100',
                    liquid: 'bg-green-400/50',
                    shadow: '0 0 20px rgba(74, 222, 128, 0.3)',
                    crest: 'bg-green-400/50',
                    text: 'text-green-700',
                    btnBg: 'bg-green-600 hover:bg-green-700',
                    btnText: 'text-white',
                    btnShadow: 'shadow-green-200',
                    btnBorder: 'border-green-200',
                    btnHoverText: 'text-green-700'
                  };
                  // C2 Loses -> Red
                  c2Scheme = {
                    border: 'border-red-500 ring-4 ring-red-100',
                    liquid: 'bg-red-400/50',
                    shadow: '0 0 20px rgba(248, 113, 113, 0.3)',
                    crest: 'bg-red-400/50',
                    text: 'text-red-700',
                    btnBg: 'bg-red-600 hover:bg-red-700',
                    btnText: 'text-white',
                    btnShadow: 'shadow-red-200',
                    btnBorder: 'border-red-200',
                    btnHoverText: 'text-red-700'
                  };
                } else if (c2.voteCount > c1.voteCount) {
                  // C2 Wins -> Green
                  c2Scheme = {
                    border: 'border-green-500 ring-4 ring-green-100',
                    liquid: 'bg-green-400/50',
                    shadow: '0 0 20px rgba(74, 222, 128, 0.3)',
                    crest: 'bg-green-400/50',
                    text: 'text-green-700',
                    btnBg: 'bg-green-600 hover:bg-green-700',
                    btnText: 'text-white',
                    btnShadow: 'shadow-green-200',
                    btnBorder: 'border-green-200',
                    btnHoverText: 'text-green-700'
                  };
                  // C1 Loses -> Red
                  c1Scheme = {
                    border: 'border-red-500 ring-4 ring-red-100',
                    liquid: 'bg-red-400/50',
                    shadow: '0 0 20px rgba(248, 113, 113, 0.3)',
                    crest: 'bg-red-400/50',
                    text: 'text-red-700',
                    btnBg: 'bg-red-600 hover:bg-red-700',
                    btnText: 'text-white',
                    btnShadow: 'shadow-red-200',
                    btnBorder: 'border-red-200',
                    btnHoverText: 'text-red-700'
                  };
                }
              }

              return (
                <div className="flex items-center justify-between gap-2 sm:gap-4 relative">
                  {/* Candidate 1 */}
                  <div className="flex-1 flex flex-col items-center text-center group">
                    <div className="relative mb-4">
                      {/* Image Container with Liquid Effect */}
                      <div className={`relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 shadow-lg transition-transform duration-300 group-hover:scale-105 z-0
                    ${poll.votedDetails.alreadyVoted && poll.pollOptions?.find(o => o.candidateId === candidates[0].id)?.id === poll.votedDetails.optionChosen
                          ? c1Scheme.border
                          : 'border-white ring-1 ring-gray-200'
                        }
                  `}>
                        {/* Background Image */}
                        {candidates[0].imageUrl ? (
                          <img src={candidates[0].imageUrl} alt={`${candidates[0].name} - Political candidate for polling`} className="w-full h-full object-cover relative z-10" />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-3xl relative z-10" role="img" aria-label={`${candidates[0].name} avatar`}>👤</div>
                        )}

                        {/* Liquid Wave Animation Layer */}
                        <div className="absolute inset-0 z-20 pointer-events-none">
                          <div
                            className={`absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out ${c1Scheme.liquid}`}
                            style={{
                              height: `${getPercentage(candidates[0].voteCount)}%`,
                              boxShadow: c1Scheme.shadow
                            }}
                          >
                            {/* Wave crest */}
                            <div className={`absolute -top-3 left-0 right-0 h-6 rounded-[100%] animate-wave ${c1Scheme.crest}`} style={{ transform: 'scaleX(1.5)' }}></div>
                          </div>
                        </div>
                      </div>

                      {/* Vote Percentage Badge (Moved outside) */}
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-30 bg-white shadow-sm border border-gray-100 rounded-full px-3 py-1 flex flex-col items-center min-w-[80px]">
                        <span className={`text-sm font-bold leading-none ${c1Scheme.text}`}>{getPercentage(candidates[0].voteCount)}%</span>
                        {/* <span className="text-[10px] text-gray-500 leading-none mt-0.5">{candidates[0].voteCount} votes</span> */}
                      </div>
                    </div>

                    <h4 className="font-bold text-gray-900 text-sm sm:text-base mb-1 line-clamp-1 mt-2">{candidates[0].name}</h4>

                    {/* Vote Button */}
                    <Button
                      onClick={() => handleVote(candidates[0].id)}
                      disabled={hasVoted || isExpired}
                      className={`mt-2 rounded-full px-6 transition-all duration-300
                    ${poll.votedDetails.alreadyVoted && poll.pollOptions?.find(o => o.candidateId === candidates[0].id)?.id === poll.votedDetails.optionChosen
                          ? `${c1Scheme.btnBg} ${c1Scheme.btnText} ${c1Scheme.btnShadow}`
                          : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300'
                        }
                    ${hasVoted || isExpired ? 'opacity-50 cursor-not-allowed' : 'shadow-md hover:shadow-lg hover:-translate-y-0.5'}
                  `}
                      size="sm"
                    >
                      {poll.votedDetails.alreadyVoted && poll.pollOptions?.find(o => o.candidateId === candidates[0].id)?.id === poll.votedDetails.optionChosen
                        ? <><Check className="w-4 h-4 mr-1" /> Voted</>
                        : "Vote"
                      }
                    </Button>
                  </div>

                  {/* VS Badge */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-orange-500 blur-xl opacity-50 rounded-full animate-pulse"></div>
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-xl border-4 border-white transform rotate-12 hover:rotate-0 transition-transform duration-300">
                        <span className="font-black text-white text-lg sm:text-2xl italic tracking-tighter drop-shadow-md">VS</span>
                      </div>
                    </div>
                  </div>

                  {/* Candidate 2 */}
                  <div className="flex-1 flex flex-col items-center text-center group">
                    <div className="relative mb-4">
                      {/* Image Container with Liquid Effect */}
                      <div className={`relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 shadow-lg transition-transform duration-300 group-hover:scale-105 z-0
                    ${poll.votedDetails.alreadyVoted && poll.pollOptions?.find(o => o.candidateId === candidates[1].id)?.id === poll.votedDetails.optionChosen
                          ? c2Scheme.border
                          : 'border-white ring-1 ring-gray-200'
                        }
                  `}>
                        {/* Background Image */}
                        {candidates[1].imageUrl ? (
                          <img src={candidates[1].imageUrl} alt={`${candidates[1].name} - Political candidate for polling`} className="w-full h-full object-cover relative z-10" />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-3xl relative z-10" role="img" aria-label={`${candidates[1].name} avatar`}>👤</div>
                        )}

                        {/* Liquid Wave Animation Layer */}
                        <div className="absolute inset-0 z-20 pointer-events-none">
                          <div
                            className={`absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out ${c2Scheme.liquid}`}
                            style={{
                              height: `${getPercentage(candidates[1].voteCount)}%`,
                              boxShadow: c2Scheme.shadow
                            }}
                          >
                            {/* Wave crest */}
                            <div className={`absolute -top-3 left-0 right-0 h-6 rounded-[100%] animate-wave ${c2Scheme.crest}`} style={{ transform: 'scaleX(1.5)' }}></div>
                          </div>
                        </div>
                      </div>

                      {/* Vote Percentage Badge (Moved outside) */}
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-30 bg-white shadow-sm border border-gray-100 rounded-full px-3 py-1 flex flex-col items-center min-w-[80px]">
                        <span className={`text-sm font-bold leading-none ${c2Scheme.text}`}>{getPercentage(candidates[1].voteCount)}%</span>
                        {/* <span className="text-[10px] text-gray-500 leading-none mt-0.5">{candidates[1].voteCount} votes</span> */}
                      </div>
                    </div>

                    <h4 className="font-bold text-gray-900 text-sm sm:text-base mb-1 line-clamp-1 mt-2">{candidates[1].name}</h4>

                    {/* Vote Button */}
                    <Button
                      onClick={() => handleVote(candidates[1].id)}
                      disabled={hasVoted || isExpired}
                      className={`mt-2 rounded-full px-6 transition-all duration-300
                    ${poll.votedDetails.alreadyVoted && poll.pollOptions?.find(o => o.candidateId === candidates[1].id)?.id === poll.votedDetails.optionChosen
                          ? `${c2Scheme.btnBg} ${c2Scheme.btnText} ${c2Scheme.btnShadow}`
                          : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300'
                        }
                    ${hasVoted || isExpired ? 'opacity-50 cursor-not-allowed' : 'shadow-md hover:shadow-lg hover:-translate-y-0.5'}
                  `}
                      size="sm"
                    >
                      {poll.votedDetails.alreadyVoted && poll.pollOptions?.find(o => o.candidateId === candidates[1].id)?.id === poll.votedDetails.optionChosen
                        ? <><Check className="w-4 h-4 mr-1" /> Voted</>
                        : "Vote"
                      }
                    </Button>
                  </div>
                </div>
              );
            })()
          ) : (
            // Fallback for >2 candidates (Grid Layout)
            <div className="grid grid-cols-2 gap-4">
              {candidates.map((candidate: Candidate, index: number) => {
                const percentage = getPercentage(candidate.voteCount);
                const isSelected = poll.votedDetails.alreadyVoted && poll.pollOptions?.find(option => option.candidateId === candidate.id)?.id === poll.votedDetails.optionChosen;
                const isDisabled = hasVoted || isExpired;

                return (
                  <div key={candidate.id} className="flex flex-col items-center text-center p-3 rounded-xl border border-gray-100 bg-gray-50/50">
                    <div className="relative w-16 h-16 mb-3">
                      <div className={`w-full h-full rounded-full overflow-hidden border-2 ${isSelected ? 'border-blue-500' : 'border-gray-200'}`}>
                        {candidate.imageUrl ? (
                          <img src={candidate.imageUrl} alt={`${candidate.name} - Political candidate profile`} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center" role="img" aria-label={`${candidate.name} avatar`}>👤</div>
                        )}
                      </div>
                      {isSelected && <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-0.5"><Check className="w-3 h-3" /></div>}
                    </div>
                    <h4 className="font-medium text-sm text-gray-900 line-clamp-1 mb-2">{candidate.name}</h4>

                    {/* Simple Progress Bar */}
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${percentage}%` }} />
                    </div>

                    <Button
                      size="sm"
                      variant={isSelected ? "default" : "outline"}
                      className="h-7 text-xs w-full"
                      onClick={() => handleVote(candidate.id)}
                      disabled={isDisabled}
                    >
                      {isDisabled ? `${percentage}%` : "Vote"}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between mt-5 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-full">
            <Users className="w-3 h-3" />
            {/* {totalVotes} Votes */}
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
            <CommentSection pollId={poll.id} showWordLimit={false} />
          </div>
        )}

      </CardContent>
    </Card>
  );
}

