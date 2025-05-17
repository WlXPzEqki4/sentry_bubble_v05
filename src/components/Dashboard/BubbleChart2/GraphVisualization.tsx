
import React, { useCallback, useRef, useEffect, useState } from 'react';
import { ForceGraph2D } from 'react-force-graph';
import { GraphData, ForceConfig } from './types';
import { getFamilyColor } from '@/utils/colors';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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
    const { x, y, id, family, val } = node;
    const size = Math.max(val, 4);
    
    // Determine node category from ID for Sudan news graph
    const category = id.includes('N') ? getNodeCategory(id) : family;
    
    // Calculate label size based on zoom level
    const fontSize = Math.max(12 / globalScale, 1.5);
    
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
      ctx.font = `${fontSize}px Sans-Serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'black';
      
      // Add background for text readability
      const textWidth = ctx.measureText(id).width;
      const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.5);
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillRect(
        x - bckgDimensions[0] / 2, 
        y - bckgDimensions[1] / 2 + size / 2 + fontSize, 
        bckgDimensions[0], 
        bckgDimensions[1]
      );
      
      // Draw text - Fixed issue: the fillText method expects 3 arguments (text, x, y)
      ctx.fillStyle = '#333';
      ctx.fillText(
        id, 
        x,  // x position
        y + size / 2 + fontSize  // y position
      );
    }
    
    return true; // Indicate we fully custom rendered the node
  }, [showLabels]); // Add showLabels as dependency

  return (
    <div className="flex flex-col h-full w-full">
      {/* Add the toggle controls */}
      <div className="flex items-center justify-end p-2 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Label htmlFor="show-labels" className="text-sm cursor-pointer">Show Labels</Label>
          <Switch 
            id="show-labels" 
            checked={showLabels} 
            onCheckedChange={setShowLabels}
          />
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
