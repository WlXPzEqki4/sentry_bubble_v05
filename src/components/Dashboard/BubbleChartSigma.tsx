
import React, { useEffect, useState, useRef } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useRegisterEvents, useSigma } from "@react-sigma/core";
import Graph from "graphology";

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
  const [graphInitialized, setGraphInitialized] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState<string>("");
  const graphRef = useRef<Graph | null>(null);
  
  // Debug logging to verify data
  useEffect(() => {
    console.log('BubbleChartSigma - Nodes received:', nodes.length);
    console.log('BubbleChartSigma - Edges received:', edges.length);
    console.log('Nodes sample:', nodes.slice(0, 2));
  }, [nodes, edges]);

  // Initialize the graph when component mounts or data changes
  useEffect(() => {
    if (!sigma || nodes.length === 0) return;
    
    try {
      console.log("Initializing Sigma graph...");
      
      // Create a new graph instance
      const graph = new Graph();
      graphRef.current = graph;
      
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
          x: node.position ? node.position.x / 800 : Math.random(),
          y: node.position ? node.position.y / 600 : Math.random(),
          size: nodeSize,
          label: node.data.label,
          color: nodeColor,
          description: node.data.description,
          community: node.data.community,
          originalData: node.data
        });
      });
      
      console.log('BubbleChartSigma - Added nodes to graph');
      
      // Add edges to the graph
      edges.forEach(edge => {
        if (graph.hasNode(edge.source) && graph.hasNode(edge.target)) {
          graph.addEdge(edge.source, edge.target, {
            weight: edge.style?.strokeWidth || 1,
            size: (edge.style?.strokeWidth || 1) / 2,
            color: "#ccc"
          });
        } else {
          console.warn(`Cannot add edge from ${edge.source} to ${edge.target} because one or both nodes don't exist`);
        }
      });
      
      console.log('BubbleChartSigma - Added edges to graph');
      
      // Import the graph to sigma
      sigma.setGraph(graph);
      console.log('BubbleChartSigma - Graph set to Sigma');
      
      // Mark graph as initialized
      setGraphInitialized(true);
      
      // Force layout recalculation and refresh
      setTimeout(() => {
        sigma.getCamera().animatedReset({ duration: 300 });
        sigma.refresh();
        console.log('BubbleChartSigma - Reset camera and refreshed Sigma');
      }, 100);
      
    } catch (error) {
      console.error('Error setting up Sigma graph:', error);
    }
  }, [nodes, edges, sigma]);

  // Register node click event
  useEffect(() => {
    if (!sigma || !graphInitialized) return;
    
    const clickHandler = (event: { node: string }) => {
      try {
        console.log('Node clicked event triggered:', event.node);
        const nodeAttributes = sigma.getGraph().getNodeAttributes(event.node);
        console.log('Node attributes:', nodeAttributes);
        onNodeClick(event.node, nodeAttributes);
      } catch (error) {
        console.error('Error handling node click:', error);
      }
    };
    
    // Register the click event handler
    registerEvents({
      clickNode: clickHandler
    });
    
    console.log('BubbleChartSigma - Registered click handler');
    
    return () => {
      // Cleanup
      registerEvents({});
    };
  }, [sigma, registerEvents, onNodeClick, graphInitialized]);
  
  // Handle local search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchTerm(e.target.value);
  };

  // Filter nodes based on search term
  useEffect(() => {
    if (!sigma || !graphInitialized) return;
    
    try {
      const searchValue = localSearchTerm.toLowerCase();
      
      if (!searchValue) {
        // If no search term, show all nodes
        sigma.getGraph().forEachNode((node) => {
          sigma.getGraph().setNodeAttribute(node, "hidden", false);
        });
        sigma.refresh();
        return;
      }
      
      // Otherwise, hide nodes that don't match the search term
      sigma.getGraph().forEachNode((node) => {
        const attributes = sigma.getGraph().getNodeAttributes(node);
        const matchesSearch = 
          attributes.label?.toLowerCase().includes(searchValue) ||
          attributes.description?.toLowerCase().includes(searchValue);
        sigma.getGraph().setNodeAttribute(node, "hidden", !matchesSearch);
      });
      
      sigma.refresh();
    } catch (error) {
      console.error('Error filtering nodes:', error);
    }
  }, [localSearchTerm, sigma, graphInitialized]);
  
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
