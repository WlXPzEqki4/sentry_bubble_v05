
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import BubbleChartNodeDetails from './BubbleChartNodeDetails';
import BubbleChartSigma from './BubbleChartSigma';
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

  const { graphData, isLoading, error } = useBubbleChart(selectedNetwork, userClassificationLevel);

  const handleNodeClick = (node: any) => {
    setSelectedNode(node);
  };

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
          <div className={`flex-grow ${selectedNode ? 'w-2/3' : 'w-full'}`} style={{ height: '80vh' }}>
            <BubbleChartSigma
              graphData={graphData}
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              resetSearch={resetSearch}
              onNodeClick={handleNodeClick}
              isLoading={isLoading}
            />
          </div>
          
          {selectedNode && (
            <div className="w-full md:w-1/3 border-l border-gray-200 p-4 overflow-y-auto" style={{ maxHeight: '80vh' }}>
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
