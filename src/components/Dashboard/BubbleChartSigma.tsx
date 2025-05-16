import React, { useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useRegisterEvents, useSigma } from "@react-sigma/core";
import Graph from "graphology";
import { ForceAtlasControl } from './ForceAtlasControl';

interface BubbleChartSigmaProps {
  nodes: any[];
  edges: any[];
  searchTerm: string;
  onNodeClick: (nodeId: string, attributes: any) => void;
}

// Define a color palette for different communities
const COMMUNITY_COLORS = [
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F97316', // Orange
  '#14B8A6', // Teal
  '#3B82F6', // Blue
  '#10B981', // Green
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
];

const BubbleChartSigma: React.FC<BubbleChartSigmaProps> = ({ 
  nodes, 
  edges, 
  searchTerm,
  onNodeClick
}) => {
  const sigma = useSigma();
  const registerEvents = useRegisterEvents();
  
  useEffect(() => {
    // Create a new graph instance
    const graph = new Graph();
    
    // Add nodes to the graph
    nodes.forEach(node => {
      const communityIndex = typeof node.data.community === 'number' 
        ? node.data.community % COMMUNITY_COLORS.length 
        : typeof node.data.community === 'string' 
          ? parseInt(node.data.community, 10) % COMMUNITY_COLORS.length || 0
          : 0;
      
      const nodeColor = node.data.color || COMMUNITY_COLORS[communityIndex];
      const nodeSize = node.data.size ? Math.max(2, Math.min(15, node.data.size * 2)) : 5;
      
      graph.addNode(node.id, {
        x: Math.random(),
        y: Math.random(),
        size: nodeSize,
        label: node.data.label,
        color: nodeColor,
        description: node.data.description,
        community: node.data.community,
        originalData: node.data
      });
    });
    
    // Add edges to the graph
    edges.forEach(edge => {
      if (graph.hasNode(edge.source) && graph.hasNode(edge.target)) {
        graph.addEdge(edge.source, edge.target, {
          weight: edge.style?.strokeWidth || 1,
          size: (edge.style?.strokeWidth || 1) / 2,
        });
      }
    });
    
    // Import the graph to sigma
    sigma.setGraph(graph);
    
    // Register node click event
    registerEvents({
      clickNode: (event) => {
        const nodeAttributes = sigma.getGraph().getNodeAttributes(event.node);
        onNodeClick(event.node, nodeAttributes);
      }
    });
    
    return () => {
      // Cleanup
      registerEvents({});
    };
  }, [nodes, edges, sigma, registerEvents, onNodeClick]);
  
  // Filter nodes based on search term
  useEffect(() => {
    if (!searchTerm) {
      // If no search term, show all nodes
      sigma.getGraph().forEachNode((node) => {
        sigma.getGraph().setNodeAttribute(node, "hidden", false);
      });
      return;
    }
    
    // Otherwise, hide nodes that don't match the search term
    sigma.getGraph().forEachNode((node) => {
      const attributes = sigma.getGraph().getNodeAttributes(node);
      const matchesSearch = attributes.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          attributes.description?.toLowerCase().includes(searchTerm.toLowerCase());
      sigma.getGraph().setNodeAttribute(node, "hidden", !matchesSearch);
    });
  }, [searchTerm, sigma]);
  
  return (
    <>
      <div className="absolute top-4 left-4 z-10">
        <div className="flex items-center bg-white p-2 rounded-md shadow-sm">
          <Search className="h-4 w-4 text-gray-500 mr-2" />
          <Input
            placeholder="Search nodes..."
            value={searchTerm}
            readOnly={true}
            className="h-8 w-[200px] border-none focus-visible:ring-0"
          />
        </div>
      </div>
      <ForceAtlasControl />
    </>
  );
};

export default BubbleChartSigma;
