import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Upload, User, Edit3 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { CreateCandidate } from "@/types/poll-creation.types";

interface CandidateWithId extends CreateCandidate {
  id: string;
}

interface CandidateManagerProps {
  candidates: CreateCandidate[];
  onCandidatesChange: (candidates: CreateCandidate[]) => void;
}

export default function CandidateManager({ candidates, onCandidatesChange }: CandidateManagerProps) {
  const { t } = useTranslation();
  const [editingCandidate, setEditingCandidate] = useState<CandidateWithId | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const addCandidate = () => {
    const newCandidate: CandidateWithId = {
      id: `candidate_${Date.now()}`,
      name: "",
      description: "",
      imageUrl: ""
    };
    setEditingCandidate(newCandidate);
    setShowAddForm(true);
  };

  const editCandidate = (candidate: CreateCandidate, index: number) => {
    const candidateWithId: CandidateWithId = {
      ...candidate,
      id: `existing_${index}`
    };
    setEditingCandidate(candidateWithId);
    setShowAddForm(true);
  };

  const saveCandidate = (candidateData: Partial<CandidateWithId>) => {
    if (!editingCandidate) return;

    const updatedCandidate = { ...editingCandidate, ...candidateData };
    
    // Convert to CreateCandidate format (remove id)
    const { id, ...candidateWithoutId } = updatedCandidate;
    
    if (editingCandidate.id.startsWith('candidate_')) {
      // New candidate - add to the end
      onCandidatesChange([...candidates, candidateWithoutId]);
    } else if (editingCandidate.id.startsWith('existing_')) {
      // Existing candidate - find by index and update
      const candidateIndex = parseInt(editingCandidate.id.split('_')[1]);
      const updatedCandidates = [...candidates];
      updatedCandidates[candidateIndex] = candidateWithoutId;
      onCandidatesChange(updatedCandidates);
    }
    
    setEditingCandidate(null);
    setShowAddForm(false);
  };

  const deleteCandidate = (candidateIndex: number) => {
    const updatedCandidates = candidates.filter((_, index) => index !== candidateIndex);
    onCandidatesChange(updatedCandidates);
  };

  const cancelEdit = () => {
    setEditingCandidate(null);
    setShowAddForm(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{t('admin.poll_creation.candidates', 'Candidates')}</CardTitle>
          <Button
            onClick={addCandidate}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('admin.poll_creation.add_candidate', 'Add Candidate')}
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          {t('admin.poll_creation.candidates_description', 'Add at least 2 candidates for comparison voting')}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Candidates List */}
        {candidates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {candidates.map((candidate, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      #{index + 1}
                    </Badge>
                    <h4 className="font-medium text-gray-900">
                      {candidate.name || t('admin.poll_creation.unnamed_candidate', 'Unnamed Candidate')}
                    </h4>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editCandidate(candidate, index)}
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteCandidate(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {candidate.imageUrl && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={candidate.imageUrl}
                        alt={candidate.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {candidate.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {candidate.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Form */}
        {showAddForm && editingCandidate && (
          <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
            <h4 className="font-medium text-gray-900 mb-4">
              {editingCandidate.id.startsWith('candidate_') 
                ? t('admin.poll_creation.add_candidate', 'Add Candidate')
                : t('admin.poll_creation.edit_candidate', 'Edit Candidate')
              }
            </h4>
            
            <CandidateForm
              candidate={editingCandidate}
              onSave={saveCandidate}
              onCancel={cancelEdit}
            />
          </div>
        )}

        {/* Empty State */}
        {candidates.length === 0 && !showAddForm && (
          <div className="text-center py-8">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('admin.poll_creation.no_candidates', 'No Candidates Added')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('admin.poll_creation.no_candidates_description', 'Add candidates to create a comparison poll')}
            </p>
            <Button onClick={addCandidate} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              {t('admin.poll_creation.add_first_candidate', 'Add First Candidate')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface CandidateFormProps {
  candidate: CandidateWithId;
  onSave: (candidateData: Partial<CandidateWithId>) => void;
  onCancel: () => void;
}

function CandidateForm({ candidate, onSave, onCancel }: CandidateFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: candidate.name,
    description: candidate.description,
    imageUrl: candidate.imageUrl
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert(t('admin.poll_creation.validation.candidate_name_required', 'Candidate name is required'));
      return;
    }
    onSave(formData);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="candidateName">{t('admin.poll_creation.candidate_name', 'Name')} *</Label>
        <Input
          id="candidateName"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder={t('admin.poll_creation.candidate_name_placeholder', 'Enter candidate name...')}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="candidateDescription">{t('admin.poll_creation.candidate_description', 'Description')}</Label>
        <Textarea
          id="candidateDescription"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder={t('admin.poll_creation.candidate_description_placeholder', 'Enter candidate description...')}
          className="mt-1"
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="candidateImageUrl">{t('admin.poll_creation.candidate_image_url', 'Image URL')}</Label>
        <div className="flex space-x-2 mt-1">
          <Input
            id="candidateImageUrl"
            value={formData.imageUrl}
            onChange={(e) => handleInputChange('imageUrl', e.target.value)}
            placeholder={t('admin.poll_creation.candidate_image_url_placeholder', 'https://example.com/photo.jpg')}
          />
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          {t('admin.poll_creation.cancel', 'Cancel')}
        </Button>
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
          {t('admin.poll_creation.save', 'Save')}
        </Button>
      </div>
    </div>
  );
}
