
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import BubbleChartNodeDetails from './BubbleChartNodeDetails';
import { useBubbleChart } from '@/hooks/use-bubble-chart';
import { SigmaContainer, ControlsContainer, ZoomControl, FullScreenControl } from "@react-sigma/core";
import BubbleChartSigma from './BubbleChartSigma';
import { ForceAtlasControl } from './ForceAtlasControl';

// CSS is included in the component with inline styles

interface BubbleChartVisualizationProps {
  selectedNetwork: string;
  userClassificationLevel: string;
}

const BubbleChartVisualization: React.FC<BubbleChartVisualizationProps> = ({
  selectedNetwork,
  userClassificationLevel
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { nodes, edges, isLoading, error } = useBubbleChart(selectedNetwork, userClassificationLevel);

  const handleNodeClick = useCallback((nodeId: string, attributes: any) => {
    console.log("Node clicked:", nodeId, attributes);
    setSelectedNode({
      id: nodeId,
      data: attributes
    });
  }, []);

  const resetSelectedNode = () => {
    setSelectedNode(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const resetSearch = () => {
    setSearchTerm('');
  };

  // Add global CSS for Sigma.js
  useEffect(() => {
    // Create a style element for Sigma CSS
    const style = document.createElement('style');
    style.textContent = `
      .sigma-mouse {
        cursor: crosshair;
      }
      .sigma-mouse.dragging {
        cursor: move;
      }
      .sigma-mouse.selecting {
        cursor: crosshair;
      }
      .sigma-labels > .sigma-label {
        font-family: sans-serif;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (error) {
    return (
      <Card className="mt-4">
        <CardContent className="p-6">
          <div className="p-8 text-center">
            <p className="text-red-500">Error loading network data: {error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="mt-4">
        <CardContent className="p-6">
          <Skeleton className="h-[400px] w-full rounded-md" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          <div 
            ref={containerRef}
            className={`flex-grow ${selectedNode ? 'w-2/3' : 'w-full'} relative`} 
            style={{ height: '70vh', minHeight: '500px' }}
          >
            {nodes.length === 0 ? (
              <div className="h-full w-full flex items-center justify-center">
                <p className="text-gray-500">No data available for this network.</p>
              </div>
            ) : (
              <SigmaContainer
                style={{ height: "100%", width: "100%" }}
                settings={{
                  nodeProgramClasses: {},
                  defaultNodeColor: "#6366F1",
                  defaultEdgeColor: "#e0e0e0",
                  labelDensity: 0.07,
                  labelGridCellSize: 60,
                  labelRenderedSizeThreshold: 6,
                  allowInvalidContainer: true
                }}
              >
                <BubbleChartSigma 
                  nodes={nodes}
                  edges={edges}
                  searchTerm={searchTerm}
                  onNodeClick={handleNodeClick}
                />
                <ControlsContainer position={"bottom-right"}>
                  <ZoomControl />
                  <FullScreenControl />
                </ControlsContainer>
                <ForceAtlasControl />
              </SigmaContainer>
            )}
          </div>
          
          {selectedNode && (
            <div className="w-full md:w-1/3 border-l border-gray-200 p-4 overflow-y-auto" style={{ maxHeight: '70vh' }}>
              <BubbleChartNodeDetails 
                node={selectedNode}
                onClose={resetSelectedNode}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BubbleChartVisualization;
