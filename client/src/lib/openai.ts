import { apiRequest } from "@/lib/queryClient";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

interface RecommendationRequest {
  location: string;
  interests?: string[];
  budgetLevel?: number;
  previousActivities?: string[];
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface RecommendationResponse {
  recommendations: any[];
  reasoning: string;
}

export async function getPersonalizedRecommendations(
  request: RecommendationRequest
): Promise<RecommendationResponse> {
  try {
    const response = await apiRequest("POST", "/api/recommendations", request);
    return await response.json();
  } catch (error) {
    console.error("Error getting recommendations:", error);
    throw new Error("Failed to get personalized recommendations");
  }
}

export async function analyzeUserPreferences(
  activities: string[],
  ratings: number[]
): Promise<{ 
  interests: string[], 
  preferredBudget: number,
  preferredCategories: string[]
}> {
  // In a production app, we would call the OpenAI API directly here
  // For now, we'll return some mock data based on the input
  
  // This would be a call to the API in a real implementation
  return {
    interests: ["hiking", "nature", "photography", "wildlife"],
    preferredBudget: 1, // Budget-friendly
    preferredCategories: ["Hiking", "Camping"]
  };
}
