import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Event } from "@shared/schema";
import { useLocation } from "@/hooks/use-location";
import { Button } from "@/components/ui/button";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

type MapPreviewProps = {
  onExpand?: () => void;
};

// Fallback to a placeholder image if API key is not available
const usePlaceholder = !process.env.MAPBOX_API_KEY;

const MapPreview = ({ onExpand }: MapPreviewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { latitude, longitude } = useLocation();
  
  const { data: nearbyEvents } = useQuery({
    queryKey: ["/api/events/nearby", { latitude, longitude, maxDistance: 5 }],
    enabled: !!latitude && !!longitude,
  });
  
  useEffect(() => {
    if (usePlaceholder || !mapContainer.current || !latitude || !longitude) return;
    
    if (map.current) return; // only create map once
    
    mapboxgl.accessToken = process.env.MAPBOX_API_KEY || '';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [longitude, latitude],
      zoom: 12
    });
    
    // Add current location marker
    new mapboxgl.Marker({ color: '#3898ff' })
      .setLngLat([longitude, latitude])
      .addTo(map.current);
    
    // Add controls
    map.current.addControl(new mapboxgl.NavigationControl());
    map.current.addControl(new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true
    }));
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [latitude, longitude]);
  
  useEffect(() => {
    if (usePlaceholder || !map.current || !nearbyEvents) return;
    
    // Remove existing markers except the user's location marker
    const markers = document.querySelectorAll('.mapboxgl-marker:not(:first-child)');
    markers.forEach(marker => marker.remove());
    
    // Add event markers
    nearbyEvents.forEach((event: Event) => {
      if (!event.latitude || !event.longitude || !map.current) return;
      
      // Choose color based on budget level
      let color;
      switch (event.budgetLevel) {
        case 1: color = '#4CAF50'; break; // green for budget-friendly
        case 2: color = '#FFC107'; break; // yellow for mid-range
        case 3: color = '#F44336'; break; // red for premium
        default: color = '#4CAF50';
      }
      
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <strong>${event.title}</strong>
          <p>${event.location}</p>
          <p>Price: ${getBudgetLabel(event.budgetLevel)}</p>
        `);
      
      new mapboxgl.Marker({ color })
        .setLngLat([event.longitude, event.latitude])
        .setPopup(popup)
        .addTo(map.current);
    });
  }, [nearbyEvents]);
  
  const getBudgetLabel = (level: number) => {
    switch (level) {
      case 1: return "$";
      case 2: return "$$";
      case 3: return "$$$";
      default: return "$";
    }
  };
  
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-xl">Nearby Activities</h2>
        <Button 
          variant="ghost" 
          className="text-[#2C5F2D] font-medium"
          onClick={onExpand}
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
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
            />
          </svg>
          Expand
        </Button>
      </div>
      
      <div className="bg-white rounded-lg overflow-hidden h-80 relative shadow-md">
        {usePlaceholder ? (
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 flex items-end">
              <div className="p-4 text-white">
                <h3 className="font-bold">8 outdoor activities within 5 miles</h3>
                <p className="text-sm">Tap on a pin to see activity details</p>
              </div>
            </div>
            
            {/* Sample pins */}
            <div className="absolute top-1/4 left-1/3 bg-[#4CAF50] text-white p-1 rounded-full w-6 h-6 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer" title="Guided Nature Walk">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="h-3 w-3"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 6l3 3m0 0l3 3m-3-3v12"
                />
              </svg>
            </div>
            
            <div className="absolute top-1/2 left-2/3 bg-[#FFC107] text-white p-1 rounded-full w-6 h-6 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer" title="Sunset Kayaking">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="h-3 w-3"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            
            <div className="absolute top-2/3 left-1/2 bg-[#F44336] text-white p-1 rounded-full w-6 h-6 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer" title="Rock Climbing Workshop">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="h-3 w-3"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
            </div>
            
            {/* Current Location */}
            <div className="absolute top-1/2 left-1/4 bg-blue-500 border-4 border-white p-1 rounded-full w-6 h-6 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-3 w-3 text-white"
              >
                <path
                  fillRule="evenodd"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        ) : (
          <div ref={mapContainer} className="w-full h-full" />
        )}
      </div>
    </div>
  );
};

export default MapPreview;
