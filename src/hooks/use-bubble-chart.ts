
import { useState, useEffect } from 'react';
import { ProcessedNode, ProcessedEdge } from '@/utils/bubble-chart/types';
import { NETWORK_DATA_MAP } from '@/utils/bubble-chart/mock-data';
import { canAccessNetwork } from '@/utils/bubble-chart/access-control';
import { formatNodes, formatEdges } from '@/utils/bubble-chart/formatters';

/**
 * Hook for loading and processing bubble chart data
 */
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
        
        // Get network data
        const networkData = NETWORK_DATA_MAP[networkId];
        const networkClassification = networkData.classification;
        
        // Check if user has access to this classification level
        const hasAccess = canAccessNetwork(userClassificationLevel, networkClassification);
        
        if (!hasAccess) {
          throw new Error(`You don't have sufficient clearance to access this network (required: ${networkClassification})`);
        }
        
        // Process data for visualization
        const processedNodes = formatNodes(networkData.nodes);
        const processedEdges = formatEdges(networkData.edges);
        
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
