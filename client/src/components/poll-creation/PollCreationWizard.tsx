import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { PollType } from "@/data/mock-polls";
import PollTypeSelector from "./PollTypeSelector";
import PollCreationForm from "./PollCreationForm";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

type WizardStep = 'type-selection' | 'poll-configuration';

interface PollCreationWizardProps {
  onClose: () => void;
  onPollCreated?: (poll: any) => void;
}

export default function PollCreationWizard({ onClose, onPollCreated }: PollCreationWizardProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState<WizardStep>('type-selection');
  const [selectedType, setSelectedType] = useState<PollType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTypeSelect = (type: PollType) => {
    setSelectedType(type);
  };

  const handleNext = () => {
    if (selectedType) {
      setCurrentStep('poll-configuration');
    }
  };

  const handleBack = () => {
    setCurrentStep('type-selection');
    setSelectedType(null);
  };

  const handleSave = async (pollData: any) => {
    setIsLoading(true);
    
    try {
      // Create the poll with all related data in a single API call
      const response = await apiRequest('/api/polls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pollData),
      });

      if (response.ok) {
        const createdPoll = await response.json();
        
        toast({
          title: t('admin.poll_creation.success', 'Success'),
          description: t('admin.poll_creation.poll_created', 'Poll created successfully!'),
        });

        // If we have candidates, create poll options for them
        if (pollData.candidates && pollData.candidates.length > 0) {
          await createPollOptions(createdPoll.id, pollData.candidates);
        }

        // If we have vote options, create poll options for them
        if (pollData.voteOptions && pollData.voteOptions.length > 0) {
          await createVoteOptions(createdPoll.id, pollData.voteOptions);
        }

        onPollCreated?.(createdPoll);
        onClose();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create poll');
      }
    } catch (error) {
      console.error('Error creating poll:', error);
      toast({
        title: t('admin.poll_creation.error', 'Error'),
        description: t('admin.poll_creation.creation_failed', 'Failed to create poll. Please try again.'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createPollOptions = async (pollId: string, candidates: any[]) => {
    try {
      // First, create candidates
      const candidatePromises = candidates.map(candidate => 
        apiRequest('/api/candidates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: candidate.name,
            description: candidate.description,
            photo: candidate.imageUrl
          }),
        })
      );

      const candidateResponses = await Promise.all(candidatePromises);
      const createdCandidates = await Promise.all(
        candidateResponses.map(response => response.json())
      );

      // Then, create poll options for each candidate
      const pollOptionPromises = createdCandidates.map(candidate =>
        apiRequest('/api/poll-options', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pollId: pollId,
            candidateId: candidate.id,
            label: candidate.name
          }),
        })
      );

      await Promise.all(pollOptionPromises);
    } catch (error) {
      console.error('Error creating poll options:', error);
      // Don't throw here as the poll was created successfully
    }
  };

  const createVoteOptions = async (pollId: string, voteOptions: any[]) => {
    try {
      // For reaction-based polls, create poll options for each vote option
      const pollOptionPromises = voteOptions.map(option =>
        apiRequest('/api/poll-options', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pollId: pollId,
            label: option.label
          }),
        })
      );

      await Promise.all(pollOptionPromises);
    } catch (error) {
      console.error('Error creating vote options:', error);
      // Don't throw here as the poll was created successfully
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'type-selection':
        return (
          <PollTypeSelector
            selectedType={selectedType}
            onTypeSelect={handleTypeSelect}
            onNext={handleNext}
          />
        );
      
      case 'poll-configuration':
        return (
          <PollCreationForm
            pollType={selectedType!}
            onBack={handleBack}
            onSave={handleSave}
            isLoading={isLoading}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-gray-900">
              {t('admin.poll_creation.create_new_poll', 'Create New Poll')}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {renderCurrentStep()}
        </CardContent>
      </Card>
    </div>
  );
}
