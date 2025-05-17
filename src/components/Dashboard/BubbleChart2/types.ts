
export interface Node {
  id: string;
  family: 'Montague' | 'Capulet' | 'Neutral';
  val: number;
  display_name?: string; // Add display_name as optional property
}

export interface Link {
  source: string;
  target: string;
  value: number;
}

export interface GraphData {
  nodes: Node[];
  links: Link[];
}

// Predefined layout configurations
export interface LayoutConfig {
  name: string;
  chargeStrength: number;
  linkDistance: number;
  centerStrength: number;
}

export type ForceConfig = {
  chargeStrength: number;
  linkDistance: number;
  centerStrength: number;
};

export const layoutPresets: Record<string, LayoutConfig> = {
  default: {
    name: "Default",
    chargeStrength: -120,
    linkDistance: 30,
    centerStrength: 0.1
  },
  clustered: {
    name: "Clustered",
    chargeStrength: -50,
    linkDistance: 40,
    centerStrength: 0.05
  },
  spread: {
    name: "Spread Out",
    chargeStrength: -200,
    linkDistance: 60,
    centerStrength: 0.02
  },
  compact: {
    name: "Compact",
    chargeStrength: -30,
    linkDistance: 20,
    centerStrength: 0.2
  },
  hierarchical: {
    name: "Hierarchical",
    chargeStrength: -100,
    linkDistance: 50,
    centerStrength: 0.15
  }
};

// Color mapping for families
export const getFamilyColor = (family: string): string => {
  switch (family) {
    case 'Montague': return '#e6550d';
    case 'Capulet': return '#756bb1';
    case 'Neutral': return '#31a354';
    default: return '#999';
  }
};

// New type for available graph data from Supabase
export interface AvailableGraph {
  graph_id: string;
  node_count: number;
  link_count: number;
}
