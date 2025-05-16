
import React, { useEffect, useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useRegisterEvents, useSigma } from "@react-sigma/core";
import Graph from "graphology";

interface BubbleChartSigmaProps {
  nodes: any[];
  edges: any[];
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
  onNodeClick
}) => {
  const sigma = useSigma();
  const registerEvents = useRegisterEvents();
  const [localSearchTerm, setLocalSearchTerm] = useState<string>("");
  
  // Create a new graph and set it on sigma
  const initializeGraph = useCallback(() => {
    if (!sigma || !nodes.length) return;
    
    console.log("Creating new graph with", nodes.length, "nodes and", edges.length, "edges");
    
    // Create a new graph instance
    const graph = new Graph();
    
    // Add nodes to the graph with proper positioning
    nodes.forEach(node => {
      const communityIndex = typeof node.data.community === 'number' 
        ? node.data.community % COMMUNITY_COLORS.length 
        : typeof node.data.community === 'string' 
          ? parseInt(node.data.community, 10) % COMMUNITY_COLORS.length || 0
          : 0;
      
      const nodeColor = node.data.color || COMMUNITY_COLORS[communityIndex];
      const nodeSize = node.data.size ? Math.max(2, Math.min(15, node.data.size * 2)) : 5;
      
      try {
        // Use random positions but normalized between 0-1
        const x = node.position ? node.position.x / 1000 : Math.random();
        const y = node.position ? node.position.y / 1000 : Math.random();
        
        graph.addNode(node.id, {
          x,
          y,
          size: nodeSize,
          label: node.data.label,
          color: nodeColor,
          description: node.data.description,
          community: node.data.community,
          originalData: node.data
        });
      } catch (err) {
        console.error(`Error adding node ${node.id}:`, err);
      }
    });
    
    // Add edges to the graph
    edges.forEach(edge => {
      try {
        if (graph.hasNode(edge.source) && graph.hasNode(edge.target)) {
          graph.addEdge(edge.source, edge.target, {
            size: edge.style?.strokeWidth || 1,
            weight: edge.style?.strokeWidth || 1,
            color: "#aaa"
          });
        }
      } catch (err) {
        console.error(`Error adding edge from ${edge.source} to ${edge.target}:`, err);
      }
    });
    
    // Set the graph to sigma
    sigma.setGraph(graph);
    console.log("Graph set on sigma");
    
    // Reset camera position and refresh
    setTimeout(() => {
      sigma.getCamera().reset();
      sigma.refresh();
    }, 50);
    
  }, [nodes, edges, sigma]);
  
  // Initialize graph when component mounts or data changes
  useEffect(() => {
    initializeGraph();
  }, [initializeGraph]);
  
  // Register click handler
  useEffect(() => {
    if (!sigma) return;
    
    const handleClick = (e: { node: string }) => {
      console.log("Node clicked:", e.node);
      try {
        const nodeAttributes = sigma.getGraph().getNodeAttributes(e.node);
        console.log("Node attributes:", nodeAttributes);
        onNodeClick(e.node, nodeAttributes);
      } catch (err) {
        console.error("Error in click handler:", err);
      }
    };
    
    // Register click handler
    registerEvents({
      clickNode: handleClick
    });
    
    return () => {
      registerEvents({});
    };
  }, [sigma, registerEvents, onNodeClick]);
  
  // Handle search functionality
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchTerm(e.target.value);
  };
  
  // Apply search filter
  useEffect(() => {
    if (!sigma) return;
    
    const graph = sigma.getGraph();
    const searchTerm = localSearchTerm.toLowerCase();
    
    if (!searchTerm) {
      // Reset all nodes to visible
      graph.forEachNode(node => {
        graph.setNodeAttribute(node, "hidden", false);
      });
    } else {
      // Hide nodes that don't match search
      graph.forEachNode(node => {
        const attrs = graph.getNodeAttributes(node);
        const label = String(attrs.label || '').toLowerCase();
        const description = String(attrs.description || '').toLowerCase();
        const matches = label.includes(searchTerm) || description.includes(searchTerm);
        graph.setNodeAttribute(node, "hidden", !matches);
      });
    }
    
    sigma.refresh();
  }, [localSearchTerm, sigma]);
  
  return (
    <div className="absolute inset-0 z-0">
      <div className="absolute top-4 left-4 z-10">
        <div className="flex items-center bg-white p-2 rounded-md shadow-sm">
          <Search className="h-4 w-4 text-gray-500 mr-2" />
          <Input
            placeholder="Search nodes..."
            value={localSearchTerm}
            onChange={handleSearchChange}
            className="h-8 w-[200px] border-none focus-visible:ring-0"
          />
        </div>
      </div>
    </div>
  );
};

export default BubbleChartSigma;
