
import { useState, useEffect } from 'react';

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

// Define types for nodes and edges
interface BubbleChartNode {
  id: string;
  label: string;
  size: number;
  community: number;
  description?: string;
  position_x: number;
  position_y: number;
}

interface BubbleChartEdge {
  id: string;
  source_id: string;
  target_id: string;
  weight: number;
}

// Data for criminal network (network_id: '00000000-0000-0000-0000-000000000002')
const CRIMINAL_NETWORK_NODES: BubbleChartNode[] = [
  { id: 'boss', label: 'Boss', size: 4.0, community: 0, description: 'Organization leader', position_x: 400, position_y: 100 },
  { id: 'underboss', label: 'Underboss', size: 3.2, community: 0, description: 'Second in command', position_x: 400, position_y: 200 },
  { id: 'consigliere', label: 'Consigliere', size: 3.0, community: 0, description: 'Advisor', position_x: 550, position_y: 200 },
  { id: 'capo1', label: 'Capo 1', size: 2.5, community: 1, description: 'Captain of crew 1', position_x: 200, position_y: 300 },
  { id: 'capo2', label: 'Capo 2', size: 2.5, community: 2, description: 'Captain of crew 2', position_x: 400, position_y: 300 },
  { id: 'capo3', label: 'Capo 3', size: 2.5, community: 3, description: 'Captain of crew 3', position_x: 600, position_y: 300 },
  { id: 'soldier1', label: 'Soldier 1', size: 1.5, community: 1, description: 'Crew 1 member', position_x: 150, position_y: 400 },
  { id: 'soldier2', label: 'Soldier 2', size: 1.5, community: 1, description: 'Crew 1 member', position_x: 250, position_y: 400 },
  { id: 'soldier3', label: 'Soldier 3', size: 1.5, community: 2, description: 'Crew 2 member', position_x: 350, position_y: 400 },
  { id: 'soldier4', label: 'Soldier 4', size: 1.5, community: 2, description: 'Crew 2 member', position_x: 450, position_y: 400 },
  { id: 'soldier5', label: 'Soldier 5', size: 1.5, community: 3, description: 'Crew 3 member', position_x: 550, position_y: 400 },
  { id: 'soldier6', label: 'Soldier 6', size: 1.5, community: 3, description: 'Crew 3 member', position_x: 650, position_y: 400 },
  { id: 'associate1', label: 'Associate 1', size: 0.8, community: 1, description: 'External helper', position_x: 200, position_y: 500 },
  { id: 'associate2', label: 'Associate 2', size: 0.8, community: 2, description: 'External helper', position_x: 400, position_y: 500 },
  { id: 'associate3', label: 'Associate 3', size: 0.8, community: 3, description: 'External helper', position_x: 600, position_y: 500 },
];

const CRIMINAL_NETWORK_EDGES: BubbleChartEdge[] = [
  { id: 'e1', source_id: 'boss', target_id: 'underboss', weight: 5.0 },
  { id: 'e2', source_id: 'boss', target_id: 'consigliere', weight: 4.0 },
  { id: 'e3', source_id: 'underboss', target_id: 'capo1', weight: 3.0 },
  { id: 'e4', source_id: 'underboss', target_id: 'capo2', weight: 3.0 },
  { id: 'e5', source_id: 'underboss', target_id: 'capo3', weight: 3.0 },
  { id: 'e6', source_id: 'capo1', target_id: 'soldier1', weight: 2.5 },
  { id: 'e7', source_id: 'capo1', target_id: 'soldier2', weight: 2.5 },
  { id: 'e8', source_id: 'capo2', target_id: 'soldier3', weight: 2.5 },
  { id: 'e9', source_id: 'capo2', target_id: 'soldier4', weight: 2.5 },
  { id: 'e10', source_id: 'capo3', target_id: 'soldier5', weight: 2.5 },
  { id: 'e11', source_id: 'capo3', target_id: 'soldier6', weight: 2.5 },
  { id: 'e12', source_id: 'soldier1', target_id: 'associate1', weight: 1.5 },
  { id: 'e13', source_id: 'soldier3', target_id: 'associate2', weight: 1.5 },
  { id: 'e14', source_id: 'soldier5', target_id: 'associate3', weight: 1.5 },
];

