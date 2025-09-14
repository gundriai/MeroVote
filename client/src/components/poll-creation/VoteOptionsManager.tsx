import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, ThumbsUp, ThumbsDown, Flame, Star, Minus, Heart, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { CreateVoteOption } from "@/types/poll-creation.types";

interface VoteOption extends CreateVoteOption {
  id?: string;
  type: string;
}

interface VoteOptionsManagerProps {
  voteOptions: CreateVoteOption[];
  onVoteOptionsChange: (options: CreateVoteOption[]) => void;
}

const DEFAULT_ICONS = [
  { value: "thumbs-up", label: "Thumbs Up", icon: ThumbsUp },
  { value: "thumbs-down", label: "Thumbs Down", icon: ThumbsDown },
  { value: "flame", label: "Flame", icon: Flame },
  { value: "star", label: "Star", icon: Star },
  { value: "minus", label: "Minus", icon: Minus },
  { value: "heart", label: "Heart", icon: Heart },
  { value: "zap", label: "Zap", icon: Zap },
];

const DEFAULT_COLORS = [
  { value: "green", label: "Green", class: "text-green-600 bg-green-100" },
  { value: "red", label: "Red", class: "text-red-600 bg-red-100" },
  { value: "blue", label: "Blue", class: "text-blue-600 bg-blue-100" },
  { value: "yellow", label: "Yellow", class: "text-yellow-600 bg-yellow-100" },
  { value: "purple", label: "Purple", class: "text-purple-600 bg-purple-100" },
  { value: "orange", label: "Orange", class: "text-orange-600 bg-orange-100" },
  { value: "pink", label: "Pink", class: "text-pink-600 bg-pink-100" },
];

