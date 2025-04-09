import { useState, useEffect } from "react";

interface LocationState {
  location: string;
  latitude: number;
  longitude: number;
  error: string | null;
  updateLocation: (location: string, lat: number, lng: number) => void;
}

export function useLocation(): LocationState {
  const [location, setLocation] = useState<string>("Seattle, WA");
  const [latitude, setLatitude] = useState<number>(47.6062);
  const [longitude, setLongitude] = useState<number>(-122.3321);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try to get the user's location when the hook is first used
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          
          // Attempt reverse geocoding to get location name
          // In a real app, we would use a geocoding service here
          // For now, we'll keep the default location name
        },
        (err) => {
          setError(`Error getting location: ${err.message}`);
          console.error("Error getting user location:", err);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  }, []);

  const updateLocation = (newLocation: string, lat: number, lng: number) => {
    setLocation(newLocation);
    setLatitude(lat);
    setLongitude(lng);
  };

  return {
    location,
    latitude,
    longitude,
    error,
    updateLocation
  };
}
