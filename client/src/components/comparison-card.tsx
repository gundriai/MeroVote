import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { voteTracker } from "@/lib/vote-tracker";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { MessageSquare, ChevronDown, ChevronUp, Clock, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import CommentSection from "./comment-section";

interface ComparisonCardProps {
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

interface Candidate {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  voteCount: number;
}

export default function ComparisonCard({ poll }: ComparisonCardProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [hasVoted, setHasVoted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [showComments, setShowComments] = useState(false);

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
        setTimeRemaining(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [poll.expiresAt]);

  // Use candidates directly from poll data
  const candidates = (poll as any)?.candidates || [];
  const totalVotes = candidates.reduce((sum: number, candidate: any) => sum + candidate.voteCount, 0);

  // Simulate voting without API call
  const handleVoteAction = (candidateId: string) => {
    voteTracker.recordVote(poll.id);
    setHasVoted(true);
    toast({
      title: t('success'),
      description: t('vote_success'),
    });
  };

  const handleVote = (candidateId: string) => {
    if (hasVoted) {
      toast({
        title: t('info'),
        description: t('already_voted'),
      });
      return;
    }

    if (!poll.isActive || new Date() > new Date(poll.expiresAt)) {
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
        lightBg: "from-blue-50 to-indigo-50"
      },
      { 
        bg: "from-green-500 to-emerald-600", 
        border: "border-green-500", 
        text: "text-green-600", 
        progress: "bg-green-500",
        lightBg: "from-green-50 to-emerald-50"
      },
      { 
        bg: "from-orange-500 to-amber-600", 
        border: "border-orange-500", 
        text: "text-orange-600", 
        progress: "bg-orange-500",
        lightBg: "from-orange-50 to-amber-50"
      },
      { 
        bg: "from-purple-500 to-violet-600", 
        border: "border-purple-500", 
        text: "text-purple-600", 
        progress: "bg-purple-500",
        lightBg: "from-purple-50 to-violet-50"
      },
    ];
    return colors[index % colors.length];
  };

  const isExpired = new Date() > new Date(poll.expiresAt);

  return (
    <Card className="bg-white shadow-lg border-0 rounded-2xl overflow-hidden w-full">
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

      {/* Main Comparison Section */}
      <CardContent className="p-4 space-y-6">
        {/* Candidates Comparison */}
        <div className="space-y-4">
                     {candidates.length === 2 ? (
             <div className="flex flex-col md:flex-row gap-6 items-center">
              {/* First Candidate */}
              <div className="flex-1 w-full max-w-sm">
                <div className="text-center">
                  <div className="relative mb-4">
                                         <div className="w-24 h-24 md:w-32 md:h-32 mx-auto rounded-full overflow-hidden border-4 border-gray-200 shadow-lg hover:border-blue-500 transition-all duration-300">
                      {candidates[0].imageUrl ? (
                        <img 
                          src={candidates[0].imageUrl} 
                          alt={candidates[0].name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <span className="text-4xl">👤</span>
                        </div>
                      )}
                    </div>
                    {!hasVoted && !isExpired && (
                                             <Button
                         onClick={() => handleVote(candidates[0].id)}
                         className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm px-3 md:px-4 py-1 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                       >
                         {t('vote')}
                       </Button>
                    )}
                  </div>
                  
                                     <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                     {candidates[0].name}
                   </h4>
                   {candidates[0].description && (
                     <p className="text-xs md:text-sm text-gray-600 mb-3">
                       {candidates[0].description}
                     </p>
                   )}
                  
                                     {/* Vote Stats */}
                   <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 md:p-4 border border-blue-100">
                     <div className="text-xl md:text-2xl font-bold text-blue-600 mb-1">
                       {candidates[0].voteCount}
                     </div>
                     <div className="text-xs md:text-sm text-gray-600 mb-2">
                       {getPercentage(candidates[0].voteCount)}% of total votes
                     </div>
                     <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                       <div
                         className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                         style={{ width: `${getPercentage(candidates[0].voteCount)}%` }}
                       ></div>
                     </div>
                   </div>
                </div>
              </div>

                            {/* VS Section */}
              <div className="flex flex-col items-center justify-center py-4 md:py-0">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-3 md:p-4 shadow-lg">
                  <span className="text-2xl md:text-3xl font-black text-white">VS</span>
                </div>
                <div className="text-center mt-2">
                  <div className="text-xs md:text-sm text-gray-500 font-medium">{t('choose_favorite')}</div>
                </div>
              </div>

              {/* Second Candidate */}
              <div className="flex-1 w-full max-w-sm">
                <div className="text-center">
                  <div className="relative mb-4">
                                         <div className="w-24 h-24 md:w-32 md:h-32 mx-auto rounded-full overflow-hidden border-4 border-gray-200 shadow-lg hover:border-green-500 transition-all duration-300">
                      {candidates[1].imageUrl ? (
                        <img 
                          src={candidates[1].imageUrl} 
                          alt={candidates[1].name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <span className="text-4xl">👤</span>
                        </div>
                      )}
                    </div>
                    {!hasVoted && !isExpired && (
                                             <Button
                         onClick={() => handleVote(candidates[1].id)}
                         className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-600 hover:bg-green-700 text-white text-xs md:text-sm px-3 md:px-4 py-1 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                       >
                         {t('vote')}
                       </Button>
                    )}
                  </div>
                  
                                     <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                     {candidates[1].name}
                   </h4>
                   {candidates[1].description && (
                     <p className="text-xs md:text-sm text-gray-600 mb-3">
                       {candidates[1].description}
                     </p>
                   )}
                  
                                     {/* Vote Stats */}
                   <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 md:p-4 border border-green-100">
                     <div className="text-xl md:text-2xl font-bold text-green-600 mb-1">
                       {candidates[1].voteCount}
                     </div>
                     <div className="text-xs md:text-sm text-gray-600 mb-2">
                       {getPercentage(candidates[1].voteCount)}% of total votes
                     </div>
                     <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                       <div
                         className="bg-green-500 h-2 rounded-full transition-all duration-500"
                         style={{ width: `${getPercentage(candidates[1].voteCount)}%` }}
                       ></div>
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
                      <div className={`w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-gray-200 shadow-lg hover:border-${colorScheme.border} transition-all duration-300`}>
                        {candidate.imageUrl ? (
                          <img 
                            src={candidate.imageUrl} 
                            alt={candidate.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                            <span className="text-3xl">👤</span>
                          </div>
                        )}
                      </div>
                      {!isDisabled && (
                        <Button
                          onClick={() => handleVote(candidate.id)}
                          className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-${colorScheme.bg} text-white text-xs px-3 py-1 rounded-full shadow-lg hover:shadow-xl transition-all duration-300`}
                        >
                          {t('vote')}
                        </Button>
                      )}
                    </div>
                    
                    <h4 className="text-base font-semibold text-gray-900 mb-1">
                      {candidate.name}
                    </h4>
                    {candidate.description && (
                      <p className="text-xs text-gray-600 mb-2">
                        {candidate.description}
                      </p>
                    )}
                    
                    <div className={`bg-gradient-to-r ${colorScheme.lightBg} rounded-lg p-3 border border-${colorScheme.border}`}>
                      <div className={`text-lg font-bold ${colorScheme.text} mb-1`}>
                        {candidate.voteCount}
                      </div>
                      <div className="text-xs text-gray-600 mb-2">
                        {getPercentage(candidate.voteCount)}%
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`${colorScheme.progress} h-1.5 rounded-full transition-all duration-500`}
                          style={{ width: `${getPercentage(candidate.voteCount)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Voting Status */}
        {hasVoted && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <div className="text-green-800 font-medium">
              ✅ {t('already_voted')}
            </div>
                         <div className="text-green-600 text-sm mt-1">
               {t('thank_you_voting')}
             </div>
          </div>
        )}

        {/* Comment Toggle Button */}
        <div className="flex justify-center">
          <Button
            onClick={() => setShowComments(!showComments)}
            variant="outline"
            className="flex items-center gap-2 hover:bg-gray-50 px-6 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-300"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium">
              {showComments ? t('hide_comments') : t('show_comments')}
            </span>
            {showComments ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
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
  );
}
