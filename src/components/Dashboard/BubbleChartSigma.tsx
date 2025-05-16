
import React, { useEffect, useState, useRef } from 'react';
import { Sigma } from "sigma";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const sigmaRef = useRef<Sigma | null>(null);
  const graphRef = useRef<Graph | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  
  // Initialize the graph when component mounts or data changes
  useEffect(() => {
    if (!graphData || !graphData.nodes || !containerRef.current) return;
    
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
    
    // Initialize sigma
    const sigma = new Sigma(graph, containerRef.current, {
      defaultNodeColor: "#9b87f5",
      defaultEdgeColor: "#eee",
      labelColor: { attribute: "color" }, // Fix for TS2322 error - using object format instead of string
      labelSize: 14,
      labelThreshold: 7,
      renderEdgeLabels: false
    });
    
    sigmaRef.current = sigma;
    
    // Add event listeners
    sigma.on("clickNode", (event) => {
      const nodeId = event.node;
      const nodeAttributes = graph.getNodeAttributes(nodeId);
      onNodeClick({ 
        id: nodeId, 
        data: nodeAttributes 
      });
    });

    sigma.on("enterNode", (event) => {
      setHoveredNode(event.node);
      graph.setNodeAttribute(event.node, "hovered", true);
      sigma.refresh();
    });

    sigma.on("leaveNode", (event) => {
      setHoveredNode(null);
      graph.setNodeAttribute(event.node, "hovered", false);
      sigma.refresh();
    });
    
    // Position camera - Fix for TS2353 error - removed duration property
    sigma.getCamera().animate({
      x: 0.5,
      y: 0.5,
      ratio: 1.2
      // duration property removed as it's not part of the CameraState type
    });
    
    // Cleanup
    return () => {
      sigma.kill();
      sigmaRef.current = null;
    };
  }, [graphData, onNodeClick]);

  // Filter nodes based on search term
  useEffect(() => {
    if (!sigmaRef.current || !graphRef.current) return;
    
    const graph = graphRef.current;
    const sigma = sigmaRef.current;
    
    if (!searchTerm) {
      // If search is empty, show all nodes
      graph.forEachNode((nodeId) => {
        graph.setNodeAttribute(nodeId, "hidden", false);
      });
      sigma.refresh();
      return;
    }
    
    const searchLower = searchTerm.toLowerCase();
    
    graph.forEachNode((nodeId) => {
      const attributes = graph.getNodeAttributes(nodeId);
      const label = attributes.label ? attributes.label.toLowerCase() : '';
      const matches = label.includes(searchLower);
      
      graph.setNodeAttribute(nodeId, "hidden", !matches);
    });
    
    sigma.refresh();
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
    <div className="w-full h-full relative">
      <div ref={containerRef} className="w-full h-full" />
      
      <div className="absolute top-4 left-4 z-10">
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
      </div>
    </div>
  );
};

export default BubbleChartSigma;
