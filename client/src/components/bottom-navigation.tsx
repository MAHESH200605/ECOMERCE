import { useState } from "react";
import { Link, useLocation } from "wouter";

const BottomNavigation = () => {
  const [location] = useLocation();
  const [active, setActive] = useState("explore");
  
  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <nav className="bg-white shadow-md pt-2 fixed bottom-0 left-0 right-0 z-10">
      <div className="flex justify-around">
        <Link href="/">
          <a 
            className={`flex flex-col items-center pb-2 px-4 border-t-2 ${
              isActive("/") ? "border-[#2C5F2D] text-[#2C5F2D]" : "border-transparent text-gray-600 hover:text-[#2C5F2D]"
            }`}
            onClick={() => setActive("explore")}
          >
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
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-xs font-medium">Explore</span>
          </a>
        </Link>
        
        <Link href="/map">
          <a 
            className={`flex flex-col items-center pb-2 px-4 border-t-2 ${
              isActive("/map") ? "border-[#2C5F2D] text-[#2C5F2D]" : "border-transparent text-gray-600 hover:text-[#2C5F2D]"
            }`}
            onClick={() => setActive("map")}
          >
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
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            <span className="text-xs font-medium">Map</span>
          </a>
        </Link>
        
        <Link href="/saved">
          <a 
            className={`flex flex-col items-center pb-2 px-4 border-t-2 ${
              isActive("/saved") ? "border-[#2C5F2D] text-[#2C5F2D]" : "border-transparent text-gray-600 hover:text-[#2C5F2D]"
            }`}
            onClick={() => setActive("saved")}
          >
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
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
            <span className="text-xs font-medium">Saved</span>
          </a>
        </Link>
        
        <Link href="/profile">
          <a 
            className={`flex flex-col items-center pb-2 px-4 border-t-2 ${
              isActive("/profile") ? "border-[#2C5F2D] text-[#2C5F2D]" : "border-transparent text-gray-600 hover:text-[#2C5F2D]"
            }`}
            onClick={() => setActive("profile")}
          >
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="text-xs font-medium">Profile</span>
          </a>
        </Link>
      </div>
    </nav>
  );
};

export default BottomNavigation;
