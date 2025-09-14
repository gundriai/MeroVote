import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Trash2, Upload, ArrowLeft, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PollType, PollCategories } from "@/data/mock-polls";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import CandidateManager from "./CandidateManager";
import VoteOptionsManager from "./VoteOptionsManager";
import { CreateComprehensivePoll, CreateCandidate, CreateVoteOption } from "@/types/poll-creation.types";

interface PollCreationFormProps {
  pollType: PollType;
  onBack: () => void;
  onSave: (pollData: CreateComprehensivePoll) => void;
  isLoading?: boolean;
}

export default function PollCreationForm({ pollType, onBack, onSave, isLoading = false }: PollCreationFormProps) {
  const { t } = useTranslation();
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: [] as PollCategories[],
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    mediaUrl: "",
    isHidden: false,
    createdBy: undefined // This would come from auth context
  });

  // Dynamic state based on poll type
  const [candidates, setCandidates] = useState<CreateCandidate[]>([]);
  const [voteOptions, setVoteOptions] = useState<CreateVoteOption[]>([]);

  // UI state
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCategoryChange = (category: PollCategories, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      category: checked 
        ? [...prev.category, category]
        : prev.category.filter(c => c !== category)
    }));
  };

  const handleSave = () => {
    // Validate required fields
    if (!formData.title.trim()) {
      alert(t('admin.poll_creation.validation.title_required', 'Title is required'));
      return;
    }

    if (!formData.description.trim()) {
      alert(t('admin.poll_creation.validation.description_required', 'Description is required'));
      return;
    }

    if (formData.category.length === 0) {
      alert(t('admin.poll_creation.validation.category_required', 'At least one category is required'));
      return;
    }

    // Validate poll type specific requirements
    if (pollType === PollType.ONE_VS_ONE && candidates.length < 2) {
      alert(t('admin.poll_creation.validation.candidates_required', 'At least 2 candidates are required for One vs One polls'));
      return;
    }

    if (pollType === PollType.REACTION_BASED && voteOptions.length === 0) {
      alert(t('admin.poll_creation.validation.vote_options_required', 'At least one vote option is required for Reaction-Based polls'));
      return;
    }

    // Prepare comprehensive poll data for API
    const pollData: CreateComprehensivePoll = {
      title: formData.title,
      description: formData.description,
      type: pollType,
      category: formData.category,
      startDate: formData.startDate.toISOString(),
      endDate: formData.endDate.toISOString(),
      mediaUrl: formData.mediaUrl,
      createdBy: formData.createdBy || undefined,
      isHidden: formData.isHidden,
      candidates: pollType === PollType.ONE_VS_ONE ? candidates : undefined,
      voteOptions: pollType === PollType.REACTION_BASED ? voteOptions : undefined,
      comments: [] // Initialize with empty comments
    };

    onSave(pollData);
  };

  const getPollTypeTitle = () => {
    switch (pollType) {
      case PollType.REACTION_BASED:
        return t('admin.poll_creation.reaction_based.title', 'Reaction-Based Poll');
      case PollType.ONE_VS_ONE:
        return t('admin.poll_creation.one_vs_one.title', 'One vs One Poll');
      default:
        return t('admin.poll_creation.configure_poll', 'Configure Poll');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('admin.poll_creation.back', 'Back')}</span>
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {getPollTypeTitle()}
            </h2>
            <p className="text-gray-600">
              {t('admin.poll_creation.configure_description', 'Configure your poll settings and content')}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-sm">
          {pollType}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('admin.poll_creation.basic_info', 'Basic Information')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">{t('admin.poll_creation.title', 'Poll Title')} *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder={t('admin.poll_creation.title_placeholder', 'Enter poll title...')}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">{t('admin.poll_creation.description', 'Description')} *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder={t('admin.poll_creation.description_placeholder', 'Enter poll description...')}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="mediaUrl">{t('admin.poll_creation.media_url', 'Media URL')}</Label>
                <div className="flex space-x-2 mt-1">
                  <Input
                    id="mediaUrl"
                    value={formData.mediaUrl}
                    onChange={(e) => handleInputChange('mediaUrl', e.target.value)}
                    placeholder={t('admin.poll_creation.media_url_placeholder', 'https://example.com/image.jpg')}
                  />
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Poll Type Specific Configuration */}
          {pollType === PollType.ONE_VS_ONE && (
            <CandidateManager
              candidates={candidates}
              onCandidatesChange={setCandidates}
            />
          )}

          {pollType === PollType.REACTION_BASED && (
            <VoteOptionsManager
              voteOptions={voteOptions}
              onVoteOptionsChange={setVoteOptions}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('admin.poll_creation.categories', 'Categories')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.values(PollCategories).map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={category}
                    checked={formData.category.includes(category)}
                    onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                  />
                  <Label htmlFor={category} className="text-sm">
                    {t(`home.categories.${category.toLowerCase()}`, category)}
                  </Label>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('admin.poll_creation.schedule', 'Schedule')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{t('admin.poll_creation.start_date', 'Start Date')}</Label>
                <Popover open={showStartDatePicker} onOpenChange={setShowStartDatePicker}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !formData.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? format(formData.startDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) => {
                        if (date) {
                          handleInputChange('startDate', date);
                          setShowStartDatePicker(false);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>{t('admin.poll_creation.end_date', 'End Date')}</Label>
                <Popover open={showEndDatePicker} onOpenChange={setShowEndDatePicker}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !formData.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate ? format(formData.endDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) => {
                        if (date) {
                          handleInputChange('endDate', date);
                          setShowEndDatePicker(false);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('admin.poll_creation.settings', 'Settings')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isHidden"
                  checked={formData.isHidden}
                  onCheckedChange={(checked) => handleInputChange('isHidden', checked)}
                />
                <Label htmlFor="isHidden" className="text-sm">
                  {t('admin.poll_creation.hide_poll', 'Hide poll from public view')}
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
        >
          {t('admin.poll_creation.cancel', 'Cancel')}
        </Button>
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              {t('admin.poll_creation.saving', 'Saving...')}
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {t('admin.poll_creation.create_poll', 'Create Poll')}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
