import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, Users, MessageSquare, Grid3X3, Edit3, Pause, Trash2, LogOut } from "lucide-react";
import { useState } from "react";

// Mock data for admin dashboard
const mockStats = {
  totalPolls: 1827,
  activePolls: 3,
  totalComments: 135,
  totalCards: 7
};

const mockPolls = [
  {
    id: "1",
    title: "नयाँ सरकारी नीति कस्तो लाग्यो?",
    description: "सरकारले ल्याएको नयाँ शिक्षा नीति बारे तपाईंको राय दिनुहोस्।",
    type: "political_rating",
    createdAt: "August 5, 2025 at 07:17 PM",
    totalVotes: 490,
    totalComments: 23,
    voteCounts: {
      excellent: 245,
      good: 89,
      poor: 156
    }
  },
  {
    id: "2", 
    title: "आजको मौसम कस्तो छ?",
    description: "काठमाडौंको आजको मौसम कस्तो लाग्यो तपाईंलाई?",
    type: "daily_rating",
    createdAt: "August 5, 2025 at 05:17 PM",
    totalVotes: 635,
    totalComments: 45,
    voteCounts: {
      gajjab: 312,
      bekar: 180,
      furious: 143
    }
  }
];

export default function Admin() {
  const { toast } = useToast();

  const handleEdit = (pollId: string) => {
    toast({
      title: "संशोधन",
      description: "पोल संशोधन गर्ने सुविधा छिट्टै आउँदैछ",
    });
  };

  const handlePause = (pollId: string) => {
    toast({
      title: "रोकियो",
      description: "पोल अस्थायी रूपमा रोकियो",
    });
  };

  const handleDelete = (pollId: string) => {
    toast({
      title: "मेटाइयो",
      description: "पोल सफलतापूर्वक मेटाइयो",
      variant: "destructive",
    });
  };

  const getTypeLabel = (type: string): string => {
    switch (type) {
      case "daily_rating": return "Daily Rating";
      case "political_rating": return "Politician Rating";
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">एडमिन ड्यासबोर्ड</h1>
        <Button variant="outline" className="flex items-center space-x-2 text-nepal-red border-nepal-red hover:bg-nepal-red hover:text-white">
          <LogOut className="w-4 h-4" />
          <span>व्यवस्थापक मोड</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-nepal-red" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{mockStats.totalPolls}</p>
                <p className="text-sm text-gray-600">कुल मत</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{mockStats.activePolls}</p>
                <p className="text-sm text-gray-600">सक्रिय पोस्ट</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{mockStats.totalComments}</p>
                <p className="text-sm text-gray-600">कुल टिप्पणी</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Grid3X3 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{mockStats.totalCards}</p>
                <p className="text-sm text-gray-600">कार्ड प्रकार</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">मत्तदात कार्डहरू</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">पोस्ट व्यवस्थापन</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">विश्लेषण</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">सुरक्षा</p>
        </div>
      </div>

      {/* All Posts Section */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">सबै पोस्टहरू</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockPolls.map((poll) => (
            <Card key={poll.id} className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{poll.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{poll.description}</p>
                    <div className="flex items-center space-x-4 mb-4">
                      <Badge className={`${getTypeBadgeColor(poll.type)} text-white text-xs`}>
                        {getTypeLabel(poll.type)}
                      </Badge>
                      <span className="text-xs text-gray-500">{poll.createdAt}</span>
                      <span className="text-xs text-gray-500">{poll.totalVotes} मत</span>
                      <span className="text-xs text-gray-500">{poll.totalComments} टिप्पणी</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => handleEdit(poll.id)}
                      variant="outline"
                      size="sm"
                      className="text-blue-600 border-blue-600 hover:bg-blue-50"
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      संशोधन
                    </Button>
                    <Button
                      onClick={() => handlePause(poll.id)}
                      variant="outline"
                      size="sm"
                      className="text-orange-600 border-orange-600 hover:bg-orange-50"
                    >
                      <Pause className="w-4 h-4 mr-1" />
                      पज
                    </Button>
                    <Button
                      onClick={() => handleDelete(poll.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      डिलिट
                    </Button>
                  </div>
                </div>

                {/* Vote Statistics */}
                <div className="grid grid-cols-3 gap-4">
                  {poll.type === "political_rating" ? (
                    <>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{poll.voteCounts.excellent}</p>
                        <p className="text-sm text-gray-600">गजब</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">{poll.voteCounts.good}</p>
                        <p className="text-sm text-gray-600">बेकार</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{poll.voteCounts.poor}</p>
                        <p className="text-sm text-gray-600">यस्तो नी हुन्छ गथे</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{poll.voteCounts.gajjab}</p>
                        <p className="text-sm text-gray-600">गजब</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">{poll.voteCounts.bekar}</p>
                        <p className="text-sm text-gray-600">बेकार</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{poll.voteCounts.furious}</p>
                        <p className="text-sm text-gray-600">यस्तो नी हुन्छ गथे</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
