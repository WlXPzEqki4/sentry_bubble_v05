
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import CountryButton from './CountryButton';

interface CountryListProps {
  countries: Array<{ name: string; flag: string; coordinates: number[] }>;
  selectedCountry: string | null;
  onCountryClick: (country: { name: string; flag: string; coordinates: number[] }) => void;
}

const CountryList: React.FC<CountryListProps> = ({ 
  countries, 
  selectedCountry, 
  onCountryClick 
}) => {
  return (
    <div className="flex flex-col bg-white h-full">
      <div className="p-4 border-b">
        <h3 className="font-medium">African Countries</h3>
        <p className="text-xs text-gray-500 mt-1">Click on Sudan to focus the map</p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          {countries.map((country) => (
            <CountryButton
              key={country.name}
              country={country}
              isSelected={selectedCountry === country.name}
              onClick={() => onCountryClick(country)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default CountryList;
