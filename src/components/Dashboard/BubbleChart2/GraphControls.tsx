
import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ForceConfig, layoutPresets } from './types';

interface GraphControlsProps {
  selectedLayout: string;
  onLayoutChange: (layout: string) => void;
  forceConfig: ForceConfig;
  onForceConfigChange: (param: keyof ForceConfig, value: number) => void;
}

const GraphControls: React.FC<GraphControlsProps> = ({
  selectedLayout,
  onLayoutChange,
  forceConfig,
  onForceConfigChange
}) => {
  return (
    <div className="mb-6 space-y-4">
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Layout Configuration
          </label>
          <Select
            value={selectedLayout}
            onValueChange={onLayoutChange}
          >
            <SelectTrigger className="w-full md:w-[250px]">
              <SelectValue placeholder="Select layout" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(layoutPresets).map(([key, layout]) => (
                <SelectItem key={key} value={key}>{layout.name}</SelectItem>
              ))}
              {selectedLayout === "custom" && (
                <SelectItem value="custom">Custom</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Charge Strength: {forceConfig.chargeStrength}
            </label>
            <input
              type="range"
              min="-300"
              max="-10"
              value={forceConfig.chargeStrength}
              onChange={(e) => onForceConfigChange('chargeStrength', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">Controls node repulsion (negative values) or attraction (positive)</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link Distance: {forceConfig.linkDistance}
            </label>
            <input
              type="range"
              min="10"
              max="100"
              value={forceConfig.linkDistance}
              onChange={(e) => onForceConfigChange('linkDistance', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">Target distance between connected nodes</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Center Gravity: {forceConfig.centerStrength}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={forceConfig.centerStrength}
              onChange={(e) => onForceConfigChange('centerStrength', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">Strength of central gravity (pulls nodes to center)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphControls;
