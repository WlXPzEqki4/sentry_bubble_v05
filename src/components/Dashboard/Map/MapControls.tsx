
import React from 'react';
import { Toggle } from '@/components/ui/toggle';
import { RotateCw, RotateCcw } from 'lucide-react';

interface MapControlsProps {
  rotationEnabled: boolean;
  onToggleRotation: () => void;
}

const MapControls: React.FC<MapControlsProps> = ({ 
  rotationEnabled, 
  onToggleRotation 
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-semibold">Global Visualization</h2>
      <Toggle 
        pressed={rotationEnabled} 
        onPressedChange={onToggleRotation} 
        aria-label="Toggle rotation"
        className="ml-2"
      >
        {rotationEnabled ? (
          <RotateCw className="h-4 w-4 mr-2" />
        ) : (
          <RotateCcw className="h-4 w-4 mr-2" />
        )}
        {rotationEnabled ? 'Rotation On' : 'Rotation Off'}
      </Toggle>
    </div>
  );
};

export default MapControls;
