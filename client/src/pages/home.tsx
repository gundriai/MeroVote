import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import VotingCard from "@/components/voting-card";
import ComparisonCard from "@/components/comparison-card";
import CommentSection from "@/components/comment-section";
import { Vote, TrendingUp, Users, CheckSquare, Zap, Landmark, Scale, Activity } from "lucide-react";
import { FaceToFaceIcon } from "@/components/icons/FaceToFaceIcon";
import pollCategoriesData from "@/data/poll-categories.json";
import Header from "@/components/header";
import BannerCarousel from "@/components/BannerCarousel";
import ScrollablePolls from "@/components/ScrollablePolls";
import { useState, useMemo } from "react";
import { Link } from "wouter";
import { mockPolls, MockPoll } from "@/data/mock-polls";
import { useTranslation } from "react-i18next";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>("daily_rating");

  const { t } = useTranslation();
  
  // Use hardcoded data instead of API calls
  const stats = {
    totalVotes: 2847,
    activeVoters: 1234, 
    activePolls: 3
  };

  // Filter polls by selected category
  const polls = mockPolls.filter(poll => poll.type === selectedCategory);
  const isLoading = false;

  // Map icon string to actual component
  const iconMap: Record<string, any> = { 
    Zap, 
    Landmark, 
    Scale, 
    FaceToFace: FaceToFaceIcon,
    Activity
  };
  
  // Load categories from JSON, map icon, label, and sort by order
  const categories = useMemo(() => (Array.isArray(pollCategoriesData) ? pollCategoriesData : []).map((cat) => ({
    id: cat.id,
    label: t(cat.labelKey),
    icon: iconMap[cat.icon] || Zap,
    order: cat.order ?? 0
  })).sort((a, b) => a.order - b.order), [pollCategoriesData, t]);

  // Group polls by category
  const pollsByCategory = useMemo(() => {
    const grouped: Record<string, MockPoll[]> = {};
    categories.forEach(cat => {
      grouped[cat.id] = mockPolls.filter(poll => poll.type === cat.id);
    });
    return grouped;
  }, [categories]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header stats={stats} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner Carousel */}
        <BannerCarousel />


        {/* Scrollable Polls Section */}
      <div className="mt-8 min-h-screen">
        {isLoading ? (
          <div className="text-center py-8 w-full">
            <p className="text-gray-500">{t('home.loading')}</p>
          </div>
        ) : (
          <ScrollablePolls
            categories={categories}
            polls={pollsByCategory}
            activeCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
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
