import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, Users, Star, Zap, Flame, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PollType } from "@/data/mock-polls";

interface PollTypeOption {
  type: PollType;
  title: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  features: string[];
  example: string;
}

interface PollTypeSelectorProps {
  selectedType: PollType | null;
  onTypeSelect: (type: PollType) => void;
  onNext: () => void;
}

export default function PollTypeSelector({ selectedType, onTypeSelect, onNext }: PollTypeSelectorProps) {
  const { t } = useTranslation();

  const pollTypes: PollTypeOption[] = [
    {
      type: PollType.REACTION_BASED,
      title: t('admin.poll_creation.reaction_based.title', 'Reaction-Based Poll'),
      description: t('admin.poll_creation.reaction_based.description', 'Create polls where users can react with emotions like Gajjab, Bekar, Furious'),
      icon: ThumbsUp,
      color: "text-green-600",
      bgColor: "bg-green-50 border-green-200",
      features: [
        t('admin.poll_creation.reaction_based.features.quick', 'Quick emotional responses'),
        t('admin.poll_creation.reaction_based.features.engaging', 'Highly engaging'),
        t('admin.poll_creation.reaction_based.features.simple', 'Simple voting interface')
      ],
      example: t('admin.poll_creation.reaction_based.example', 'How do you feel about today\'s weather?')
    },
    {
      type: PollType.ONE_VS_ONE,
      title: t('admin.poll_creation.one_vs_one.title', 'One vs One Poll'),
      description: t('admin.poll_creation.one_vs_one.description', 'Create comparison polls where users choose between two candidates or options'),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50 border-blue-200",
      features: [
        t('admin.poll_creation.one_vs_one.features.comparison', 'Direct comparison'),
        t('admin.poll_creation.one_vs_one.features.visual', 'Visual candidate display'),
        t('admin.poll_creation.one_vs_one.features.percentage', 'Percentage-based results')
      ],
      example: t('admin.poll_creation.one_vs_one.example', 'Who should be the next Prime Minister?')
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('admin.poll_creation.select_type', 'Select Poll Type')}
        </h2>
        <p className="text-gray-600">
          {t('admin.poll_creation.select_type_description', 'Choose the type of poll you want to create')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pollTypes.map((pollType) => {
          const Icon = pollType.icon;
          const isSelected = selectedType === pollType.type;
          
          return (
            <Card
              key={pollType.type}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected 
                  ? `${pollType.bgColor} border-2 shadow-lg` 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onTypeSelect(pollType.type)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-lg ${isSelected ? pollType.color.replace('text-', 'bg-').replace('-600', '-100') : 'bg-gray-100'}`}>
                      <Icon className={`w-6 h-6 ${isSelected ? pollType.color : 'text-gray-600'}`} />
                    </div>
                    <div>
                      <CardTitle className={`text-lg ${isSelected ? pollType.color : 'text-gray-900'}`}>
                        {pollType.title}
                      </CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {pollType.type}
                      </Badge>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-gray-600 text-sm mb-4">
                  {pollType.description}
                </p>
                
                <div className="space-y-2 mb-4">
                  <h4 className="font-medium text-gray-900 text-sm">
                    {t('admin.poll_creation.features', 'Features')}:
                  </h4>
                  <ul className="space-y-1">
                    {pollType.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">
                    {t('admin.poll_creation.example', 'Example')}:
                  </p>
                  <p className="text-sm text-gray-700 italic">
                    "{pollType.example}"
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedType && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={onNext}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
          >
            {t('admin.poll_creation.next', 'Next: Configure Poll')} →
          </Button>
        </div>
      )}
    </div>
  );
}
