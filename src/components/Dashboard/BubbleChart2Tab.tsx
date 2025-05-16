import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ForceGraph2D } from 'react-force-graph';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface Node {
  id: string;
  family: 'Montague' | 'Capulet' | 'Neutral';
  val: number;
}

interface Link {
  source: string;
  target: string;
  value: number;
}

interface GraphData {
  nodes: Node[];
  links: Link[];
}

// Predefined layout configurations
interface LayoutConfig {
  name: string;
  chargeStrength: number;
  linkDistance: number;
  centerStrength: number;
}

const layoutPresets: Record<string, LayoutConfig> = {
  default: {
    name: "Default",
    chargeStrength: -120,
    linkDistance: 30,
    centerStrength: 0.1
  },
  clustered: {
    name: "Clustered",
    chargeStrength: -50,
    linkDistance: 40,
    centerStrength: 0.05
  },
  spread: {
    name: "Spread Out",
    chargeStrength: -200,
    linkDistance: 60,
    centerStrength: 0.02
  },
  compact: {
    name: "Compact",
    chargeStrength: -30,
    linkDistance: 20,
    centerStrength: 0.2
  },
  hierarchical: {
    name: "Hierarchical",
    chargeStrength: -100,
    linkDistance: 50,
    centerStrength: 0.15
  }
};

