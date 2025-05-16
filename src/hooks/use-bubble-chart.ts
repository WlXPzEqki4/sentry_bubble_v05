
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export const useBubbleChart = (networkId: string, userClassificationLevel: string = 'unclassified') => {
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!networkId) {
      setNodes([]);
      setEdges([]);
      setIsLoading(false);
      return;
    }

    const fetchNetworkData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log(`Fetching network data for ID: ${networkId}, user level: ${userClassificationLevel}`);
        
        // Fetch nodes from the bubble_chart_nodes table
        const { data: nodesData, error: nodesError } = await supabase
          .from('bubble_chart_nodes')
          .select('*')
          .eq('network_id', networkId);
          
        if (nodesError) {
          throw new Error(`Error fetching nodes: ${nodesError.message}`);
        }
        
        console.log(`Retrieved ${nodesData?.length || 0} nodes`);
        
        // Fetch edges from the bubble_chart_edges table
        const { data: edgesData, error: edgesError } = await supabase
          .from('bubble_chart_edges')
          .select('*')
          .eq('network_id', networkId);
          
        if (edgesError) {
          throw new Error(`Error fetching edges: ${edgesError.message}`);
        }
        
        console.log(`Retrieved ${edgesData?.length || 0} edges`);
        
        if (nodesData && edgesData) {
          // Process nodes to match the expected format for Sigma
          const processedNodes = nodesData.map(node => {
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
          
          // Process edges to match the expected format for Sigma
          const processedEdges = edgesData.map(edge => {
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
        } else {
          setNodes([]);
          setEdges([]);
        }
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
