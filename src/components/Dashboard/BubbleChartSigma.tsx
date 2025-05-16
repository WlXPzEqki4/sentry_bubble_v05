
import React, { useEffect, useState, useRef } from 'react';
import { Sigma } from "sigma";
import Graph from "graphology";
import { Search, X, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Panel } from '@/components/ui/panel';
import { getFamilyColor } from '@/utils/colors';
import { toast } from '@/hooks/use-toast';

interface BubbleChartSigmaProps {
  graphData: any;
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  resetSearch: () => void;
  onNodeClick: (node: any) => void;
  isLoading: boolean;
  handleNodeDrag?: (nodeId: string, x: number, y: number) => void;
  handleNodeDragEnd?: (nodeId: string) => void;
  restartSimulation?: () => void;
}

const BubbleChartSigma: React.FC<BubbleChartSigmaProps> = ({
  graphData,
  searchTerm,
  onSearchChange,
  resetSearch,
  onNodeClick,
  isLoading,
  handleNodeDrag,
  handleNodeDragEnd,
  restartSimulation
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sigmaRef = useRef<Sigma | null>(null);
  const graphRef = useRef<Graph | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  
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
        x: node.x ?? Math.random(),
        y: node.y ?? Math.random()
      });
    });

    // Add edges to graph
    graphData.edges.forEach((edge: any) => {
      const sourceId = typeof edge.source === 'object' ? edge.source.id.toString() : edge.source.toString();
      const targetId = typeof edge.target === 'object' ? edge.target.id.toString() : edge.target.toString();
      
      if (graph.hasNode(sourceId) && graph.hasNode(targetId)) {
        graph.addEdge(
          sourceId,
          targetId, 
          {
            weight: edge.weight,
            size: edge.weight / 2,
            color: "#aaa"
          }
        );
      }
    });
    
    // Initialize sigma - Fix for TS2353 error - removed unsupported properties
    const sigma = new Sigma(graph, containerRef.current, {
      defaultNodeColor: "#9b87f5",
      defaultEdgeColor: "#eee",
      labelColor: { attribute: "color" },
      labelSize: 14,
      renderEdgeLabels: false
    });
    
    sigmaRef.current = sigma;
    
    // Add event listeners
    sigma.on("clickNode", (event) => {
      if (!isDragging) {
        const nodeId = event.node;
        const nodeAttributes = graph.getNodeAttributes(nodeId);
        onNodeClick({ 
          id: nodeId, 
          data: nodeAttributes 
        });
      }
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
    
    // Improved mousedown event - detect if we're clicking on a node
    sigma.getMouseCaptor().on("mousedown", (e) => {
      // Get the camera for coordinate transformations
      const camera = sigma.getCamera();
      
      // Find the closest node to mouse position
      const mouseX = e.x;
      const mouseY = e.y;
      
      let closestNode: string | null = null;
      let minDistance = Infinity;
      
      graph.forEachNode((nodeId) => {
        const attrs = graph.getNodeAttributes(nodeId);
        // Convert node position from graph to screen coordinates
        const nodePosition = sigma.graphToViewport(attrs.x, attrs.y);
        
        // Calculate distance from mouse to node center
        const dx = nodePosition.x - mouseX;
        const dy = nodePosition.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Create a hit radius based on node size and camera zoom
        const nodeSize = attrs.size || 5; 
        const hitRadius = nodeSize * camera.ratio;
        
        if (distance < hitRadius && distance < minDistance) {
          minDistance = distance;
          closestNode = nodeId;
        }
      });
      
      if (closestNode) {
        setIsDragging(true);
        setDraggedNode(closestNode);
        
        // Prevent the camera from moving while dragging
        e.preventSigmaDefault();
        e.original.preventDefault();
        e.original.stopPropagation();
      }
    });

    sigma.getMouseCaptor().on("mousemove", (e) => {
      if (isDragging && draggedNode && handleNodeDrag) {
        const camera = sigma.getCamera();
        
        // Convert viewport coordinates to graph coordinates
        // We need to manually convert since viewportToGraph doesn't exist on camera
        const viewportX = e.x;
        const viewportY = e.y;
        
        // Get current camera state
        const cameraState = camera.getState();
        
        // Convert viewport coordinates to graph coordinates using camera state
        const graphX = (viewportX - cameraState.x) / cameraState.ratio;
        const graphY = (viewportY - cameraState.y) / cameraState.ratio;
        
        // Update node position in graph
        graph.setNodeAttribute(draggedNode, "x", graphX);
        graph.setNodeAttribute(draggedNode, "y", graphY);
        
        // Call the handler to update the physics simulation
        handleNodeDrag(draggedNode, graphX, graphY);
        
        // Prevent the camera from moving while dragging
        e.preventSigmaDefault();
        e.original.preventDefault();
        e.original.stopPropagation();
        
        // Refresh rendering
        sigma.refresh();
      }
    });

    // Handle both mouseup and mouseleave for better dragging experience
    const endDrag = () => {
      if (isDragging && draggedNode && handleNodeDragEnd) {
        handleNodeDragEnd(draggedNode);
        setIsDragging(false);
        setDraggedNode(null);
      }
    };

    sigma.getMouseCaptor().on("mouseup", endDrag);
    sigma.getMouseCaptor().on("mouseleave", endDrag);
    
    // Position camera
    sigma.getCamera().animate({
      x: 0.5,
      y: 0.5,
      ratio: 1.2
    });
    
    // Cleanup
    return () => {
      sigma.kill();
      sigmaRef.current = null;
    };
  }, [graphData, onNodeClick, handleNodeDrag, handleNodeDragEnd, isDragging]);

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

  // Handle restart of force simulation
  const handleRestartSimulation = () => {
    if (restartSimulation) {
      restartSimulation();
      toast({
        title: "Layout refreshed",
        description: "Force-directed layout has been restarted",
        variant: "default",
      });
    }
  };

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

      <div className="absolute top-4 right-4 z-10">
        <Button 
          onClick={handleRestartSimulation}
          className="flex items-center space-x-1 bg-white text-gray-700 hover:bg-gray-100 shadow-sm"
          variant="outline"
          size="sm"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Reset Layout</span>
        </Button>
      </div>

      {isDragging && (
        <div className="absolute bottom-4 right-4 z-10 bg-white p-2 rounded-md shadow-sm text-sm text-gray-500">
          Dragging node: {draggedNode}
        </div>
      )}

      <div className="absolute bottom-4 left-4 z-10">
        <p className="text-sm text-gray-600 bg-white/80 p-2 rounded-md shadow-sm">
          Tip: Click and drag nodes to interact with the force-directed layout
        </p>
      </div>
    </div>
  );
};

export default BubbleChartSigma;
