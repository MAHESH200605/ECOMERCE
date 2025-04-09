import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Event } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useLocation } from "@/hooks/use-location";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

type AiRecommendationsProps = {
  previousActivities?: string[];
  interests?: string[];
  budgetLevel?: number;
};

const AiRecommendations = ({ 
  previousActivities = ["hiking", "nature walks"], 
  interests = ["outdoors", "photography", "adventure"],
  budgetLevel = 1
}: AiRecommendationsProps) => {
  const { location, latitude, longitude } = useLocation();
  const [recommendations, setRecommendations] = useState<Event[]>([]);
  const [reasoning, setReasoning] = useState<string>("");

  const recommendationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/recommendations", {
        location,
        interests,
        budgetLevel,
        previousActivities,
        coordinates: { latitude, longitude }
      });
      return response.json();
    },
    onSuccess: (data) => {
      setRecommendations(data.recommendations);
      setReasoning(data.reasoning);
    }
  });

  const handleRefresh = () => {
    recommendationMutation.mutate();
  };

  const getBudgetLabel = (level: number) => {
    switch (level) {
      case 1: return "$";
      case 2: return "$$";
      case 3: return "$$$";
      default: return "$";
    }
  };

  const getBudgetClass = (level: number) => {
    switch (level) {
      case 1: return "text-[#4CAF50]"; // green
      case 2: return "text-[#FFC107]"; // yellow
      case 3: return "text-[#F44336]"; // red
      default: return "text-[#4CAF50]";
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-xl">AI Recommendations</h2>
        <Button 
          variant="ghost" 
          className="text-[#2C5F2D] font-medium"
          onClick={handleRefresh}
          disabled={recommendationMutation.isPending}
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
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </Button>
      </div>
      
      <div className="bg-gradient-to-r from-[#71C5E8]/20 to-[#2C5F2D]/20 rounded-xl p-4 relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-9xl text-[#2C5F2D]"
          >
            <path
              fillRule="evenodd"
              d="M12 1a.75.75 0 01.75.75V4h8.5a.75.75 0 010 1.5h-8.5v3.75h7.5a.75.75 0 010 1.5h-7.5v3.75h8.5a.75.75 0 010 1.5h-8.5v2.25a.75.75 0 01-1.5 0V16.5h-8.5a.75.75 0 010-1.5h8.5v-3.75h-7.5a.75.75 0 010-1.5h7.5V6.5h-8.5a.75.75 0 010-1.5h8.5V1.75A.75.75 0 0112 1z"
            />
          </svg>
        </div>
        <div className="flex items-start">
          <div className="bg-white p-3 rounded-full mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="h-6 w-6 text-[#2C5F2D]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">Based on your interests</h3>
            <p className="text-gray-600 mb-3">
              {recommendationMutation.isPending ? (
                "Finding personalized activities for you..."
              ) : recommendations.length > 0 ? (
                reasoning || "You enjoyed hiking last weekend. Here are budget-friendly events nearby:"
              ) : (
                "You enjoyed hiking last weekend. Here are budget-friendly events nearby:"
              )}
            </p>
            
            {recommendationMutation.isPending ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white rounded-lg p-3 h-24 animate-pulse">
                    <div className="flex">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg mr-3"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((event) => (
                  <Link key={event.id} href={`/event/${event.id}`}>
                    <a className="bg-white rounded-lg p-3 transition-all hover:bg-gray-50">
                      <div className="flex">
                        <img 
                          src={event.imageUrl} 
                          alt={event.title} 
                          className="w-20 h-20 object-cover rounded-lg mr-3" 
                        />
                        <div>
                          <div className="flex items-center">
                            <Badge variant="outline" className={`mr-2 font-bold ${getBudgetClass(event.budgetLevel)}`}>
                              {getBudgetLabel(event.budgetLevel)}
                            </Badge>
                            <h4 className="font-medium">{event.title}</h4>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            {event.location} • {event.distanceInMiles} miles
                          </p>
                          <div className="flex items-center text-xs">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              className="h-3 w-3 mr-1 text-[#2C5F2D]"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            {new Date(event.startDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })} • {new Date(event.startDate).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </div>
                        </div>
                      </div>
                    </a>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/event/4">
                  <a className="bg-white rounded-lg p-3 transition-all hover:bg-gray-50">
                    <div className="flex">
                      <img 
                        src="https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" 
                        alt="Waterfall hike" 
                        className="w-20 h-20 object-cover rounded-lg mr-3" 
                      />
                      <div>
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-2 font-bold text-[#4CAF50]">
                            $
                          </Badge>
                          <h4 className="font-medium">Waterfall Hike</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Discovery Park • 5 miles</p>
                        <div className="flex items-center text-xs">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            className="h-3 w-3 mr-1 text-[#2C5F2D]"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          Jul 21 • 08:00 AM
                        </div>
                      </div>
                    </div>
                  </a>
                </Link>
                
                <Link href="/event/5">
                  <a className="bg-white rounded-lg p-3 transition-all hover:bg-gray-50">
                    <div className="flex">
                      <img 
                        src="https://images.unsplash.com/photo-1544845894-20b3d88ff624?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" 
                        alt="Mountain biking" 
                        className="w-20 h-20 object-cover rounded-lg mr-3" 
                      />
                      <div>
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-2 font-bold text-[#FFC107]">
                            $$
                          </Badge>
                          <h4 className="font-medium">Mountain Biking</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Tiger Mountain • 8 miles</p>
                        <div className="flex items-center text-xs">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            className="h-3 w-3 mr-1 text-[#2C5F2D]"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          Jul 22 • 09:30 AM
                        </div>
                      </div>
                    </div>
                  </a>
                </Link>
              </div>
            )}
            
            {!recommendationMutation.isPending && recommendations.length === 0 && (
              <Button 
                onClick={handleRefresh} 
                className="mt-4 bg-[#2C5F2D] hover:bg-[#2C5F2D]/90 text-white"
              >
                Get Personalized Recommendations
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiRecommendations;
