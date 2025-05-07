
import React, { useState } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import MapContainer from './Map/MapContainer';
import CountryList from './Map/CountryList';
import MapControls from './Map/MapControls';
import { africanCountries } from './Map/africanCountriesData';

interface SelectedCountry {
  name: string;
  coordinates: number[];
  flag: string;
}

const MapTab: React.FC = () => {
  const [rotationEnabled, setRotationEnabled] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<SelectedCountry | null>(null);

  const handleToggleRotation = () => {
    setRotationEnabled(!rotationEnabled);
  };

  const handleMapLoaded = () => {
    console.log("Map loaded callback triggered");
    setRotationEnabled(true);
  };

  const handleCountryClick = (country: typeof africanCountries[0]) => {
    console.log("Country selected:", country.name);
    
    // Turn off rotation when Sudan is selected to focus on the country
    if (country.name === 'Sudan') {
      setRotationEnabled(false);
    }
    
    // Set the selected country after rotation is disabled
    setSelectedCountry(country);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <MapControls 
        rotationEnabled={rotationEnabled}
        onToggleRotation={handleToggleRotation}
      />
      
      <p className="text-sm text-gray-500 mb-6">
        Interactive 3D globe visualization. Drag to rotate, scroll to zoom.
      </p>
      
      <ResizablePanelGroup direction="horizontal" className="border rounded-lg">
        <ResizablePanel defaultSize={75}>
          <div className="relative w-full h-[600px]">
            <MapContainer
              rotationEnabled={rotationEnabled}
              onMapLoaded={handleMapLoaded}
              selectedCountry={selectedCountry}
            />
          </div>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={25}>
          <div className="h-[600px]">
            <CountryList
              countries={africanCountries}
              selectedCountry={selectedCountry?.name || null}
              onCountryClick={handleCountryClick}
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default MapTab;
