import { FC } from "react";

interface PollCategory {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface PollCategoriesProps {
  categories: PollCategory[];
  selectedCategory: string;
  setSelectedCategory: (id: string) => void;
}

const PollCategories: FC<PollCategoriesProps> = ({ categories, selectedCategory, setSelectedCategory }) => {
  return (
    <div className="flex justify-center items-center space-x-6 mb-8">
      {categories.map((category) => {
        const Icon = category.icon;
        const isActive = selectedCategory === category.id;
        return (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center space-x-2 pb-2 font-medium transition-colors ${
              isActive
                ? "text-nepal-red border-b-2 border-nepal-red"
                : "text-gray-600 hover:text-nepal-red"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{category.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default PollCategories;
