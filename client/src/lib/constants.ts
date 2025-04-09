export const BUDGET_LEVELS = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3
};

export const BUDGET_LABELS = {
  [BUDGET_LEVELS.LOW]: {
    label: "$",
    description: "Budget-Friendly",
    color: "text-[#4CAF50]",
    bgColor: "bg-[#4CAF50]"
  },
  [BUDGET_LEVELS.MEDIUM]: {
    label: "$$",
    description: "Mid-Range",
    color: "text-[#FFC107]",
    bgColor: "bg-[#FFC107]"
  },
  [BUDGET_LEVELS.HIGH]: {
    label: "$$$",
    description: "Premium",
    color: "text-[#F44336]",
    bgColor: "bg-[#F44336]"
  }
};

export const ACTIVITY_ICONS = {
  "Hiking": "directions_walk",
  "Cycling": "pedal_bike",
  "Kayaking": "waves",
  "Camping": "park",
  "Climbing": "filter_drama",
  "Fishing": "directions_boat",
  "default": "explore"
};

export const DEFAULT_LOCATION = {
  city: "Seattle, WA",
  latitude: 47.6062,
  longitude: -122.3321
};

export const MAX_NEARBY_DISTANCE = 50; // miles
