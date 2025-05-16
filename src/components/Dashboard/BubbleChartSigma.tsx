
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
  const dragStartPositionRef = useRef<{x: number, y: number} | null>(null);
  
  // Initialize the graph when component mounts or data changes
  useEffect(() => {
    if (!graphData || !graphData.nodes || !containerRef.current) return;
    
    let graph: Graph | null = null;
    let sigma: Sigma | null = null;
    
    try {
      // Create a new graph instance
      graph = new Graph();
      graphRef.current = graph;
      
      // Add nodes to graph
      graphData.nodes.forEach((node: any) => {
        graph?.addNode(node.id.toString(), {
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
        
        if (graph?.hasNode(sourceId) && graph?.hasNode(targetId)) {
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
      
      // Initialize sigma with fixed settings
      sigma = new Sigma(graph, containerRef.current, {
        defaultNodeColor: "#9b87f5",
        defaultEdgeColor: "#eee",
        labelColor: { attribute: "color" },
        labelSize: 14,
        renderEdgeLabels: false
      });
      
      sigmaRef.current = sigma;
      
      // Add event handlers - storing references to the handlers
      const handleNodeEnter = (event: any) => {
        setHoveredNode(event.node);
        graph?.setNodeAttribute(event.node, "hovered", true);
        sigma?.refresh();
      };
      
      const handleNodeLeave = (event: any) => {
        setHoveredNode(null);
        graph?.setNodeAttribute(event.node, "hovered", false);
        sigma?.refresh();
      };
      
      const handleNodeClick = (event: any) => {
        // Only register clicks when not dragging
        if (!isDragging && !draggedNode) {
          const nodeId = event.node;
          const nodeAttributes = graph?.getNodeAttributes(nodeId);
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
      
      // Handle node dragging
      const mouseCaptor = sigma.getMouseCaptor();
      
      // Create handler functions
      const mousedownHandler = (event: any) => {
        if (!sigma || !graph || isDragging) return;
        
        // Get mouse position in sigma coordinates
        const mouseX = event.x;
        const mouseY = event.y;
        
        // Find node under cursor
        let closestNode = null;
        let minDistance = Infinity;
        
        graph.forEachNode((nodeId) => {
          const nodeAttrs = graph?.getNodeAttributes(nodeId);
          const nodePosition = sigma?.graphToViewport(nodeAttrs.x, nodeAttrs.y);
          
          if (!nodePosition) return;
          
          // Calculate distance from mouse to node
          const dx = nodePosition.x - mouseX;
          const dy = nodePosition.y - mouseY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Adjust hit radius based on node size and camera zoom
          const camera = sigma.getCamera();
          const nodeSize = nodeAttrs.size || 5;
          const hitRadius = nodeSize * camera.ratio * 2; // Make the hit area larger
          
          if (distance < hitRadius && distance < minDistance) {
            closestNode = nodeId;
            minDistance = distance;
          }
        });
        
        if (closestNode) {
          // Start dragging
          setDraggedNode(closestNode);
          setIsDragging(true);
          
          // Store starting position for reference
          const nodeAttrs = graph.getNodeAttributes(closestNode);
          dragStartPositionRef.current = { x: nodeAttrs.x, y: nodeAttrs.y };
          
          // Prevent camera panning while dragging
          event.preventSigmaDefault();
          event.original.preventDefault();
          event.original.stopPropagation();
        }
      };
      
      const mousemoveHandler = (event: any) => {
        if (!sigma || !graph || !isDragging || !draggedNode || !handleNodeDrag) return;
        
        // Get camera state for coordinate conversion
        const camera = sigma.getCamera();
        const cameraState = camera.getState();
        
        // Convert viewport coordinates to graph coordinates
        const graphX = (event.x - cameraState.x) / cameraState.ratio;
        const graphY = (event.y - cameraState.y) / cameraState.ratio;
        
        // Update node position in graph
        graph.setNodeAttribute(draggedNode, "x", graphX);
        graph.setNodeAttribute(draggedNode, "y", graphY);
        
        // Call external handler
        handleNodeDrag(draggedNode, graphX, graphY);
        
        // Prevent camera panning during drag
        event.preventSigmaDefault();
        event.original.preventDefault();
        event.original.stopPropagation();
        
        // Refresh the rendering
        sigma.refresh();
      };
      
      const mouseupHandler = (event: any) => {
        if (isDragging && draggedNode && handleNodeDragEnd) {
          handleNodeDragEnd(draggedNode);
        }
        
        // Reset drag state
        setIsDragging(false);
        setDraggedNode(null);
        dragStartPositionRef.current = null;
      };
      
      // Handle case when mouse leaves the container
      const mouseleaveHandler = (event: any) => {
        if (isDragging && draggedNode && handleNodeDragEnd) {
          handleNodeDragEnd(draggedNode);
        }
        
        // Reset drag state
        setIsDragging(false);
        setDraggedNode(null);
        dragStartPositionRef.current = null;
      };
      
      // Attach event handlers to sigma's mouse captor
      mouseCaptor.on("mousedown", mousedownHandler);
      mouseCaptor.on("mousemove", mousemoveHandler);
      mouseCaptor.on("mouseup", mouseupHandler);
      mouseCaptor.on("mouseleave", mouseleaveHandler);
      
      // Position camera initially
      sigma.getCamera().animate({
        x: 0.5,
        y: 0.5,
        ratio: 1.2
      });
      
      // Cleanup function - ensure we properly clean up ALL event listeners
      return () => {
        // Remove all event handlers to prevent memory leaks
        if (sigma) {
          sigma.removeListener("enterNode", handleNodeEnter);
          sigma.removeListener("leaveNode", handleNodeLeave);
          sigma.removeListener("clickNode", handleNodeClick);
          
          const mouseCaptor = sigma.getMouseCaptor();
          mouseCaptor.off("mousedown", mousedownHandler);
          mouseCaptor.off("mousemove", mousemoveHandler);
          mouseCaptor.off("mouseup", mouseupHandler); 
          mouseCaptor.off("mouseleave", mouseleaveHandler);
          
          // Kill sigma instance properly
          sigma.kill();
          sigmaRef.current = null;
        }
        
        // Clear graph reference
        graphRef.current = null;
        graph = null;
      };
    } catch (error) {
      console.error("Error initializing graph:", error);
      // Clean up partial initializations on error
      if (sigma) {
        sigma.kill();
        sigmaRef.current = null;
      }
      graphRef.current = null;
      graph = null;
    }
  }, [graphData, onNodeClick, isDragging, draggedNode, handleNodeDrag, handleNodeDragEnd]);
  
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
      <div 
        ref={containerRef} 
        className="w-full h-full" 
        style={{ cursor: isDragging ? 'grabbing' : hoveredNode ? 'grab' : 'default' }}
      />
      
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

      {isDragging && draggedNode && (
        <div className="absolute bottom-4 right-4 z-10 bg-white p-2 rounded-md shadow-sm text-sm text-gray-500">
          Dragging node: {draggedNode}
        </div>
      )}

      <div className="absolute bottom-4 left-4 z-10">
        <p className="text-sm text-gray-600 bg-white/80 p-2 rounded-md shadow-sm">
          Tip: Click on a node to select it. Click and drag nodes to reposition them.
        </p>
      </div>
    </div>
  );
};

export default BubbleChartSigma;
