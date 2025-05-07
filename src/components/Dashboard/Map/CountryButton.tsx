
import React from 'react';
import { Flag } from 'lucide-react';

interface CountryProps {
  country: { 
    name: string; 
    flag: string; 
    coordinates: number[] 
  };
  isSelected: boolean;
  onClick: () => void;
}

const CountryButton: React.FC<CountryProps> = ({ country, isSelected, onClick }) => {
  return (
    <button 
      className={`flex items-center justify-between w-full px-3 py-2 text-left hover:bg-slate-100 rounded transition-colors ${isSelected ? 'bg-slate-100' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <img 
          src={`https://flagcdn.com/24x18/${country.flag}.png`}
          srcSet={`https://flagcdn.com/48x36/${country.flag}.png 2x, https://flagcdn.com/72x54/${country.flag}.png 3x`} 
          width="24" 
          height="18"
          alt={`${country.name} flag`}
          className="rounded-sm shadow-sm"
        />
        <span className="text-sm font-medium">{country.name}</span>
      </div>
      {country.name === 'Sudan' && <Flag className="h-4 w-4 text-blue-500" />}
    </button>
  );
};

export default CountryButton;
