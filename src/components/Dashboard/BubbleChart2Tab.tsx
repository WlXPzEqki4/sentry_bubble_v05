
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { GraphData, ForceConfig, layoutPresets } from './BubbleChart2/types';
import GraphControls from './BubbleChart2/GraphControls';
import GraphVisualization from './BubbleChart2/GraphVisualization';
import GraphLegend from './BubbleChart2/GraphLegend';
import { useSupabaseGraphData } from '@/hooks/use-supabase-graph-data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

const BubbleChart2Tab: React.FC = () => {
  // Reference to the ForceGraph instance
  const forceGraphRef = useRef<any>(null);
  
  // State for graph selection
  const [selectedGraphId, setSelectedGraphId] = useState<string>('romeo-and-juliet');
  
  // Use the new Supabase hook
  const { 
    graphData, 
    isLoading, 
    error,
    availableGraphs 
  } = useSupabaseGraphData(selectedGraphId);
  
  // Selected layout preset
  const [selectedLayout, setSelectedLayout] = useState<string>("default");

  // Force layout configuration options
  const [forceConfig, setForceConfig] = useState<ForceConfig>({
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
  const handleForceConfigChange = (param: keyof ForceConfig, value: number) => {
    setForceConfig(prev => ({ ...prev, [param]: value }));
    // When user manually adjusts sliders, we're in a "custom" configuration
    if (selectedLayout !== "custom") {
      setSelectedLayout("custom");
    }
  };

  // Define legend items
  const legendItems = [
    { color: '#e6550d', label: 'Montague Family' },
    { color: '#756bb1', label: 'Capulet Family' },
    { color: '#31a354', label: 'Neutral Characters' },
  ];

  return (
    <div className="space-y-6">
      <Card className="shadow-sm border border-gray-100">
        <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-1">Character Network Visualization</h2>
            <p className="text-sm text-gray-500 mb-4">
              Force-directed graph showing relationships between characters.
            </p>
            
            {availableGraphs.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Network
                </label>
                <Select
                  value={selectedGraphId}
                  onValueChange={setSelectedGraphId}
                >
                  <SelectTrigger className="w-full md:w-[250px]">
                    <SelectValue placeholder="Select a graph" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableGraphs.map((graph) => (
                      <SelectItem key={graph.graph_id} value={graph.graph_id}>
                        {graph.graph_id} ({graph.node_count} nodes, {graph.link_count} links)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>
                Error loading graph data: {error.message}
              </AlertDescription>
            </Alert>
          )}
          
          {isLoading ? (
            <div className="flex items-center justify-center h-[600px]">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Loading graph data...</span>
            </div>
          ) : (
            <>
              {/* Layout controls component */}
              <GraphControls
                selectedLayout={selectedLayout}
                onLayoutChange={handleLayoutChange}
                forceConfig={forceConfig}
                onForceConfigChange={handleForceConfigChange}
              />
              
              {/* Graph visualization component */}
              {graphData && (
                <GraphVisualization
                  graphData={graphData}
                  forceConfig={forceConfig}
                  forceGraphRef={forceGraphRef}
                />
              )}
              
              {/* Legend component */}
              <GraphLegend legends={legendItems} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BubbleChart2Tab;
