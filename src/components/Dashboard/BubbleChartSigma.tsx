
import React, { useRef } from 'react';
import { useSigmaGraph } from '@/hooks/use-sigma-graph';
import { useSigmaInteraction } from '@/hooks/use-sigma-interaction';
import SearchBar from './BubbleChart/SearchBar';
import DragInfo from './BubbleChart/DragInfo';
import GraphLoading from './BubbleChart/GraphLoading';
import GraphEmpty from './BubbleChart/GraphEmpty';

interface BubbleChartSigmaProps {
  graphData: any;
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  resetSearch: () => void;
  onNodeClick: (node: any) => void;
  isLoading: boolean;
}

const BubbleChartSigma: React.FC<BubbleChartSigmaProps> = ({
  graphData,
  searchTerm,
  onSearchChange,
  resetSearch,
  onNodeClick,
  isLoading
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use custom hooks
  const { sigmaRef, graphRef } = useSigmaGraph(graphData, searchTerm, containerRef);
  const { hoveredNode, isDragging, draggedNode } = useSigmaInteraction({
    sigmaRef,
    graphRef,
    containerRef,
    onNodeClick
  });

  if (isLoading) {
    return <GraphLoading />;
  }

  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    return <GraphEmpty />;
  }

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} className="w-full h-full" />
      
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        resetSearch={resetSearch}
      />

      <DragInfo />
    </div>
  );
};

export default BubbleChartSigma;
