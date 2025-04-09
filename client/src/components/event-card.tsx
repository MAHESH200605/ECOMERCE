import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Event } from "@shared/schema";

type EventCardProps = {
  event: Event;
};

const EventCard = ({ event }: EventCardProps) => {
  const getBudgetLabel = (level: number) => {
    switch (level) {
      case 1: return { text: "$", name: "Budget-Friendly", color: "text-[#4CAF50]" };
      case 2: return { text: "$$", name: "Mid-Range", color: "text-[#FFC107]" };
      case 3: return { text: "$$$", name: "Premium", color: "text-[#F44336]" };
      default: return { text: "$", name: "Budget-Friendly", color: "text-[#4CAF50]" };
    }
  };
  
  const budgetInfo = getBudgetLabel(event.budgetLevel);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    
    return `${weekday}, ${month} ${day}`;
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };
  
  const getTimeRange = (startDate: string, endDate: string) => {
    return `${formatTime(startDate)} - ${formatTime(endDate)}`;
  };

  return (
    <Card className="event-card overflow-hidden shadow-md">
      <div className="relative">
        <img 
          src={event.imageUrl} 
          alt={event.title} 
          className="w-full h-48 object-cover" 
        />
        <div className="absolute top-3 left-3 bg-[#2C5F2D] text-white text-xs font-bold px-2 py-1 rounded-full">
          <span className={`${budgetInfo.color} font-bold bg-white px-1 rounded-sm mr-1`}>{budgetInfo.text}</span>
          {budgetInfo.name}
        </div>
        <div className="absolute top-3 right-3 p-2 bg-white rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="h-5 w-5 text-[#2C5F2D]"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1">{event.title}</h3>
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="h-3 w-3 mr-1"
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
          {event.location} • {event.distanceInMiles} miles away
        </div>
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="h-3 w-3 mr-1"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {formatDate(event.startDate)} • {getTimeRange(event.startDate, event.endDate)}
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {event.tags?.map((tag, index) => (
            <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>
        <Link href={`/event/${event.id}`}>
          <a className="w-full bg-[#2C5F2D] text-white py-2 rounded-lg font-medium flex justify-center transition-colors hover:bg-opacity-90">
            View Details
          </a>
        </Link>
      </CardContent>
    </Card>
  );
};

export default EventCard;
