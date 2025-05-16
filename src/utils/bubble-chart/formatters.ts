
import { BubbleChartNode, BubbleChartEdge, ProcessedNode, ProcessedEdge } from './types';
import { getCommunityColor } from './colors';

/**
 * Format raw nodes data for Sigma visualization
 */
export const formatNodes = (nodes: BubbleChartNode[]): ProcessedNode[] => {
  return nodes.map(node => {
    // Ensure node has all required properties
    return {
      id: node.id,
      type: 'bubbleNode',
      position: { 
        x: node.position_x || Math.random() * 500, 
        y: node.position_y || Math.random() * 500 
      },
      draggable: true,
      selectable: true,
      data: {
        label: node.label,
        size: node.size || 1.0,
        community: node.community,
        description: node.description || '',
        color: getCommunityColor(node.community)
      }
    };
  });
};

/**
 * Format raw edges data for Sigma visualization
 */
export const formatEdges = (edges: BubbleChartEdge[]): ProcessedEdge[] => {
  return edges.map(edge => {
    return {
      id: edge.id,
      source: edge.source_id,
      target: edge.target_id,
      style: {
        strokeWidth: edge.weight || 1
      }
    };
  });
};
