import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "@/hooks/use-location";
import EventCard from "@/components/event-card";
import { Button } from "@/components/ui/button";
import { Event } from "@shared/schema";

type NearbyEventsProps = {
  budgetFilter?: number;
  categoryFilter?: string;
  searchQuery?: string;
  onMapViewClick?: () => void;
};

const NearbyEvents = ({ 
  budgetFilter, 
  categoryFilter, 
  searchQuery,
  onMapViewClick 
}: NearbyEventsProps) => {
  const { latitude, longitude } = useLocation();
  const [visibleCount, setVisibleCount] = useState(3);
  
  const { data: events, isLoading } = useQuery({
    queryKey: ["/api/events/nearby", { latitude, longitude, maxDistance: 50 }],
    enabled: !!latitude && !!longitude,
  });
  
  const filteredEvents = events?.filter((event: Event) => {
    let passesFilter = true;
    
    if (budgetFilter && event.budgetLevel > budgetFilter) {
      passesFilter = false;
    }
    
    if (categoryFilter && event.category !== categoryFilter) {
      passesFilter = false;
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        event.title.toLowerCase().includes(query) || 
        event.description.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query) ||
        (event.tags && event.tags.some(tag => tag.toLowerCase().includes(query)));
      
      if (!matchesSearch) {
        passesFilter = false;
      }
    }
    
    return passesFilter;
  });
  
  const visibleEvents = filteredEvents?.slice(0, visibleCount);
  
  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 3);
  };
  
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-xl">Nearby Events</h2>
        <Button 
          variant="ghost" 
          className="text-[#2C5F2D] font-medium"
          onClick={onMapViewClick}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="h-4 w-4 mr-1"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
          Map View
        </Button>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md">
              <div className="h-48 bg-gray-200 animate-pulse"></div>
              <div className="p-4">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-3 animate-pulse"></div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {[1, 2, 3].map(j => (
                    <div key={j} className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                  ))}
                </div>
                <div className="h-4 bg-gray-200 rounded mb-4 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredEvents?.length ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleEvents?.map((event: Event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          
          {visibleCount < filteredEvents.length && (
            <div className="mt-6 text-center">
              <Button 
                variant="outline" 
                className="py-3 px-6 border-[#2C5F2D] text-[#2C5F2D] hover:bg-[#2C5F2D] hover:text-white"
                onClick={handleLoadMore}
              >
                Load More Events
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-lg p-8 text-center shadow-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="h-12 w-12 mx-auto mb-4 text-gray-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold mb-2">No events found</h3>
          <p className="text-gray-600">
            Try adjusting your filters or search criteria to find more events.
          </p>
        </div>
      )}
    </div>
  );
};

export default NearbyEvents;
