import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Event } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import BottomNavigation from "@/components/bottom-navigation";

const EventDetails = () => {
  const { id } = useParams();
  const eventId = parseInt(id);
  
  const { data: event, isLoading, error } = useQuery({
    queryKey: [`/api/events/${eventId}`],
    enabled: !isNaN(eventId)
  });
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2C5F2D]"></div>
        </main>
        <BottomNavigation />
      </div>
    );
  }
  
  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="h-12 w-12 mx-auto mb-4 text-red-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h1 className="text-xl font-bold mb-2">Event Not Found</h1>
            <p className="text-gray-600 mb-4">
              Sorry, we couldn't find the event you're looking for.
            </p>
            <Link href="/">
              <Button className="bg-[#2C5F2D] hover:bg-[#2C5F2D]/90 text-white">
                Back to Home
              </Button>
            </Link>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }
  
  const getBudgetInfo = (level: number) => {
    switch (level) {
      case 1: return { label: "$", price: "Budget-Friendly", color: "bg-[#4CAF50]" };
      case 2: return { label: "$$", price: "Mid-Range", color: "bg-[#FFC107]" };
      case 3: return { label: "$$$", price: "Premium", color: "bg-[#F44336]" };
      default: return { label: "$", price: "Budget-Friendly", color: "bg-[#4CAF50]" };
    }
  };
  
  const budgetInfo = getBudgetInfo(event.budgetLevel);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow mb-16">
        <div className="relative">
          <button 
            onClick={() => window.history.back()}
            className="absolute top-3 left-3 z-10 bg-white rounded-full p-2 shadow-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          
          <img 
            src={event.imageUrl} 
            alt={event.title} 
            className="w-full h-56 object-cover" 
          />
        </div>
        
        <div className="p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="font-bold text-xl mb-1">{event.title}</h2>
              <div className="flex items-center text-sm text-gray-600">
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
                {event.location}
              </div>
            </div>
            <div className={`${budgetInfo.color} text-white text-xs font-bold px-2 py-1 rounded-full`}>
              <span className={`text-${budgetInfo.color.replace('bg-', '')} font-bold bg-white px-1 rounded-sm mr-1`}>
                {budgetInfo.label}
              </span>
              {event.price || budgetInfo.price}
            </div>
          </div>
          
          <div className="flex items-center mb-4 bg-gray-100 rounded-lg p-3">
            <div className="mr-4">
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <div className="font-medium">{formatDate(event.startDate)}</div>
              <div className="text-sm text-gray-600">
                {formatTime(event.startDate)} - {formatTime(event.endDate)}
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {event.tags?.map((tag, index) => (
              <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-600">
                {tag}
              </Badge>
            ))}
          </div>
          
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-600">{event.description}</p>
          </div>
          
          {event.requirements && event.requirements.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">What to Bring</h3>
              <ul className="text-gray-600 list-disc pl-5">
                {event.requirements.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          
          {event.hostName && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Host</h3>
              <div className="flex items-center">
                {event.hostImageUrl ? (
                  <img 
                    src={event.hostImageUrl} 
                    alt={event.hostName} 
                    className="w-12 h-12 rounded-full object-cover mr-3" 
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#2C5F2D] text-white flex items-center justify-center mr-3">
                    {event.hostName.substring(0, 1)}
                  </div>
                )}
                <div>
                  <div className="font-medium">{event.hostName}</div>
                  {event.hostTitle && (
                    <div className="text-sm text-gray-600">{event.hostTitle}</div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="flex gap-3">
            <Button className="flex-grow bg-[#2C5F2D] hover:bg-[#2C5F2D]/90 text-white py-3">
              Register
            </Button>
            <Button variant="outline" className="border-[#2C5F2D] text-[#2C5F2D] hover:bg-[#2C5F2D] hover:text-white py-3 px-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </Button>
            <Button variant="outline" className="border-[#2C5F2D] text-[#2C5F2D] hover:bg-[#2C5F2D] hover:text-white py-3 px-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </Button>
          </div>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default EventDetails;
