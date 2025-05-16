
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

interface BubbleChartNodeProps {
  id: string;
  data: {
    label: string;
    size?: number;
    community?: number | string;
    description?: string;
    color?: string;
  };
  selected: boolean;
  isConnectable: boolean;
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

const BubbleChartNode: React.FC<BubbleChartNodeProps> = memo(({ data, selected }) => {
  // Calculate the node size based on the provided size (with default and min values)
  const nodeSize = data.size ? Math.max(30, Math.min(100, data.size * 30)) : 40;
  
  // Get color based on community (or default to the first color)
  const communityIndex = typeof data.community === 'number' 
    ? data.community % COMMUNITY_COLORS.length 
    : typeof data.community === 'string' 
      ? parseInt(data.community, 10) % COMMUNITY_COLORS.length || 0
      : 0;
  
  const nodeColor = data.color || COMMUNITY_COLORS[communityIndex];
  
  // Calculate font size relative to node size
  const fontSize = Math.max(10, nodeSize * 0.25);
  
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 bg-white border-2"
        style={{ borderColor: nodeColor }}
        isConnectable={false}
      />
      <div
        className="flex items-center justify-center rounded-full text-white font-medium transition-shadow"
        style={{
          backgroundColor: nodeColor,
          width: `${nodeSize}px`,
          height: `${nodeSize}px`,
          fontSize: `${fontSize}px`,
          boxShadow: selected ? `0 0 0 2px white, 0 0 0 4px ${nodeColor}` : 'none',
        }}
      >
        {data.label}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 bg-white border-2"
        style={{ borderColor: nodeColor }}
        isConnectable={false}
      />
    </>
  );
});

BubbleChartNode.displayName = 'BubbleChartNode';

export default BubbleChartNode;
