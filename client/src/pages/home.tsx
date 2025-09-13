// --- PollCategory Model ---
import { ElementType } from "react";


export interface PollCategory {
  id: PollCategoriesEnum;
  label: string;
  icon: ElementType;
  order: number;
}
import VotingCard from "@/components/voting-card";
import ComparisonCard from "@/components/comparison-card";
import { Vote, Users, CheckSquare, Zap, Landmark, Scale, Earth, EarthIcon } from "lucide-react";
import { FaceToFaceIcon } from "@/components/icons/FaceToFaceIcon";
import pollCategoriesData from "@/data/poll-categories.json";
import Header from "@/components/header";
import BannerCarousel from "@/components/BannerCarousel";
import PollCategoryNavModel from "@/components/PollCategories";
import { useState, useEffect } from "react";
import { mockPolls, PollType, PollCategories as PollCategoriesEnum } from "@/data/mock-polls";
import { useTranslation } from "react-i18next";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<PollCategory>({} as PollCategory);

  const { t } = useTranslation();
  
  // Use hardcoded data instead of API calls
  const stats = {
    totalVotes: 2847,
    activeVoters: 1234, 
    activePolls: 3
  };

  // Filter polls by selected category, show all if 'All' is selected or no category selected
  const polls = !selectedCategory.id || selectedCategory.id === PollCategoriesEnum.ALL
    ? mockPolls
    : mockPolls.filter(poll => poll.category.includes(selectedCategory.id));
  const isLoading = false;

  // Debug logging
  console.log('Selected Category:', selectedCategory);
  console.log('Filtered Polls:', polls);
  console.log('Mock Polls:', mockPolls);

  // Map icon string to actual component
  const iconMap: Record<string, ElementType> = { 
    Zap, 
    Landmark, 
    Scale, 
    EarthIcon, 
    FaceToFace: FaceToFaceIcon, 
    Activity: Users // fallback for Activity, replace with actual icon if available
  };

  // Transform pollCategoriesData to PollCategory[]
  const categories: PollCategory[] = pollCategoriesData
  .map<PollCategory>((cat) => ({
    id: cat.id as PollCategoriesEnum,
    label: t(cat.labelKey),
    icon: (iconMap[cat.icon] ?? Zap) as ElementType,
    order: cat.order ?? 0,
  }))
  .sort((a, b) => a.order - b.order);

  // Set default category to "All" if none selected
  useEffect(() => {
    if (!selectedCategory.id && categories.length > 0) {
      const defaultCategory = categories.find(cat => cat.id === PollCategoriesEnum.ALL);
      if (defaultCategory) {
        setSelectedCategory(defaultCategory);
      }
    }
  }, [categories, selectedCategory.id]);


  return (
    <div className="min-h-screen bg-gray-50">
      <Header stats={stats} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner Carousel */}
        <BannerCarousel />


        {/* Poll Categories */}
        <PollCategoryNavModel
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        {/* Debug Info */}
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-300 rounded">
          <h3 className="font-bold text-yellow-800">Debug Info:</h3>
          <p><strong>Selected Category:</strong> {selectedCategory.id || 'None'}</p>
          <p><strong>Total Polls:</strong> {mockPolls.length}</p>
          <p><strong>Filtered Polls:</strong> {polls.length}</p>
          <p><strong>Available Categories:</strong> {categories.map(c => c.id).join(', ')}</p>
        </div>

        {/* Polls Section */}
        <div className="flex flex-wrap -mx-3">
          {isLoading ? (
            <div className="text-center py-8 w-full">
              <p className="text-gray-500">{t('home.loading')}</p>
            </div>
          ) : !polls || !Array.isArray(polls) || polls.length === 0 ? (
            <div className="text-center py-8 w-full">
              <p className="text-gray-500">{t('home.no_polls')}</p>
            </div>
          ) : (
            polls.map((poll: any) => (
              <div key={poll.id} className="w-full md:w-1/2 px-3 mb-6 flex">
                {poll.type === PollType.ONE_VS_ONE ? (
                  <ComparisonCard {...poll} />
                ) : (
                  <VotingCard poll={poll} />
                )}
                {/* <CommentSection pollId={poll.id} showWordLimit={poll.type === "daily_rating"} /> */}
              </div>
            ))
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-nepal-red rounded-lg flex items-center justify-center">
                  <Vote className="text-white w-4 h-4" />
                </div>
                <h3 className="font-bold text-gray-900">MeroVote</h3>
              </div>
              <p className="text-sm text-gray-600">
                {t('home.footer.tagline')}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">{t('home.footer.features')}</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                {(t('home.footer.feature_items', { returnObjects: true }) as string[]).map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">{t('home.footer.help')}</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                {(t('home.footer.help_items', { returnObjects: true }) as string[]).map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">{t('home.footer.security_info')}</h4>
              <div className="space-y-2 text-sm text-gray-600">
                {(t('home.footer.security_items', { returnObjects: true }) as string[]).map((item: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    {index === 0 && <CheckSquare className="w-4 h-4 text-green-500" />}
                    {index === 1 && <Users className="w-4 h-4 text-nepal-blue" />}
                    {index === 2 && <Vote className="w-4 h-4 text-nepal-red" />}
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-6 text-center">
            <p className="text-sm text-gray-500">{t('home.footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
