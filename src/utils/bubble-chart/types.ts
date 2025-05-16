
// Node and edge types for the raw data
export interface BubbleChartNode {
  id: string;
  label: string;
  size: number;
  community: number;
  description?: string;
  position_x: number;
  position_y: number;
}

export interface BubbleChartEdge {
  id: string;
  source_id: string;
  target_id: string;
  weight: number;
}

// Shape of the processed node for Sigma visualization
export interface ProcessedNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  draggable: boolean;
  selectable: boolean;
  data: {
    label: string;
    size: number;
    community: number;
    description?: string;
    color: string;
  }
}

// Shape of the processed edge for Sigma visualization
export interface ProcessedEdge {
  id: string;
  source: string;
  target: string;
  style: {
    strokeWidth: number;
  }
}

// Network data with classification
export interface NetworkData {
  nodes: BubbleChartNode[];
  edges: BubbleChartEdge[];
  classification: string;
}
