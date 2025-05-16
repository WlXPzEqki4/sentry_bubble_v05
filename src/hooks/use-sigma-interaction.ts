
import { useRef, useState, useEffect } from 'react';
import { Sigma } from "sigma";
import Graph from "graphology";

interface UseSigmaInteractionProps {
  sigmaRef: React.MutableRefObject<Sigma | null>;
  graphRef: React.MutableRefObject<Graph | null>;
  containerRef: React.RefObject<HTMLDivElement>;
  onNodeClick: (node: any) => void;
}

export const useSigmaInteraction = ({
  sigmaRef,
  graphRef,
  containerRef,
  onNodeClick
}: UseSigmaInteractionProps) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const originalHandlersRef = useRef<any>(null);

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
        sigma.getMouseCaptor().handleMove = () => {};
        sigma.getMouseCaptor().handleUp = () => {};
        
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
        
        // Prevent any other mouse events
        event.preventDefault();
        event.stopPropagation();
      } catch (error) {
        console.error("Error during node dragging:", error);
      }
    };

    // Mouse up handler to end dragging
    const handleMouseUp = (event: MouseEvent) => {
      if (isDragging && draggedNode) {
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
        
        // Prevent the event from being processed further
        event.preventDefault();
        event.stopPropagation();
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
  }, [isDragging, draggedNode, hoveredNode, sigmaRef, graphRef, containerRef, onNodeClick]);

  return {
    hoveredNode,
    isDragging,
    draggedNode
  };
};
