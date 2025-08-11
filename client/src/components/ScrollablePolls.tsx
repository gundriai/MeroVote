import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MockPoll } from '@/data/mock-polls';
import VotingCard from './voting-card';
import ComparisonCard from './comparison-card';

// Create a type that matches what the components expect
type PollForDisplay = {
  id: string;
  title: string;
  description?: string;
  type: string;
  mediaUrl?: string;
  expiresAt: string;
  isActive: boolean;
  candidates?: Array<{
    id: string;
    name: string;
    imageUrl: string;
    voteCount: number;
  }>;
  voteCounts?: Record<string, number>;
};

interface ScrollablePollsProps {
  categories: {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    order: number;
  }[];
  polls: Record<string, MockPoll[]>;
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export default function ScrollablePolls({
  categories,
  polls,
  activeCategory,
  onCategoryChange,
}: ScrollablePollsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

  // Set up refs for each category section
  const setSectionRef = (element: HTMLDivElement | null, id: string) => {
    if (element) {
      sectionRefs.current[id] = element;
    }
  };

  // Transform MockPoll to PollForDisplay
  const transformPoll = (poll: MockPoll): PollForDisplay => ({
    id: poll.id,
    title: poll.title,
    description: poll.description || undefined,
    type: poll.type,
    mediaUrl: poll.mediaUrl || undefined,
    expiresAt: poll.expiresAt,
    isActive: poll.isActive,
    candidates: poll.candidates?.map(candidate => ({
      id: candidate.id,
      name: candidate.name,
      imageUrl: candidate.imageUrl || '',
      voteCount: candidate.voteCount
    })),
    voteCounts: poll.voteCounts
  });

  // Scroll to active category
  useEffect(() => {
    if (activeCategory && sectionRefs.current[activeCategory]) {
      window.scrollTo({
        top: sectionRefs.current[activeCategory]?.offsetTop || 0,
        behavior: 'smooth'
      });
    }
  }, [activeCategory]);

  // Handle scroll and update active tab
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100; // Add offset for header
      
      // Find which section is in view
      for (const [categoryId, element] of Object.entries(sectionRefs.current)) {
        if (!element) continue;
        
        const { offsetTop, offsetHeight } = element;
        if (scrollPosition >= offsetTop && 
            scrollPosition < offsetTop + offsetHeight) {
          onCategoryChange(categoryId);
          break;
        }
      }
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [categories, onCategoryChange]);

  // Intersection observer callback
  const handleIntersection = (categoryId: string) => (inView: boolean) => {
    if (inView) {
      onCategoryChange(categoryId);
    }
  };

  const [isSticky, setIsSticky] = useState(false);

  // Handle scroll for sticky header effect
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative">
      {/* Categories Tabs with blur effect when sticky */}
      <div className={`sticky top-0 z-10 transition-all duration-200 ${
        isSticky ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-white'
      }`}>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Gradient overlay for better text visibility */}
          {isSticky && (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-nepal-red/5 via-transparent to-nepal-blue/5" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/90 to-white/70" />
            </>
          )}
          <div className="relative flex space-x-8 overflow-x-auto hide-scrollbar">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    onCategoryChange(category.id);
                    const element = document.getElementById(`section-${category.id}`);
                    if (element) {
                      window.scrollTo({
                        top: element.offsetTop - 20, // Adjust for header
                        behavior: 'smooth'
                      });
                    }
                  }}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    isActive
                      ? 'border-nepal-red text-nepal-red'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-nepal-red' : 'text-gray-400'}`} />
                  <span>{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Polls Container */}
      <div 
        ref={containerRef}
        id="polls-container"
        className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto"
      >
        {categories.map((category) => {
          const categoryPolls = polls[category.id] || [];
          
          return (
            <React.Fragment key={category.id}>
              <div 
                ref={(el) => setSectionRef(el, category.id)}
                id={`section-${category.id}`}
                className="md:col-span-2 scroll-mt-24" // Full width for category header
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{category.label}</h2>
              </div>
              
              {/* Polls Grid */}
              <div className="space-y-6 md:col-span-2">
                {categoryPolls.length > 0 ? (
                  categoryPolls.map((poll) => {
                    const transformedPoll = transformPoll(poll);
                    return (
                      <div key={poll.id} className="w-full">
                        {poll.type === 'comparison_voting' || poll.type === 'face_to_face' ? (
                          <ComparisonCard poll={transformedPoll} />
                        ) : (
                          <VotingCard poll={transformedPoll} />
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 w-full">
                    <p className="text-gray-500">No polls available in this category</p>
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
