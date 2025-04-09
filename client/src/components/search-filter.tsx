import { useState } from "react";
import { Slider } from "@/components/ui/slider";

type SearchFilterProps = {
  onSearch: (query: string) => void;
  onBudgetChange: (budget: number) => void;
};

const SearchFilter = ({ onSearch, onBudgetChange }: SearchFilterProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [budget, setBudget] = useState([2]);  // Default to mid-range

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleBudgetChange = (value: number[]) => {
    setBudget(value);
    onBudgetChange(value[0]);
  };

  return (
    <div className="bg-white rounded-lg p-4 mb-6 shadow-md">
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search activities, parks, trails..."
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#2C5F2D]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button 
            type="button"
            className="bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600 py-2 px-4 rounded-lg font-medium flex items-center"
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
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filters
          </button>
          <button 
            type="button"
            className="bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600 py-2 px-4 rounded-lg font-medium flex items-center"
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
                d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
              />
            </svg>
            Sort
          </button>
        </div>
      </form>
      
      {/* Budget Filter */}
      <div className="mt-4">
        <h3 className="font-medium mb-2">Budget Range:</h3>
        <div className="flex items-center gap-4">
          <span className="text-green-600 font-bold">$</span>
          <Slider
            defaultValue={budget}
            max={3}
            min={1}
            step={1}
            onValueChange={handleBudgetChange}
            className="flex-grow"
          />
          <span className="text-red-600 font-bold">$$$</span>
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>Budget-Friendly</span>
          <span>Mid-Range</span>
          <span>Premium</span>
        </div>
      </div>
    </div>
  );
};

export default SearchFilter;