export default function VoteOptionsManager({ voteOptions, onVoteOptionsChange }: VoteOptionsManagerProps) {
  const { t } = useTranslation();
  const [editingOption, setEditingOption] = useState<VoteOption | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const addOption = () => {
    const newOption: VoteOption = {
      type: "",
      label: "",
      icon: "thumbs-up",
      color: "green"
    };
    setEditingOption(newOption);
    setShowAddForm(true);
  };

  const editOption = (option: VoteOption) => {
    setEditingOption(option);
    setShowAddForm(true);
  };

  const saveOption = (optionData: Partial<VoteOption>) => {
    if (!editingOption) return;

    const updatedOption = { ...editingOption, ...optionData };
    
    if (editingOption.type === "") {
      // New option
      onVoteOptionsChange([...voteOptions, updatedOption]);
    } else {
      // Existing option
      onVoteOptionsChange(
        voteOptions.map(o => o.type === editingOption.type ? updatedOption : o)
      );
    }
    
    setEditingOption(null);
    setShowAddForm(false);
  };

  const deleteOption = (optionType: string) => {
    onVoteOptionsChange(voteOptions.filter(o => o.type !== optionType));
  };

  const cancelEdit = () => {
    setEditingOption(null);
    setShowAddForm(false);
  };

  const getIconComponent = (iconName: string) => {
    const iconConfig = DEFAULT_ICONS.find(i => i.value === iconName);
    return iconConfig ? iconConfig.icon : ThumbsUp;
  };

  const getColorClass = (color: string) => {
    const colorConfig = DEFAULT_COLORS.find(c => c.value === color);
    return colorConfig ? colorConfig.class : "text-gray-600 bg-gray-100";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{t('admin.poll_creation.vote_options', 'Vote Options')}</CardTitle>
          <Button
            onClick={addOption}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('admin.poll_creation.add_option', 'Add Option')}
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          {t('admin.poll_creation.vote_options_description', 'Configure the voting options users can choose from')}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Options List */}
        {voteOptions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {voteOptions.map((option, index) => {
              const IconComponent = getIconComponent(option.icon || 'thumbs-up');
              const colorClass = getColorClass(option.color || 'blue');
              
              return (
                <div key={option.type} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <h4 className="font-medium text-gray-900">
                        {option.label || t('admin.poll_creation.unnamed_option', 'Unnamed Option')}
                      </h4>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editOption(option)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteOption(option.type)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${colorClass}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{option.label}</p>
                      <p className="text-xs text-gray-500">Type: {option.type}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add/Edit Form */}
        {showAddForm && editingOption && (
          <div className="border border-green-200 rounded-lg p-4 bg-green-50">
            <h4 className="font-medium text-gray-900 mb-4">
              {editingOption.type === "" 
                ? t('admin.poll_creation.add_option', 'Add Option')
                : t('admin.poll_creation.edit_option', 'Edit Option')
              }
            </h4>
            
            <VoteOptionForm
              option={editingOption}
              onSave={saveOption}
              onCancel={cancelEdit}
            />
          </div>
        )}

        {/* Empty State */}
        {voteOptions.length === 0 && !showAddForm && (
          <div className="text-center py-8">
            <ThumbsUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('admin.poll_creation.no_options', 'No Vote Options Added')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('admin.poll_creation.no_options_description', 'Add vote options to create a reaction-based poll')}
            </p>
            <Button onClick={addOption} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              {t('admin.poll_creation.add_first_option', 'Add First Option')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface VoteOptionFormProps {
  option: VoteOption;
  onSave: (optionData: Partial<VoteOption>) => void;
  onCancel: () => void;
}

function VoteOptionForm({ option, onSave, onCancel }: VoteOptionFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    type: option.type,
    label: option.label,
    icon: option.icon,
    color: option.color
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    if (!formData.type.trim()) {
      alert(t('admin.poll_creation.validation.option_type_required', 'Option type is required'));
      return;
    }
    if (!formData.label.trim()) {
      alert(t('admin.poll_creation.validation.option_label_required', 'Option label is required'));
      return;
    }
    onSave(formData);
  };

  const getIconComponent = (iconName: string) => {
    const iconConfig = DEFAULT_ICONS.find(i => i.value === iconName);
    return iconConfig ? iconConfig.icon : ThumbsUp;
  };

  const getColorClass = (color: string) => {
    const colorConfig = DEFAULT_COLORS.find(c => c.value === color);
    return colorConfig ? colorConfig.class : "text-gray-600 bg-gray-100";
  };

  const IconComponent = getIconComponent(formData.icon || 'thumbs-up');
  const colorClass = getColorClass(formData.color || 'blue');

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="optionType">{t('admin.poll_creation.option_type', 'Type')} *</Label>
        <Input
          id="optionType"
          value={formData.type}
          onChange={(e) => handleInputChange('type', e.target.value)}
          placeholder={t('admin.poll_creation.option_type_placeholder', 'e.g., gajjab, bekar, furious')}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="optionLabel">{t('admin.poll_creation.option_label', 'Label')} *</Label>
        <Input
          id="optionLabel"
          value={formData.label}
          onChange={(e) => handleInputChange('label', e.target.value)}
          placeholder={t('admin.poll_creation.option_label_placeholder', 'e.g., Gajjab, Bekar, Furious')}
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="optionIcon">{t('admin.poll_creation.option_icon', 'Icon')}</Label>
          <Select value={formData.icon} onValueChange={(value) => handleInputChange('icon', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEFAULT_ICONS.map((icon) => {
                const IconComponent = icon.icon;
                return (
                  <SelectItem key={icon.value} value={icon.value}>
                    <div className="flex items-center space-x-2">
                      <IconComponent className="w-4 h-4" />
                      <span>{icon.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="optionColor">{t('admin.poll_creation.option_color', 'Color')}</Label>
          <Select value={formData.color} onValueChange={(value) => handleInputChange('color', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEFAULT_COLORS.map((color) => (
                <SelectItem key={color.value} value={color.value}>
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full ${color.class.split(' ')[1]}`}></div>
                    <span>{color.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Preview */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          {t('admin.poll_creation.preview', 'Preview')}:
        </Label>
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${colorClass}`}>
            <IconComponent className="w-5 h-5" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{formData.label}</p>
            <p className="text-xs text-gray-500">Type: {formData.type}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          {t('admin.poll_creation.cancel', 'Cancel')}
        </Button>
        <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
          {t('admin.poll_creation.save', 'Save')}
        </Button>
      </div>
    </div>
  );
}
