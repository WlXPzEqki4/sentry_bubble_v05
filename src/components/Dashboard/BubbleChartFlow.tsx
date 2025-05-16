
import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  Panel,
  MarkerType,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import BubbleChartNode from '@/components/Dashboard/BubbleChartNode';

interface BubbleChartFlowProps {
  nodes: any[];
  edges: any[];
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onNodeClick: (event: React.MouseEvent, node: any) => void;
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  resetSearch: () => void;
  isLoading: boolean;
}

const BubbleChartFlow: React.FC<BubbleChartFlowProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
  searchTerm,
  onSearchChange,
  resetSearch,
  isLoading
}) => {
  // Node types for custom rendering - memoized to prevent React Flow warnings
  const nodeTypes = useMemo(() => ({
    bubbleNode: BubbleChartNode,
    default: BubbleChartNode // Use the same component for any unspecified node types
  }), []);

  const onConnect = useCallback((params: any) => {
    return addEdge({ ...params, animated: true }, edges);
  }, [edges]);

  const filteredNodes = nodes.filter((node) => {
    if (!searchTerm) return true;
    return node.data.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
           node.data.description?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Skeleton className="h-[400px] w-[90%] rounded-md" />
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-gray-500">No data available for this network.</p>
      </div>
    );
  }

  return (
    <ReactFlow
      nodes={filteredNodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={onNodeClick}
      nodeTypes={nodeTypes}
      fitView
    >
      <Background />
      <Controls />
      <MiniMap style={{ height: 120 }} zoomable pannable />
      <Panel position="top-left">
        <div className="flex items-center bg-white p-2 rounded-md shadow-sm">
          <Search className="h-4 w-4 text-gray-500 mr-2" />
          <Input
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={onSearchChange}
            className="h-8 w-[200px] border-none focus-visible:ring-0"
          />
          {searchTerm && (
            <button className="h-8 w-8 p-0 ml-1" onClick={resetSearch}>
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </Panel>
    </ReactFlow>
  );
};

export default BubbleChartFlow;
