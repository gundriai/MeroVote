import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { voteTracker } from "@/lib/vote-tracker";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

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
  const { toast } = useToast();
  const [hasVoted, setHasVoted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");

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
    const interval = setInterval(updateTimeRemaining, 60000);

    return () => clearInterval(interval);
  }, [poll.expiresAt]);

  // Fetch poll with candidates
  const { data: pollData } = useQuery({
    queryKey: ["/api/polls", poll.id],
  });

  const candidates = pollData?.candidates || [];
  const totalVotes = candidates.reduce((sum: number, candidate: Candidate) => sum + candidate.voteCount, 0);

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async (candidateId: string) => {
      const fingerprint = voteTracker.getFingerprint();
      const response = await apiRequest("POST", "/api/votes", {
        pollId: poll.id,
        candidateId,
        fingerprint,
      });
      return response.json();
    },
    onSuccess: () => {
      voteTracker.recordVote(poll.id);
      setHasVoted(true);
      toast({
        title: "सफलता",
        description: "तपाईंको मत सफलतापूर्वक दर्ता भयो",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/polls", poll.id] });
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

  const handleVote = (candidateId: string) => {
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

    voteMutation.mutate(candidateId);
  };

  const getPercentage = (voteCount: number): number => {
    return totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
  };

  const getCandidateColor = (index: number): string => {
    const colors = [
      { bg: "from-blue-50 to-indigo-50", border: "border-nepal-blue", text: "text-nepal-blue", progress: "bg-nepal-blue" },
      { bg: "from-green-50 to-emerald-50", border: "border-green-500", text: "text-green-600", progress: "bg-green-500" },
      { bg: "from-orange-50 to-amber-50", border: "border-orange-500", text: "text-orange-600", progress: "bg-orange-500" },
      { bg: "from-purple-50 to-violet-50", border: "border-purple-500", text: "text-purple-600", progress: "bg-purple-500" },
    ];
    return colors[index % colors.length];
  };

  const isExpired = !poll.isActive || new Date() > new Date(poll.expiresAt);

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Badge className="bg-nepal-blue text-white text-xs">तुलना मतदान</Badge>
              <span className="text-sm text-gray-500">{timeRemaining}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{poll.title}</h3>
            {poll.description && (
              <p className="text-gray-600 text-sm mt-2">{poll.description}</p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Comparison Cards */}
        <div className={`grid gap-6 ${candidates.length <= 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2'}`}>
          {candidates.map((candidate: Candidate, index: number) => {
            const colorScheme = getCandidateColor(index);
            const percentage = getPercentage(candidate.voteCount);
            const isDisabled = hasVoted || isExpired || voteMutation.isPending;

            return (
              <div
                key={candidate.id}
                className={`comparison-card group cursor-pointer ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => !isDisabled && handleVote(candidate.id)}
              >
                <div className={`bg-gradient-to-br ${colorScheme.bg} rounded-xl p-6 border-2 border-transparent group-hover:${colorScheme.border} transition-all`}>
                  {candidate.imageUrl && (
                    <img 
                      src={candidate.imageUrl} 
                      alt={candidate.name}
                      className="w-full h-32 object-cover rounded-lg mb-4"
                    />
                  )}
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{candidate.name}</h4>
                  {candidate.description && (
                    <p className="text-sm text-gray-600 mb-4">{candidate.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${colorScheme.text}`}>
                      {candidate.voteCount} मत
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`${colorScheme.progress} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{percentage}%</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {candidates.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">कुनै उम्मेदवार भेटिएन</p>
          </div>
        )}

        {/* Vote Tracking Info */}
        <div className="bg-gray-50 rounded-lg p-4 mt-6">
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
