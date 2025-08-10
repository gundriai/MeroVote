import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, Users, MessageSquare, Grid3X3, Edit3, Pause, Trash2, LogOut, Home, Shield, Settings, PieChart } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import Header from "@/components/header";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("posts");
  const stats = { activeVoters: 1234 };

  const handleEdit = (pollId: string) => {
    toast({
      title: t('admin.polls.actions.edit'),
      description: t('admin.polls.messages.edit_coming_soon', 'Poll editing feature coming soon'),
    });
  };

  const handlePause = (pollId: string) => {
    toast({
      title: t('admin.polls.status.paused'),
      description: t('admin.polls.messages.paused', 'Poll has been paused'),
    });
  };

  const handleDelete = (pollId: string) => {
    toast({
      title: t('admin.polls.actions.delete'),
      description: t('admin.polls.messages.deleted', 'Poll has been deleted successfully'),
      variant: "destructive",
    });
  };

  const getTypeLabel = (type: string): string => {
    switch (type) {
      case "daily_rating": return t('admin.polls.types.daily_rating', 'Daily Rating');
      case "political_rating": return t('admin.polls.types.political_rating', 'Politician Rating');
      default: return t('admin.polls.types.default', 'Vote');
    }
  };

  const getTypeBadgeColor = (type: string): string => {
    switch (type) {
      case "daily_rating": return "bg-nepal-orange";
      case "political_rating": return "bg-purple-600";
      default: return "bg-gray-600";
    }
  };

  const tabs = [
    { id: "cards", label: t('admin.navigation.cards', 'Voter Cards'), icon: Grid3X3 },
    { id: "posts", label: t('admin.navigation.polls', 'Poll Management'), icon: Settings },
    { id: "analytics", label: t('admin.navigation.analytics', 'Analytics'), icon: PieChart },
    { id: "security", label: t('admin.navigation.security', 'Security'), icon: Shield },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "cards":
        return (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">{t('admin.navigation.cards')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Grid3X3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">{t('admin.messages.feature_coming_soon', 'Card management feature coming soon')}</p>
              </div>
            </CardContent>
          </Card>
        );
      case "analytics":
        return (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">{t('admin.navigation.analytics')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <PieChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">{t('admin.messages.analytics_coming_soon', 'Detailed analytics feature coming soon')}</p>
              </div>
            </CardContent>
          </Card>
        );
      case "security":
        return (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">{t('admin.navigation.security')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">{t('admin.messages.security_coming_soon', 'Security settings feature coming soon')}</p>
              </div>
            </CardContent>
          </Card>
        );
      case "posts":
      default:
        return (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">{t('admin.polls.all_posts', 'All Posts')}</CardTitle>
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
                          <span className="text-xs text-gray-500">{poll.totalVotes} {t('admin.polls.votes', 'votes')}</span>
                          <span className="text-xs text-gray-500">{poll.totalComments} {t('admin.polls.comments', 'comments')}</span>
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
                          {t('admin.polls.actions.edit')}
                        </Button>
                        <Button
                          onClick={() => handlePause(poll.id)}
                          variant="outline"
                          size="sm"
                          className="text-orange-600 border-orange-600 hover:bg-orange-50"
                        >
                          <Pause className="w-4 h-4 mr-1" />
                          {t('admin.polls.actions.pause')}
                        </Button>
                        <Button
                          onClick={() => handleDelete(poll.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          {t('admin.polls.actions.delete')}
                        </Button>
                      </div>
                    </div>

                    {/* Vote Statistics */}
                    <div className="grid grid-cols-3 gap-4">
                      {poll.type === "political_rating" ? (
                        <>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{poll.voteCounts.excellent}</p>
                            <p className="text-sm text-gray-600">{t('admin.polls.ratings.excellent', 'Excellent')}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-orange-600">{poll.voteCounts.good}</p>
                            <p className="text-sm text-gray-600">{t('admin.polls.ratings.good', 'Good')}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-red-600">{poll.voteCounts.poor}</p>
                            <p className="text-sm text-gray-600">{t('admin.polls.ratings.poor', 'Poor')}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{poll.voteCounts.gajjab}</p>
                            <p className="text-sm text-gray-600">{t('admin.polls.ratings.excellent', 'Excellent')}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-orange-600">{poll.voteCounts.bekar}</p>
                            <p className="text-sm text-gray-600">{t('admin.polls.ratings.good', 'Good')}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-red-600">{poll.voteCounts.furious}</p>
                            <p className="text-sm text-gray-600">{t('admin.polls.ratings.poor', 'Poor')}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header stats={stats} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  <p className="text-sm text-gray-600">{t('admin.stats.total_votes', 'Total Votes')}</p>
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
                  <p className="text-sm text-gray-600">{t('admin.stats.active_polls', 'Active Polls')}</p>
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
                  <p className="text-sm text-gray-600">{t('admin.stats.total_comments', 'Total Comments')}</p>
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
                  <p className="text-sm text-gray-600">{t('admin.stats.card_types', 'Card Types')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 p-1 bg-white rounded-lg border border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                variant={activeTab === tab.id ? "default" : "ghost"}
                className={`flex items-center space-x-2 px-4 py-2 ${
                  activeTab === tab.id
                    ? "bg-nepal-red text-white hover:bg-red-700"
                    : "text-gray-600 hover:text-nepal-red hover:bg-gray-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </main>
    </div>
  );
}
