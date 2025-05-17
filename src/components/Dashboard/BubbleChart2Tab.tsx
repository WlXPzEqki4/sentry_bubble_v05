
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { GraphData, ForceConfig, layoutPresets } from './BubbleChart2/types';
import GraphVisualization from './BubbleChart2/GraphVisualization';
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

  return (
    <div className="space-y-6">
      <Card className="shadow-sm border border-gray-100">
        <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-1">Narrative Intelligence Map</h2>
            <p className="text-sm text-gray-500 mb-4">
              Force-directed graph visualizing narrative intelligence connections and influence networks.
            </p>
            
            {/* Layout controls component with network selector inside the same grey box */}
            {!isLoading && !error && graphData && (
              <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Layout Configuration
                    </label>
                    <Select
                      value={selectedLayout}
                      onValueChange={handleLayoutChange}
                    >
                      <SelectTrigger className="w-full">
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
                  
                  {availableGraphs.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Network
                      </label>
                      <Select
                        value={selectedGraphId}
                        onValueChange={setSelectedGraphId}
                      >
                        <SelectTrigger className="w-full">
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
              {/* Graph visualization component */}
              {graphData && (
                <GraphVisualization
                  graphData={graphData}
                  forceConfig={forceConfig}
                  forceGraphRef={forceGraphRef}
                />
              )}
              
              {/* Legend component removed */}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BubbleChart2Tab;