const BubbleChart2Tab: React.FC = () => {
  // Reference to the ForceGraph instance
  const forceGraphRef = useRef<any>(null);
  
  const [graphData] = useState<GraphData>({
    nodes: [
      { id: "Romeo", family: "Montague", val: 20 },
      { id: "Montague", family: "Montague", val: 15 },
      { id: "Lady Montague", family: "Montague", val: 10 },
      { id: "Benvolio", family: "Montague", val: 12 },
      { id: "Mercutio", family: "Montague", val: 18 },
      { id: "Juliet", family: "Capulet", val: 20 },
      { id: "Capulet", family: "Capulet", val: 15 },
      { id: "Lady Capulet", family: "Capulet", val: 10 },
      { id: "Tybalt", family: "Capulet", val: 16 },
      { id: "Nurse", family: "Capulet", val: 14 },
      { id: "Prince Escalus", family: "Neutral", val: 18 },
      { id: "Paris", family: "Neutral", val: 12 },
      { id: "Friar Lawrence", family: "Neutral", val: 16 },
      { id: "Rosaline", family: "Capulet", val: 8 },
      { id: "Balthasar", family: "Montague", val: 8 },
      { id: "Sampson", family: "Capulet", val: 6 },
      { id: "Gregory", family: "Capulet", val: 6 },
      { id: "Peter", family: "Neutral", val: 5 },
      { id: "Abraham", family: "Montague", val: 5 }
    ],
    links: [
      { source: "Romeo", target: "Juliet", value: 10 },
      { source: "Romeo", target: "Montague", value: 5 },
      { source: "Romeo", target: "Mercutio", value: 8 },
      { source: "Romeo", target: "Benvolio", value: 7 },
      { source: "Romeo", target: "Friar Lawrence", value: 6 },
      { source: "Romeo", target: "Balthasar", value: 3 },
      { source: "Romeo", target: "Rosaline", value: 2 },
      { source: "Romeo", target: "Tybalt", value: 4 },
      { source: "Juliet", target: "Capulet", value: 5 },
      { source: "Juliet", target: "Lady Capulet", value: 4 },
      { source: "Juliet", target: "Nurse", value: 7 },
      { source: "Juliet", target: "Friar Lawrence", value: 6 },
      { source: "Juliet", target: "Tybalt", value: 3 },
      { source: "Juliet", target: "Paris", value: 4 },
      { source: "Montague", target: "Lady Montague", value: 6 },
      { source: "Montague", target: "Benvolio", value: 3 },
      { source: "Capulet", target: "Lady Capulet", value: 6 },
      { source: "Capulet", target: "Tybalt", value: 4 },
      { source: "Capulet", target: "Paris", value: 3 },
      { source: "Capulet", target: "Prince Escalus", value: 2 },
      { source: "Mercutio", target: "Benvolio", value: 5 },
      { source: "Mercutio", target: "Tybalt", value: 5 },
      { source: "Mercutio", target: "Paris", value: 2 },
      { source: "Mercutio", target: "Prince Escalus", value: 3 },
      { source: "Nurse", target: "Friar Lawrence", value: 2 },
      { source: "Tybalt", target: "Benvolio", value: 3 },
      { source: "Prince Escalus", target: "Paris", value: 3 },
      { source: "Sampson", target: "Gregory", value: 4 },
      { source: "Sampson", target: "Abraham", value: 2 },
      { source: "Gregory", target: "Abraham", value: 2 },
      { source: "Paris", target: "Friar Lawrence", value: 2 }
    ]
  });

  // Selected layout preset
  const [selectedLayout, setSelectedLayout] = useState<string>("default");

  // Force layout configuration options
  const [forceConfig, setForceConfig] = useState({
    chargeStrength: layoutPresets.default.chargeStrength,
    linkDistance: layoutPresets.default.linkDistance,
    centerStrength: layoutPresets.default.centerStrength
  });

  // Handle layout preset selection
  const handleLayoutChange = (layoutKey: string) => {
    const layout = layoutPresets[layoutKey];
    setSelectedLayout(layoutKey);
    setForceConfig({
      chargeStrength: layout.chargeStrength,
      linkDistance: layout.linkDistance,
      centerStrength: layout.centerStrength
    });
  };

  // Handle slider changes
  const handleForceConfigChange = (param: keyof typeof forceConfig, value: number) => {
    setForceConfig(prev => ({ ...prev, [param]: value }));
    // When user manually adjusts sliders, we're in a "custom" configuration
    if (selectedLayout !== "custom") {
      setSelectedLayout("custom");
    }
  };

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
  }, [forceConfig]);

  // Color mapping for families
  const getFamilyColor = (family: string): string => {
    switch (family) {
      case 'Montague': return '#e6550d';
      case 'Capulet': return '#756bb1';
      case 'Neutral': return '#31a354';
      default: return '#999';
    }
  };

  const nodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const { x, y, id, family, val } = node;
    const size = Math.max(val, 4);
    
    // Calculate label size based on zoom level
    const fontSize = Math.max(12 / globalScale, 1.5);
    
    // Draw node circle
    ctx.beginPath();
    ctx.fillStyle = getFamilyColor(family);
    ctx.arc(x, y, size / 3, 0, 2 * Math.PI);
    ctx.fill();
    
    // Add border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    
    // Draw label if zoom is sufficient
    if (globalScale > 0.4 || val > 10) {
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
      
      // Draw text
      ctx.fillStyle = '#333';
      ctx.fillText(
        id, 
        x, 
        y + size / 2 + fontSize
      );
    }
    
    return true; // Indicate we fully custom rendered the node
  }, []);

  return (
    <div className="space-y-6">
      <Card className="shadow-sm border border-gray-100">
        <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-1">Romeo and Juliet Character Network</h2>
            <p className="text-sm text-gray-500">
              Force-directed graph showing relationships between characters from Shakespeare's Romeo and Juliet.
            </p>
          </div>
          
          {/* Layout dropdown and force controls */}
          <div className="mb-6 space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Layout Configuration
                </label>
                <Select
                  value={selectedLayout}
                  onValueChange={handleLayoutChange}
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
                    onChange={(e) => handleForceConfigChange('chargeStrength', parseInt(e.target.value))}
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
                    onChange={(e) => handleForceConfigChange('linkDistance', parseInt(e.target.value))}
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
                    onChange={(e) => handleForceConfigChange('centerStrength', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">Strength of central gravity (pulls nodes to center)</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="h-[600px] w-full border border-gray-200 rounded-md overflow-hidden">
            <ForceGraph2D
              ref={forceGraphRef}
              graphData={graphData}
              nodeCanvasObject={nodeCanvasObject}
              linkWidth={link => (link as any).value / 2}
              linkColor={() => '#999'}
              d3VelocityDecay={0.3}
              cooldownTime={2000}
            />
          </div>
          
          <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#e6550d' }}></div>
              <span>Montague Family</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#756bb1' }}></div>
              <span>Capulet Family</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#31a354' }}></div>
              <span>Neutral Characters</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BubbleChart2Tab;