// Data for terrorist network (network_id: '00000000-0000-0000-0000-000000000001')
const TERRORIST_NETWORK_NODES: BubbleChartNode[] = [
  { id: 'a', label: 'A', size: 3.5, community: 0, description: 'Network leader with connections to all communities', position_x: 400, position_y: 300 },
  { id: 'b', label: 'B', size: 2.8, community: 1, description: 'Intelligence handler', position_x: 200, position_y: 200 },
  { id: 'c', label: 'C', size: 2.5, community: 1, description: 'Field operative', position_x: 150, position_y: 350 },
  { id: 'd', label: 'D', size: 2.2, community: 2, description: 'Operations coordinator', position_x: 600, position_y: 200 },
  { id: 'e', label: 'E', size: 1.8, community: 2, description: 'Field operative', position_x: 700, position_y: 350 },
  { id: 'f', label: 'F', size: 1.5, community: 3, description: 'Logistics coordinator', position_x: 350, position_y: 500 },
  { id: 'g', label: 'G', size: 1.3, community: 3, description: 'Supply chain manager', position_x: 500, position_y: 500 },
  { id: 'h', label: 'H', size: 1.0, community: 4, description: 'Communications specialist', position_x: 300, position_y: 100 },
  { id: 'i', label: 'I', size: 0.8, community: 5, description: 'Regional commander', position_x: 650, position_y: 450 },
  { id: 'j', label: 'J', size: 0.7, community: 5, description: 'Regional commander', position_x: 800, position_y: 500 },
];

const TERRORIST_NETWORK_EDGES: BubbleChartEdge[] = [
  { id: 'te1', source_id: 'a', target_id: 'b', weight: 3.0 },
  { id: 'te2', source_id: 'a', target_id: 'd', weight: 3.0 },
  { id: 'te3', source_id: 'a', target_id: 'f', weight: 2.0 },
  { id: 'te4', source_id: 'a', target_id: 'h', weight: 1.5 },
  { id: 'te5', source_id: 'a', target_id: 'i', weight: 2.0 },
  { id: 'te6', source_id: 'a', target_id: 'j', weight: 2.0 },
  { id: 'te7', source_id: 'b', target_id: 'c', weight: 4.0 },
  { id: 'te8', source_id: 'd', target_id: 'e', weight: 3.0 },
  { id: 'te9', source_id: 'f', target_id: 'g', weight: 2.5 },
  { id: 'te10', source_id: 'b', target_id: 'd', weight: 1.0 },
  { id: 'te11', source_id: 'c', target_id: 'e', weight: 1.0 },
  { id: 'te12', source_id: 'i', target_id: 'j', weight: 1.5 },
];

// Data for intelligence network (network_id: '00000000-0000-0000-0000-000000000003')
const INTEL_NETWORK_NODES: BubbleChartNode[] = [
  { id: 'cia', label: 'CIA', size: 3.8, community: 0, description: 'Central Intelligence Agency', position_x: 400, position_y: 200 },
  { id: 'fbi', label: 'FBI', size: 3.5, community: 1, description: 'Federal Bureau of Investigation', position_x: 200, position_y: 300 },
  { id: 'nsa', label: 'NSA', size: 3.5, community: 2, description: 'National Security Agency', position_x: 600, position_y: 300 },
  { id: 'dia', label: 'DIA', size: 2.8, community: 0, description: 'Defense Intelligence Agency', position_x: 350, position_y: 400 },
  { id: 'nga', label: 'NGA', size: 2.5, community: 0, description: 'National Geospatial-Intelligence Agency', position_x: 450, position_y: 400 },
  { id: 'nro', label: 'NRO', size: 2.5, community: 0, description: 'National Reconnaissance Office', position_x: 500, position_y: 350 },
  { id: 'fincen', label: 'FinCEN', size: 2.0, community: 1, description: 'Financial Crimes Enforcement Network', position_x: 150, position_y: 400 },
  { id: 'atf', label: 'ATF', size: 2.0, community: 1, description: 'Bureau of Alcohol, Tobacco, Firearms and Explosives', position_x: 250, position_y: 400 },
  { id: 'cybercom', label: 'CYBERCOM', size: 2.2, community: 2, description: 'United States Cyber Command', position_x: 700, position_y: 350 },
  { id: 'uscg', label: 'USCG Intel', size: 1.8, community: 0, description: 'Coast Guard Intelligence', position_x: 300, position_y: 500 },
];

