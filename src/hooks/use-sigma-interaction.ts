
import { useRef, useState, useEffect } from 'react';
import { Sigma } from "sigma";
import Graph from "graphology";
import { Move, Grab } from 'lucide-react';

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
  const mouseDownNodeRef = useRef<string | null>(null);
  const hasMovedRef = useRef<boolean>(false);

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
      // Reset cursor only if not dragging
      if (containerRef.current && !isDragging) {
        containerRef.current.style.cursor = 'default';
      }
    };

    // Custom mouse down handler
    const handleMouseDown = (event: MouseEvent) => {
      if (!sigma || !graph) return;

      const nodeId = getNodeAtPosition(event.offsetX, event.offsetY);
      
      if (nodeId) {
        // Store node that was clicked on, but don't start dragging yet
        mouseDownNodeRef.current = nodeId;
        hasMovedRef.current = false;
        
        // Disable sigma's mouse handlers completely
        sigma.getMouseCaptor().handleDown = () => {};
        sigma.getMouseCaptor().handleMove = () => {};
        sigma.getMouseCaptor().handleUp = () => {};
        
        // Change cursor to grabbing to indicate potential drag
        if (containerRef.current) {
          containerRef.current.style.cursor = 'grabbing';
        }
        
        // Prevent default browser behavior and stop propagation
        event.preventDefault();
        event.stopPropagation();
      } else {
        // If clicking on empty space, ensure we're in panning mode
        mouseDownNodeRef.current = null;
        hasMovedRef.current = false;
      }
    };

    // Mouse move handler for dragging
    const handleMouseMove = (event: MouseEvent) => {
      const nodeId = mouseDownNodeRef.current;
      
      if (!nodeId || !sigma || !graph) return;
      
      // If we detect movement while mouse is down on a node, start dragging
      if (!isDragging) {
        setIsDragging(true);
        setDraggedNode(nodeId);
        hasMovedRef.current = true;
      }
      
      try {
        // Get mouse position in graph coordinates
        const mousePosition = sigma.viewportToGraph({ 
          x: event.offsetX, 
          y: event.offsetY 
        });
        
        // Update node position
        graph.setNodeAttribute(nodeId, "x", mousePosition.x);
        graph.setNodeAttribute(nodeId, "y", mousePosition.y);
        
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
      const nodeId = mouseDownNodeRef.current;
      
      if (nodeId) {
        // If mouse was down on a node but didn't move much, consider it a click
        if (!hasMovedRef.current) {
          const nodeAttributes = graph.getNodeAttributes(nodeId);
          onNodeClick({ 
            id: nodeId, 
            data: nodeAttributes 
          });
        }
        
        // End dragging state
        setIsDragging(false);
        setDraggedNode(null);
        
        // Reset refs
        mouseDownNodeRef.current = null;
        hasMovedRef.current = false;
        
        // Important: Restore original sigma mouse handlers
        if (sigma && originalHandlersRef.current) {
          sigma.getMouseCaptor().handleDown = originalHandlersRef.current.handleDown;
          sigma.getMouseCaptor().handleMove = originalHandlersRef.current.handleMove;
          sigma.getMouseCaptor().handleUp = originalHandlersRef.current.handleUp;
        }
        
        // Reset cursor based on hover state
        if (containerRef.current) {
          // Need to recheck if we're still hovering over a node after drag
          const nodeUnderCursor = getNodeAtPosition(event.offsetX, event.offsetY);
          containerRef.current.style.cursor = nodeUnderCursor ? 'grab' : 'default';
          
          // Update hover state if needed
          if (nodeUnderCursor && nodeUnderCursor !== hoveredNode) {
            setHoveredNode(nodeUnderCursor);
            graph.setNodeAttribute(nodeUnderCursor, "hovered", true);
            sigma.refresh();
          }
        }
        
        // Prevent the event from being processed further
        event.preventDefault();
        event.stopPropagation();
      }
    };

    // Handle mouse leave from container
    const handleMouseLeave = () => {
      if (mouseDownNodeRef.current || isDragging) {
        // End any ongoing drag operations
        mouseDownNodeRef.current = null;
        setIsDragging(false);
        setDraggedNode(null);
        hasMovedRef.current = false;
        
        // Restore original sigma mouse handlers
        if (sigma && originalHandlersRef.current) {
          sigma.getMouseCaptor().handleDown = originalHandlersRef.current.handleDown;
          sigma.getMouseCaptor().handleMove = originalHandlersRef.current.handleMove;
          sigma.getMouseCaptor().handleUp = originalHandlersRef.current.handleUp;
        }
        
        // Reset cursor and hover states
        if (containerRef.current) {
          containerRef.current.style.cursor = 'default';
        }
        
        if (hoveredNode) {
          setHoveredNode(null);
          graph.setNodeAttribute(hoveredNode, "hovered", false);
          sigma.refresh();
        }
      }
    };

    // Add event listeners
    sigma.on("enterNode", handleNodeEnter);
    sigma.on("leaveNode", handleNodeLeave);
    
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
  }, [isDragging, hoveredNode, sigmaRef, graphRef, containerRef, onNodeClick]);

  return {
    hoveredNode,
    isDragging,
    draggedNode
  };
};
