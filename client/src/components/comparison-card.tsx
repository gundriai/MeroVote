import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { voteTracker } from "@/lib/vote-tracker";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
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

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        setTimeRemaining(t('days_left', { count: days }));
      } else if (hours > 0) {
        setTimeRemaining(t('hours_left', { count: hours }));
      } else {
        setTimeRemaining(t('minutes_left', { count: minutes }));
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000);

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
      { bg: "from-blue-50 to-indigo-50", border: "border-nepal-blue", text: "text-nepal-blue", progress: "bg-nepal-blue" },
      { bg: "from-green-50 to-emerald-50", border: "border-green-500", text: "text-green-600", progress: "bg-green-500" },
      { bg: "from-orange-50 to-amber-50", border: "border-orange-500", text: "text-orange-600", progress: "bg-orange-500" },
      { bg: "from-purple-50 to-violet-50", border: "border-purple-500", text: "text-purple-600", progress: "bg-purple-500" },
    ];
    return colors[index % colors.length];
  };

  const isExpired = new Date() > new Date(poll.expiresAt);

  return (
    <Card className="bg-white shadow-sm border border-gray-200 p-2 w-full h-full">
  <CardHeader className="pb-2">
    <div>
      <div className="flex items-center space-x-2 mb-2">
        <Badge className="bg-nepal-blue text-white text-xs">{t('comparison_voting')}</Badge>
        <span className="text-sm text-gray-500">{timeRemaining}</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{poll.title}</h3>
      {poll.description && (
        <p className="text-gray-600 text-sm mt-2">{poll.description}</p>
      )}
    </div>
  </CardHeader>

  <CardContent className="space-y-4 w-full h-full">
    {/* Comparison Cards */}
    <div className="flex flex-wrap justify-between gap-2 md:gap-4 items-center">
      {candidates.length === 2 ? (
        <>
          {/* First candidate */}
          <div className="flex-1 flex justify-end">
            {(() => {
              const candidate = candidates[0];
              const colorScheme = getCandidateColor(0);
              const isDisabled = hasVoted || isExpired;
              return (
                <div
                  key={candidate.id}
                  className={`comparison-card group cursor-pointer ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => !isDisabled && handleVote(candidate.id)}
                >
                  <div
                    className={`bg-gradient-to-br ${colorScheme.bg} rounded-xl border-2 border-transparent group-hover:${colorScheme.border} transition-all flex items-center justify-center overflow-hidden`}
                    style={{ width: 128, height: 128 }}
                  >
                    {candidate.imageUrl && (
                      <img 
                        src={candidate.imageUrl} 
                        alt={candidate.name}
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
          {/* VS Icon only on md+ screens */}
          <div className="hidden md:flex flex-col items-center mx-2 select-none">
            <span className="text-3xl font-extrabold text-yellow-500 drop-shadow-lg">⚡</span>
      <span className="text-lg font-bold text-gray-700 -mt-2 mb-1">VS</span>
            <span className="text-3xl font-extrabold text-yellow-500 drop-shadow-lg">⚡</span>
          </div>
          <div className="flex-1 flex justify-start">
            {/* Second candidate */}
            {(() => {
              const candidate = candidates[1];
              const colorScheme = getCandidateColor(1);
              const isDisabled = hasVoted || isExpired;
              return (
                <div
                  key={candidate.id}
                  className={`comparison-card group cursor-pointer ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => !isDisabled && handleVote(candidate.id)}
                >
                  <div
                    className={`bg-gradient-to-br ${colorScheme.bg} rounded-xl border-2 border-transparent group-hover:${colorScheme.border} transition-all flex items-center justify-center overflow-hidden`}
                    style={{ width: 128, height: 128 }}
                  >
                    {candidate.imageUrl && (
                      <img 
                        src={candidate.imageUrl} 
                        alt={candidate.name}
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </>
      ) : (
        candidates.map((candidate: Candidate, index: number) => {
          const colorScheme = getCandidateColor(index);
          const isDisabled = hasVoted || isExpired;
          return (
            <div
              key={candidate.id}
              className={`comparison-card group cursor-pointer ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => !isDisabled && handleVote(candidate.id)}
            >
              <div
                className={`bg-gradient-to-br ${colorScheme.bg} rounded-xl border-2 border-transparent group-hover:${colorScheme.border} transition-all flex items-center justify-center overflow-hidden`}
                style={{ width: 128, height: 128 }}
              >
                {candidate.imageUrl && (
                  <img 
                    src={candidate.imageUrl} 
                    alt={candidate.name}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            </div>
          );
        })
      )}
    </div>

    {/* Candidate Details Cards */}
    {/* <div className="bg-gray-50 rounded-lg py-2"> */}
      <div className="flex flex-wrap justify-between gap-2 md:gap-4">
        {candidates.map((candidate: Candidate, index: number) => {
          const colorScheme = getCandidateColor(index);
          const percentage = getPercentage(candidate.voteCount);
          return (
            <div
              key={candidate.id}
              className="bg-white rounded-lg border border-gray-200 flex flex-col items-center justify-center w-32 h-32"
            >
              <h4 className="text-base font-semibold text-gray-900 mb-1 text-center truncate w-full px-2">
                {candidate.name}
              </h4>
              {candidate.description && (
                <p className="text-xs text-gray-600 mb-1 text-center px-2 truncate w-full">
                  {candidate.description}
                </p>
              )}
              <span className={`text-sm font-medium ${colorScheme.text} mb-1`}>
                {candidate.voteCount} {t('vote')}
              </span>
              <div className="flex items-center justify-center w-full px-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${colorScheme.progress} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-600 ml-2">{percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>
    {/* </div> */}

    {/* Comment Toggle Button */}
    <Button
      onClick={() => setShowComments(!showComments)}
      variant="outline"
      className="flex items-center gap-2 hover:bg-gray-50 px-3 py-2 w-fit"
    >
      <MessageSquare className="w-4 h-4" />
      <span>{showComments ? t('hide_comments') : t('show_comments')}</span>
      {showComments ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
    </Button>

    {/* Comment Section */}
    {showComments && <CommentSection pollId={poll.id} showWordLimit={false} />}
  </CardContent>
</Card>

  );
}
