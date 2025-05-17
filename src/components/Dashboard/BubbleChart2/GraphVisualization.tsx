import React, { useCallback, useRef, useEffect, useState } from 'react';
import { ForceGraph2D } from 'react-force-graph';
import { GraphData, ForceConfig } from './types';
import { getFamilyColor } from '@/utils/colors';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface GraphVisualizationProps {
  graphData: GraphData;
  forceConfig: ForceConfig;
  forceGraphRef: React.MutableRefObject<any>;
}

const GraphVisualization: React.FC<GraphVisualizationProps> = ({
  graphData,
  forceConfig,
  forceGraphRef
}) => {
  // Add state to control label visibility
  const [showLabels, setShowLabels] = useState<boolean>(true);
  
  // Add state for node and label size scaling
  const [nodeScale, setNodeScale] = useState<number>(1);
  const [labelScale, setLabelScale] = useState<number>(1);
  
  // Apply force changes when configuration changes
  useEffect(() => {
    // Only apply changes if we have a reference to the force graph
    if (!forceGraphRef.current) return;
    
    const fg = forceGraphRef.current;
    
    // Apply charge (repulsion) force
    fg.d3Force('charge').strength(forceConfig.chargeStrength);
    
    // Apply link distance
    fg.d3Force('link').distance(forceConfig.linkDistance);
    
    // Apply center force
    fg.d3Force('center').strength(forceConfig.centerStrength);
    
    // Reheat simulation to apply changes
    fg.d3ReheatSimulation();
  }, [forceConfig, forceGraphRef]);

  // Determine the category from node ID
  const getNodeCategory = (id: string): string => {
    if (id.includes('N1_')) return 'N1_Drone_Warfare';
    if (id.includes('N2_')) return 'N2_Humanitarian_Crisis';
    if (id.includes('N3_')) return 'N3_Atrocities_Darfur';
    if (id.includes('N4_')) return 'N4_Political_Fragmentation';
    if (id.includes('N5_')) return 'N5_International_Involvement';
    return 'Neutral'; // Default fallback
  };

  const nodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const { x, y, id, family, val, display_name } = node;
    // Apply node scaling
    const size = Math.max(val, 4) * nodeScale;
    
    // Determine node category from ID for Sudan news graph
    const category = id.includes('N') ? getNodeCategory(id) : family;
    
    // Calculate label size based on zoom level and label scale
    const fontSize = Math.max(12 / globalScale, 1.5) * labelScale;
    
    // Draw node circle
    ctx.beginPath();
    ctx.fillStyle = getFamilyColor(category);
    ctx.arc(x, y, size / 3, 0, 2 * Math.PI);
    ctx.fill();
    
    // Add border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    
    // Draw label if zoom is sufficient AND showLabels is true
    if (showLabels && (globalScale > 0.4 || val > 10)) {
      // Use display_name if available, otherwise fall back to id
      const label = display_name || id;
      
      ctx.font = `${fontSize}px Sans-Serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'black';
      
      // Add background for text readability
      const textWidth = ctx.measureText(label).width;
      const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.5);
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillRect(
        x - bckgDimensions[0] / 2, 
        y - bckgDimensions[1] / 2 + size / 2 + fontSize, 
        bckgDimensions[0], 
        bckgDimensions[1]
      );
      
      // Draw text with the display_name
      ctx.fillStyle = '#333';
      ctx.fillText(
        label,
        x,  // x position
        y + size / 2 + fontSize  // y position
      );
    }
    
    return true; // Indicate we fully custom rendered the node
  }, [showLabels, nodeScale, labelScale]); // Add nodeScale and labelScale as dependencies

  return (
    <div className="flex flex-col h-full w-full">
      {/* Move toggle controls to the left and add size sliders */}
      <div className="flex items-center justify-start p-2 bg-white border-b border-gray-200">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Label htmlFor="show-labels" className="text-sm cursor-pointer">Show Labels</Label>
            <Switch 
              id="show-labels" 
              checked={showLabels} 
              onCheckedChange={setShowLabels}
            />
          </div>
          
          <div className="flex items-center space-x-2 w-48">
            <Label htmlFor="node-size" className="text-sm min-w-20">Node Size: {nodeScale.toFixed(1)}x</Label>
            <Slider
              id="node-size"
              min={0.5}
              max={3}
              step={0.1}
              value={[nodeScale]}
              onValueChange={(value) => setNodeScale(value[0])}
              className="w-full"
            />
          </div>
          
          <div className="flex items-center space-x-2 w-48">
            <Label htmlFor="label-size" className="text-sm min-w-20">Label Size: {labelScale.toFixed(1)}x</Label>
            <Slider
              id="label-size"
              min={0.5}
              max={3}
              step={0.1}
              value={[labelScale]}
              onValueChange={(value) => setLabelScale(value[0])}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Graph visualization */}
      <div className="flex-grow border border-gray-200 rounded-md overflow-hidden">
        <ForceGraph2D
          ref={forceGraphRef}
          graphData={graphData}
          nodeCanvasObject={nodeCanvasObject}
          linkWidth={link => (link as any).value / 2}
          linkColor={() => '#888888'} // Darker gray color for edges
          d3VelocityDecay={0.3}
          cooldownTime={2000}
        />
      </div>
    </div>
  );
};

export default GraphVisualization;
