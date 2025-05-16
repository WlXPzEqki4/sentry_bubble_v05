
import React, { useEffect, useState, useRef } from 'react';
import { Sigma } from "react-sigma";
import Graph from "graphology";
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Panel } from '@/components/ui/panel';
import { getFamilyColor } from '@/utils/colors';

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
  const sigmaRef = useRef<any>(null);
  const graphRef = useRef<any>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  
  // Generate a key for re-rendering Sigma when data changes
  const key = `sigma-${graphData ? JSON.stringify(graphData).length : '0'}-${Date.now()}`;

  // Initialize the graph when component mounts or data changes
  const initializeGraph = () => {
    if (!graphData || !graphData.nodes || !sigmaRef.current) return;
    
    // Create a new graph instance
    const graph = new Graph();
    graphRef.current = graph;
    
    // Add nodes to graph
    graphData.nodes.forEach((node: any) => {
      graph.addNode(node.id.toString(), {
        ...node,
        size: node.size || 5,
        label: node.label,
        color: getFamilyColor(node.family),
        x: Math.random(),
        y: Math.random()
      });
    });

    // Add edges to graph
    graphData.edges.forEach((edge: any) => {
      graph.addEdge(
        edge.source.toString(),
        edge.target.toString(), 
        {
          weight: edge.weight,
          size: edge.weight / 2,
          color: "#aaa"
        }
      );
    });
    
    // Get the sigma instance and set the graph
    const sigma = sigmaRef.current.getSigmaInstance();
    
    // Set the graph
    sigma.graph.clear();
    sigma.graph.read(graph.export());
    sigma.refresh();
    
    // Add event listeners
    sigma.bind('clickNode', (event: any) => {
      const nodeId = event.data.node;
      const nodeAttributes = sigma.graph.getNodeAttributes(nodeId);
      onNodeClick({ 
        id: nodeId, 
        data: nodeAttributes 
      });
    });
    
    // Position camera
    sigma.camera.goTo({
      x: 0.5,
      y: 0.5,
      ratio: 1.2
    });
  };

  // Effect for initializing the graph
  useEffect(() => {
    if (sigmaRef.current) {
      initializeGraph();
    }
  }, [graphData, sigmaRef.current]);

  // Filter nodes based on search term
  useEffect(() => {
    if (!sigmaRef.current || !searchTerm) return;
    
    const sigma = sigmaRef.current.getSigmaInstance();
    const searchLower = searchTerm.toLowerCase();
    
    sigma.graph.nodes().forEach((nodeId: string) => {
      const attributes = sigma.graph.getNodeAttributes(nodeId);
      const label = attributes.label ? attributes.label.toLowerCase() : '';
      const matches = label.includes(searchLower);
      
      if (!matches) {
        sigma.graph.setNodeAttribute(nodeId, 'hidden', true);
      } else {
        sigma.graph.setNodeAttribute(nodeId, 'hidden', false);
      }
    });
    
    sigma.refresh();
    
    // Reset when search is cleared
    return () => {
      if (sigmaRef.current) {
        const sigma = sigmaRef.current.getSigmaInstance();
        sigma.graph.nodes().forEach((nodeId: string) => {
          sigma.graph.setNodeAttribute(nodeId, 'hidden', false);
        });
        sigma.refresh();
      }
    };
  }, [searchTerm]);

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Skeleton className="h-[400px] w-[90%] rounded-md" />
      </div>
    );
  }

  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-gray-500">No data available for this network.</p>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      <Sigma 
        ref={sigmaRef}
        key={key}
        style={{ height: "100%", width: "100%" }}
        settings={{
          defaultNodeColor: "#9b87f5",
          defaultEdgeColor: "#eee",
          labelColor: "node",
          labelSize: 14,
          labelThreshold: 7,
          drawEdges: true,
          minEdgeSize: 1,
          maxEdgeSize: 3
        }}
      />
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
    </div>
  );
};

export default BubbleChartSigma;
