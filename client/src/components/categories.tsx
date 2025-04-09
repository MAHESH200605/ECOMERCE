import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";

type CategoryItemProps = {
  category: Category;
  isActive: boolean;
  onClick: (categoryName: string) => void;
};

const CategoryItem = ({ category, isActive, onClick }: CategoryItemProps) => {
  return (
    <button
      className={`category-chip rounded-full px-4 py-2 flex items-center whitespace-nowrap shadow-md hover:bg-[#2C5F2D] hover:text-white transition-colors ${
        isActive ? "bg-[#2C5F2D] text-white" : "bg-white text-gray-700"
      }`}
      onClick={() => onClick(category.name)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className="h-4 w-4 mr-2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={getCategoryIconPath(category.icon)}
        />
      </svg>
      {category.name}
    </button>
  );
};

const Categories = ({ onSelect }: { onSelect: (category: string) => void }) => {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["/api/categories"],
  });

  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

  const handleCategoryClick = (categoryName: string) => {
    const newCategory = selectedCategory === categoryName ? null : categoryName;
    setSelectedCategory(newCategory);
    onSelect(newCategory || "");
  };

  if (isLoading) {
    return (
      <div className="mb-6 overflow-x-auto">
        <div className="flex gap-2 pb-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div 
              key={i}
              className="h-10 w-24 bg-gray-200 rounded-full animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 overflow-x-auto">
      <div className="flex gap-2 pb-2">
        {categories?.map((category: Category) => (
          <CategoryItem
            key={category.id}
            category={category}
            isActive={selectedCategory === category.name}
            onClick={handleCategoryClick}
          />
        ))}
      </div>
    </div>
  );
};

function getCategoryIconPath(iconName: string): string {
  // Default SVG path for unknown icons
  let path = "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z";
  
  // Map Material icons to SVG paths
  switch (iconName) {
    case "directions_walk": // Hiking
      path = "M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7";
      break;
    case "pedal_bike": // Cycling
      path = "M18.18 10l-1.7-4.68A2.008 2.008 0 0014.6 4H12v2h2.6l1.46 4h-4.81l-.36-1H12V7H7v2h1.75l1.82 5H9.9c-.44-2.23-2.31-3.88-4.65-3.99C2.45 9.87 0 12.2 0 15c0 2.8 2.2 5 5 5 2.46 0 4.45-1.69 4.9-4h4.2c.44 2.23 2.31 3.88 4.65 3.99 2.8.13 5.25-2.19 5.25-5 0-2.8-2.2-5-5-5h-.82zM7.82 16c-.4 1.17-1.49 2-2.82 2-1.68 0-3-1.32-3-3s1.32-3 3-3c1.33 0 2.42.83 2.82 2H5v2h2.82zm6.28-2h-1.4l-.73-2H15c-.44.58-.76 1.25-.9 2zm4.9 4c-1.68 0-3-1.32-3-3 0-.93.41-1.73 1.05-2.28l.96 2.64 1.88-.68-.97-2.67c.03 0 .06-.01.09-.01 1.68 0 3 1.32 3 3s-1.33 3-3.01 3z";
      break;
    case "waves": // Kayaking
      path = "M22 20V8h-4V4h-4v4h-4V4H6v4H2v12h4v-4h4v4h4v-4h4v4h4zM6 8h4v4H6V8zm4 8H6v-2h4v2zm4-8h4v4h-4V8zm0 6v2h-4v-2h4zm4 2v-2h4v2h-4z";
      break;
    case "park": // Camping
      path = "M17 12h2L12 2 5.05 12H7l-3.9 6h6.92v4h3.98v-4H21z";
      break;
    case "filter_drama": // Climbing
      path = "M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.61 5.64 5.36 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4h2c0-2.76-1.86-5.08-4.4-5.78C8.61 6.88 10.2 6 12 6c3.03 0 5.5 2.47 5.5 5.5v.5H19c1.65 0 3 1.35 3 3s-1.35 3-3 3z";
      break;
    case "directions_boat": // Fishing
      path = "M20 21c-1.39 0-2.78-.47-4-1.32-2.44 1.71-5.56 1.71-8 0C6.78 20.53 5.39 21 4 21H2v2h2c1.38 0 2.74-.35 4-.99 2.52 1.29 5.48 1.29 8 0 1.26.65 2.62.99 4 .99h2v-2h-2zM3.95 19H4c1.6 0 3.02-.88 4-2 .98 1.12 2.4 2 4 2s3.02-.88 4-2c.98 1.12 2.4 2 4 2h.05l1.89-6.68c.08-.26.06-.54-.06-.78s-.34-.42-.6-.5L20 10.62V6c0-1.1-.9-2-2-2h-3V1H9v3H6c-1.1 0-2 .9-2 2v4.62l-1.29.42c-.26.08-.48.26-.6.5s-.15.52-.06.78L3.95 19zM6 6h12v3.97L12 8 6 9.97V6z";
      break;
  }
  
  return path;
}

export default Categories;
