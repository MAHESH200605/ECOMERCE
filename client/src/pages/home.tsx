import { useState } from "react";
import Header from "@/components/header";
import LocationBar from "@/components/location-bar";
import SearchFilter from "@/components/search-filter";
import Categories from "@/components/categories";
import AiRecommendations from "@/components/ai-recommendations";
import NearbyEvents from "@/components/nearby-events";
import MapPreview from "@/components/map-preview";
import BottomNavigation from "@/components/bottom-navigation";

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [budgetLevel, setBudgetLevel] = useState<number>(3); // Default to all budget levels
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showMapView, setShowMapView] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleBudgetChange = (budget: number) => {
    setBudgetLevel(budget);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  const toggleMapView = () => {
    setShowMapView(!showMapView);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 bg-opacity-75 bg-blend-overlay" 
      style={{ 
        backgroundImage: 'url("https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=10&blur=10")',
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover'
      }}>
      <Header />
      
      <main className="flex-grow mb-16">
        <div className="container mx-auto px-4 py-6">
          <LocationBar />
          
          <SearchFilter 
            onSearch={handleSearch} 
            onBudgetChange={handleBudgetChange} 
          />
          
          <Categories onSelect={handleCategorySelect} />
          
          <AiRecommendations 
            budgetLevel={budgetLevel} 
            interests={selectedCategory ? [selectedCategory] : undefined} 
          />
          
          {showMapView ? (
            <MapPreview onExpand={toggleMapView} />
          ) : (
            <NearbyEvents 
              budgetFilter={budgetLevel} 
              categoryFilter={selectedCategory}
              searchQuery={searchQuery}
              onMapViewClick={toggleMapView}
            />
          )}
        </div>
      </main>
      
      <BottomNavigation />
      
      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-6 z-10">
        <button className="bg-[#FF7F50] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-opacity-90 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Home;
