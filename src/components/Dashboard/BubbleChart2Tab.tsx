
import React, { useState, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { GraphData, ForceConfig, layoutPresets } from './BubbleChart2/types';
import GraphControls from './BubbleChart2/GraphControls';
import GraphVisualization from './BubbleChart2/GraphVisualization';
import GraphLegend from './BubbleChart2/GraphLegend';

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
            <h2 className="text-2xl font-bold mb-1">Romeo and Juliet Character Network</h2>
            <p className="text-sm text-gray-500">
              Force-directed graph showing relationships between characters from Shakespeare's Romeo and Juliet.
            </p>
          </div>
          
          {/* Layout controls component */}
          <GraphControls
            selectedLayout={selectedLayout}
            onLayoutChange={handleLayoutChange}
            forceConfig={forceConfig}
            onForceConfigChange={handleForceConfigChange}
          />
          
          {/* Graph visualization component */}
          <GraphVisualization
            graphData={graphData}
            forceConfig={forceConfig}
            forceGraphRef={forceGraphRef}
          />
          
          {/* Legend component */}
          <GraphLegend legends={legendItems} />
        </CardContent>
      </Card>
    </div>
  );
};

export default BubbleChart2Tab;
