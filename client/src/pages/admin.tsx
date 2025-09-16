import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, Users, MessageSquare, Grid3X3, Edit3, Pause, Trash2, LogOut, Home, Shield, Settings, PieChart, Plus, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import Header from "@/components/header";
import { useTranslation } from "react-i18next";
import PollCreationWizard from "@/components/poll-creation/PollCreationWizard";
import { useAdmin } from "@/hooks/use-admin";
import { AggregatedPoll } from "@/services/polls.service";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export default function Admin() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("posts");
  const [showPollCreation, setShowPollCreation] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPoll, setEditingPoll] = useState<AggregatedPoll | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    endDate: ''
  });
  
  // Use admin hook to fetch real data
  const { 
    stats, 
    polls, 
    isLoading, 
    error, 
    refetch, 
    togglePollVisibility, 
    deletePoll,
    updatePoll
  } = useAdmin();

  const handleEdit = (pollId: string) => {
    const poll = polls.find(p => p.id === pollId);
    if (poll) {
      setEditingPoll(poll);
      setEditFormData({
        title: poll.title,
        description: poll.description || '',
        endDate: new Date(poll.endDate).toISOString().slice(0, 16) // Format for datetime-local input
      });
      setShowEditModal(true);
    }
  };

  const handlePause = async (pollId: string) => {
    try {
      await togglePollVisibility(pollId);
      toast({
        title: t('admin.polls.status.paused'),
        description: t('admin.polls.messages.paused', 'Poll visibility has been toggled'),
      });
    } catch (error) {
      toast({
        title: t('admin.polls.actions.error'),
        description: t('admin.polls.messages.toggle_failed', 'Failed to toggle poll visibility'),
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (pollId: string) => {
    try {
      await deletePoll(pollId);
      toast({
        title: t('admin.polls.actions.delete'),
        description: t('admin.polls.messages.deleted', 'Poll has been deleted successfully'),
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: t('admin.polls.actions.error'),
        description: t('admin.polls.messages.delete_failed', 'Failed to delete poll'),
        variant: "destructive",
      });
    }
  };

  const handleEditSubmit = async () => {
    if (!editingPoll) return;
    
    try {
      await updatePoll(editingPoll.id, {
        title: editFormData.title,
        description: editFormData.description,
        endDate: new Date(editFormData.endDate).toISOString()
      });
      
      toast({
        title: t('admin.polls.actions.success'),
        description: t('admin.polls.messages.updated', 'Poll has been updated successfully'),
      });
      
      setShowEditModal(false);
      setEditingPoll(null);
    } catch (error) {
      toast({
        title: t('admin.polls.actions.error'),
        description: t('admin.polls.messages.update_failed', 'Failed to update poll'),
        variant: "destructive",
      });
    }
  };

  const getTypeLabel = (type: string): string => {
    switch (type) {
      case "REACTION_BASED": return t('admin.polls.types.reaction_based', 'Reaction-Based');
      case "ONE_VS_ONE": return t('admin.polls.types.one_vs_one', 'One vs One');
      default: return t('admin.polls.types.default', 'Vote');
    }
  };

  const getTypeBadgeColor = (type: string): string => {
    switch (type) {
      case "REACTION_BASED": return "bg-green-600";
      case "ONE_VS_ONE": return "bg-blue-600";
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
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-gray-900">{t('admin.polls.all_posts', 'All Posts')}</CardTitle>
                <Button
                  onClick={() => setShowPollCreation(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('admin.polls.new_poll', 'New Poll')}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="text-gray-500 mt-2">{t('admin.loading', 'Loading polls...')}</p>
                </div>
              ) : polls.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">{t('admin.no_polls', 'No polls found')}</p>
                </div>
              ) : (
                polls.map((poll: AggregatedPoll) => (
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
                          {poll.isHidden && (
                            <Badge className="bg-orange-500 text-white text-xs">
                              {t('admin.polls.status.paused', 'Paused')}
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500">{formatDate(poll.createdAt)}</span>
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
                          className={`${poll.isHidden ? 'text-green-600 border-green-600 hover:bg-green-50' : 'text-orange-600 border-orange-600 hover:bg-orange-50'}`}
                        >
                          {poll.isHidden ? (
                            <>
                              <Pause className="w-4 h-4 mr-1" />
                              {t('admin.polls.actions.resume', 'Resume')}
                            </>
                          ) : (
                            <>
                              <Pause className="w-4 h-4 mr-1" />
                              {t('admin.polls.actions.pause')}
                            </>
                          )}
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
                      {poll.pollOptions && poll.pollOptions.length > 0 ? (
                        poll.pollOptions.slice(0, 3).map((option, index) => (
                          <div key={option.id} className="text-center">
                            <p className="text-2xl font-bold text-gray-600">{option.voteCount}</p>
                            <p className="text-sm text-gray-600">{option.label}</p>
                          </div>
                        ))
                      ) : poll.voteCounts ? (
                        Object.entries(poll.voteCounts).slice(0, 3).map(([key, value], index) => (
                          <div key={key} className="text-center">
                            <p className="text-2xl font-bold text-gray-600">{value}</p>
                            <p className="text-sm text-gray-600">{key}</p>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-3 text-center text-gray-500">
                          {t('admin.polls.no_votes', 'No votes yet')}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                ))
              )}
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
        <Header stats={{
          totalVotes: stats?.totalVotes || 0,
          activeVoters: Math.floor((stats?.totalVotes || 0) * 0.4),
          activePolls: stats?.activePolls || 0
        }} />
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
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalPolls || 0}</p>
                  <p className="text-sm text-gray-600">{t('admin.stats.total_polls', 'Total Polls')}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{stats?.activePolls || 0}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalComments || 0}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalVotes || 0}</p>
                  <p className="text-sm text-gray-600">{t('admin.stats.total_votes', 'Total Votes')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Header with Refresh Button */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.title', 'Admin Dashboard')}</h1>
          <div className="flex space-x-2">
            <Button
              onClick={refetch}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {t('admin.refresh', 'Refresh')}
            </Button>
            <Button
              onClick={() => setShowPollCreation(true)}
              className="bg-nepal-red hover:bg-red-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('admin.create_poll', 'Create Poll')}
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

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

      {/* Poll Creation Wizard */}
      {showPollCreation && (
        <PollCreationWizard
          onClose={() => setShowPollCreation(false)}
          onPollCreated={(poll) => {
            console.log('Poll created:', poll);
            // Refresh the polls list
            refetch();
            setShowPollCreation(false);
            toast({
              title: t('admin.polls.actions.success'),
              description: t('admin.polls.messages.created', 'Poll created successfully'),
            });
          }}
        />
      )}

      {/* Edit Poll Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('admin.polls.actions.edit', 'Edit Poll')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">{t('admin.polls.form.title', 'Title')}</Label>
              <Input
                id="title"
                value={editFormData.title}
                onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder={t('admin.polls.form.title_placeholder', 'Enter poll title')}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">{t('admin.polls.form.description', 'Description')}</Label>
              <Textarea
                id="description"
                value={editFormData.description}
                onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={t('admin.polls.form.description_placeholder', 'Enter poll description')}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endDate">{t('admin.polls.form.end_date', 'End Date')}</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={editFormData.endDate}
                onChange={(e) => setEditFormData(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button onClick={handleEditSubmit}>
              {t('admin.polls.actions.save', 'Save Changes')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
