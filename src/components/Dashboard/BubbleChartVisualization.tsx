
import React, { useState, useCallback } from 'react';
import { useNodesState, useEdgesState } from 'reactflow';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import BubbleChartNodeDetails from './BubbleChartNodeDetails';
import BubbleChartFlow from './BubbleChartFlow';
import { useBubbleChart } from '@/hooks/use-bubble-chart';

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

  const { nodes: initialNodes, edges: initialEdges, isLoading, error } = useBubbleChart(selectedNetwork, userClassificationLevel);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes and edges when data changes
  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const handleNodeClick = useCallback((event: React.MouseEvent, node: any) => {
    setSelectedNode(node);
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

  return (
    <Card className="mt-4">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          <div className={`flex-grow ${selectedNode ? 'w-2/3' : 'w-full'}`} style={{ height: '70vh' }}>
            <BubbleChartFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={handleNodeClick}
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              resetSearch={resetSearch}
              isLoading={isLoading}
            />
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
