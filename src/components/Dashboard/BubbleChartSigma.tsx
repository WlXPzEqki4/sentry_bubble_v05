
import React, { useEffect, useState, useRef } from 'react';
import { Sigma } from "sigma";
import Graph from "graphology";
import { Search, X, Move } from 'lucide-react';
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
  const [isDragging, setIsDragging] = useState(false);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const originalHandlersRef = useRef<any>(null);
  
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
      labelColor: { attribute: "color" },
      labelSize: 14,
      renderEdgeLabels: false
    });
    
    sigmaRef.current = sigma;
    
    // Position camera
    sigma.getCamera().animate({
      x: 0.5,
      y: 0.5,
      ratio: 1.2
    });
    
    // Cleanup
    return () => {
      if (sigma) {
        sigma.kill();
        sigmaRef.current = null;
      }
    };
  }, [graphData]);

  // Set up event handlers for node interaction
  useEffect(() => {
    const sigma = sigmaRef.current;
    const graph = graphRef.current;
    
    if (!sigma || !graph) return;

    // Store original mouse handlers for reference
    originalHandlersRef.current = {
      handleDown: sigma.getMouseCaptor().handleDown,
      handleMove: sigma.getMouseCaptor().handleMove,
      handleUp: sigma.getMouseCaptor().handleUp,
    };

    // Helper function to get node under the mouse pointer
    const getNodeAtPosition = (x: number, y: number) => {
      const camera = sigma.getCamera();
      const mousePosition = sigma.viewportToGraph({ x, y });
      
      // Find node under pointer
      const nodeIds = graph.nodes();
      for (let i = 0; i < nodeIds.length; i++) {
        const nodeId = nodeIds[i];
        const nodeAttributes = graph.getNodeAttributes(nodeId);
        const nodePosition = { x: nodeAttributes.x, y: nodeAttributes.y };
        const nodeSize = nodeAttributes.size;
        
        // Calculate distance between mouse and node center
        const distance = Math.sqrt(
          Math.pow(mousePosition.x - nodePosition.x, 2) + 
          Math.pow(mousePosition.y - nodePosition.y, 2)
        );
        
        // Check if mouse is inside node (adjust for zoom level)
        if (distance < (nodeSize / camera.ratio) * 0.03) {
          return nodeId;
        }
      }
      return null;
    };

    // Hover effects for nodes
    const handleNodeEnter = (event: any) => {
      const nodeId = event.node;
      setHoveredNode(nodeId);
      graph.setNodeAttribute(nodeId, "hovered", true);
      sigma.refresh();
      // Change cursor to grab to indicate draggable
      if (containerRef.current) {
        containerRef.current.style.cursor = 'grab';
      }
    };

    const handleNodeLeave = (event: any) => {
      const nodeId = event.node;
      setHoveredNode(null);
      graph.setNodeAttribute(nodeId, "hovered", false);
      sigma.refresh();
      // Reset cursor
      if (containerRef.current && !isDragging) {
        containerRef.current.style.cursor = 'default';
      }
    };

    // Custom mouse down handler
    const handleMouseDown = (event: MouseEvent) => {
      if (!sigma || !graph) return;

      const nodeId = getNodeAtPosition(event.offsetX, event.offsetY);
      
      if (nodeId) {
        // Start dragging the node
        setIsDragging(true);
        setDraggedNode(nodeId);
        
        // Completely disable sigma's mouse handlers during node dragging
        sigma.getMouseCaptor().handleDown = () => {};
        sigma.getMouseCaptor().handleUp = () => {};
        sigma.getMouseCaptor().handleMove = () => {};
        
        // Change cursor to grabbing to indicate active drag
        if (containerRef.current) {
          containerRef.current.style.cursor = 'grabbing';
        }
        
        // Prevent normal event handling
        event.preventDefault();
        event.stopPropagation();
      }
    };

    // Mouse move handler for dragging
    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging || !draggedNode || !sigma || !graph) return;
      
      try {
        // Get mouse position in graph coordinates
        const mousePosition = sigma.viewportToGraph({ 
          x: event.offsetX, 
          y: event.offsetY 
        });
        
        // Update node position
        graph.setNodeAttribute(draggedNode, "x", mousePosition.x);
        graph.setNodeAttribute(draggedNode, "y", mousePosition.y);
        
        // Refresh to show new position
        sigma.refresh();
      } catch (error) {
        console.error("Error during node dragging:", error);
      }
    };

    // Mouse up handler to end dragging
    const handleMouseUp = (event: MouseEvent) => {
      if (isDragging && draggedNode) {
        // Prevent triggering a click event
        event.preventDefault();
        event.stopPropagation();
        
        // End dragging
        setIsDragging(false);
        setDraggedNode(null);
        
        // Restore original sigma mouse handlers
        if (sigma && originalHandlersRef.current) {
          sigma.getMouseCaptor().handleDown = originalHandlersRef.current.handleDown;
          sigma.getMouseCaptor().handleMove = originalHandlersRef.current.handleMove;
          sigma.getMouseCaptor().handleUp = originalHandlersRef.current.handleUp;
        }
        
        // Reset cursor
        if (containerRef.current) {
          containerRef.current.style.cursor = hoveredNode ? 'grab' : 'default';
        }
      }
    };

    // Handle mouse leave from container
    const handleMouseLeave = () => {
      if (isDragging) {
        setIsDragging(false);
        setDraggedNode(null);
        
        // Restore original sigma mouse handlers
        if (sigma && originalHandlersRef.current) {
          sigma.getMouseCaptor().handleDown = originalHandlersRef.current.handleDown;
          sigma.getMouseCaptor().handleMove = originalHandlersRef.current.handleMove;
          sigma.getMouseCaptor().handleUp = originalHandlersRef.current.handleUp;
        }
        
        if (containerRef.current) {
          containerRef.current.style.cursor = 'default';
        }
      }
    };

    // Capture click separately to avoid triggering node selection during drag end
    const handleNodeClick = (event: any) => {
      if (!isDragging) {
        const nodeId = event.node;
        const nodeAttributes = graph.getNodeAttributes(nodeId);
        onNodeClick({ 
          id: nodeId, 
          data: nodeAttributes 
        });
      }
    };

    // Add event listeners
    sigma.on("enterNode", handleNodeEnter);
    sigma.on("leaveNode", handleNodeLeave);
    sigma.on("clickNode", handleNodeClick);
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousedown', handleMouseDown);
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseup', handleMouseUp);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    // Cleanup event listeners
    return () => {
      if (sigma) {
        sigma.removeListener("enterNode", handleNodeEnter);
        sigma.removeListener("leaveNode", handleNodeLeave);
        sigma.removeListener("clickNode", handleNodeClick);
        
        if (originalHandlersRef.current) {
          sigma.getMouseCaptor().handleDown = originalHandlersRef.current.handleDown;
          sigma.getMouseCaptor().handleMove = originalHandlersRef.current.handleMove;
          sigma.getMouseCaptor().handleUp = originalHandlersRef.current.handleUp;
        }
      }
      
      if (container) {
        container.removeEventListener('mousedown', handleMouseDown);
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseup', handleMouseUp);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [isDragging, draggedNode, hoveredNode, onNodeClick]);

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

      <div className="absolute bottom-4 right-4 z-10 bg-white p-2 rounded-md shadow-sm flex items-center">
        <Move className="h-4 w-4 text-gray-500 mr-2" />
        <span className="text-xs text-gray-500">Click and drag nodes to reposition</span>
      </div>
    </div>
  );
};

export default BubbleChartSigma;