const INTEL_NETWORK_EDGES: BubbleChartEdge[] = [
  { id: 'ie1', source_id: 'cia', target_id: 'fbi', weight: 2.5 },
  { id: 'ie2', source_id: 'cia', target_id: 'nsa', weight: 3.0 },
  { id: 'ie3', source_id: 'cia', target_id: 'dia', weight: 2.5 },
  { id: 'ie4', source_id: 'fbi', target_id: 'fincen', weight: 2.0 },
  { id: 'ie5', source_id: 'fbi', target_id: 'atf', weight: 2.0 },
  { id: 'ie6', source_id: 'nsa', target_id: 'cybercom', weight: 2.5 },
  { id: 'ie7', source_id: 'dia', target_id: 'nga', weight: 2.0 },
  { id: 'ie8', source_id: 'dia', target_id: 'nro', weight: 2.0 },
  { id: 'ie9', source_id: 'fbi', target_id: 'uscg', weight: 1.5 },
];

// Network mappings with appropriate classifications
const NETWORK_DATA_MAP: Record<string, { 
  nodes: BubbleChartNode[]; 
  edges: BubbleChartEdge[]; 
  classification: string;
}> = {
  '00000000-0000-0000-0000-000000000001': { 
    nodes: TERRORIST_NETWORK_NODES, 
    edges: TERRORIST_NETWORK_EDGES,
    classification: 'secret' 
  },
  '00000000-0000-0000-0000-000000000002': { 
    nodes: CRIMINAL_NETWORK_NODES, 
    edges: CRIMINAL_NETWORK_EDGES,
    classification: 'unclassified' 
  },
  '00000000-0000-0000-0000-000000000003': { 
    nodes: INTEL_NETWORK_NODES, 
    edges: INTEL_NETWORK_EDGES,
    classification: 'top_secret' 
  }
};

// Shape of the processed node for Sigma visualization
type ProcessedNode = {
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
};

// Shape of the processed edge for Sigma visualization
type ProcessedEdge = {
  id: string;
  source: string;
  target: string;
  style: {
    strokeWidth: number;
  }
};

export const useBubbleChart = (networkId: string, userClassificationLevel: string = 'unclassified') => {
  const [nodes, setNodes] = useState<ProcessedNode[]>([]);
  const [edges, setEdges] = useState<ProcessedEdge[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!networkId) {
      setNodes([]);
      setEdges([]);
      setIsLoading(false);
      return;
    }

    // Fetch network data from our static mapping
    const fetchNetworkData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log(`Fetching network data for ID: ${networkId}, user level: ${userClassificationLevel}`);
        
        // Check if the network exists in our mapping
        if (!NETWORK_DATA_MAP[networkId]) {
          throw new Error(`Network with ID ${networkId} not found`);
        }
        
        // Check classification level access
        const networkData = NETWORK_DATA_MAP[networkId];
        const networkClassification = networkData.classification;
        
        // Simple classification check
        const canAccess = (userClass: string, networkClass: string) => {
          const levels = ['unclassified', 'secret', 'top_secret'];
          const userLevel = levels.indexOf(userClass.toLowerCase());
          const networkLevel = levels.indexOf(networkClass.toLowerCase());
          return userLevel >= networkLevel;
        };
        
        // Check if user has access to this classification level
        const userLevels = userClassificationLevel.toLowerCase().split(',').map(level => level.trim());
        const hasAccess = userLevels.some(level => canAccess(level, networkClassification));
        
        if (!hasAccess) {
          throw new Error(`You don't have sufficient clearance to access this network (required: ${networkClassification})`);
        }
        
        // Process nodes for visualization
        const processedNodes = networkData.nodes.map(node => {
          const communityIndex = typeof node.community === 'number'
            ? node.community % COMMUNITY_COLORS.length
            : 0;
            
          return {
            id: node.id,
            type: 'bubbleNode',
            position: { x: node.position_x || Math.random() * 500, y: node.position_y || Math.random() * 500 },
            draggable: true,
            selectable: true,
            data: {
              label: node.label,
              size: node.size || 1.0,
              community: node.community,
              description: node.description,
              color: COMMUNITY_COLORS[communityIndex]
            }
          };
        });
        
        // Process edges for visualization
        const processedEdges = networkData.edges.map(edge => {
          return {
            id: edge.id,
            source: edge.source_id,
            target: edge.target_id,
            style: {
              strokeWidth: edge.weight || 1
            }
          };
        });
        
        setNodes(processedNodes);
        setEdges(processedEdges);
      } catch (error) {
        console.error('Error preparing network data:', error);
        setError(error instanceof Error ? error : new Error('Failed to fetch network data'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchNetworkData();
  }, [networkId, userClassificationLevel]);

  return {
    nodes,
    edges,
    isLoading,
    error,
  };
};
