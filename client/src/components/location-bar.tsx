import { useState } from "react";
import { useLocation } from "@/hooks/use-location";

type LocationBarProps = {
  onLocationChange?: (location: string, latitude: number, longitude: number) => void;
};

const LocationBar = ({ onLocationChange }: LocationBarProps) => {
  const { location, latitude, longitude, updateLocation } = useLocation();
  const [isChangingLocation, setIsChangingLocation] = useState(false);
  const [newLocation, setNewLocation] = useState("");

  const handleChangeClick = () => {
    setIsChangingLocation(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newLocation.trim()) {
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(newLocation)}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
      
      // In a real application, we would fetch the geocoded location here
      // For now, we'll just update with the entered location
      updateLocation(newLocation, latitude, longitude);
      if (onLocationChange) {
        onLocationChange(newLocation, latitude, longitude);
      }
    }
    
    setIsChangingLocation(false);
    setNewLocation("");
  };

  const handleCancel = () => {
    setIsChangingLocation(false);
    setNewLocation("");
  };

  return (
    <div className="bg-white rounded-lg p-4 mb-6 flex items-center justify-between shadow-md">
      {isChangingLocation ? (
        <form onSubmit={handleSubmit} className="w-full flex gap-2">
          <input
            type="text"
            placeholder="Enter your location"
            className="flex-grow px-3 py-2 border border-gray-300 rounded-lg"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            autoFocus
          />
          <button
            type="submit"
            className="bg-[#2C5F2D] text-white py-2 px-4 rounded-lg font-medium"
          >
            Save
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium"
          >
            Cancel
          </button>
        </form>
      ) : (
        <>
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="h-5 w-5 mr-2 text-[#2C5F2D]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="font-medium">{location}</span>
          </div>
          <button
            onClick={handleChangeClick}
            className="bg-[#2C5F2D] text-white py-2 px-4 rounded-lg font-medium flex items-center transition-colors hover:bg-opacity-90"
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
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Change
          </button>
        </>
      )}
    </div>
  );
};

export default LocationBar;
