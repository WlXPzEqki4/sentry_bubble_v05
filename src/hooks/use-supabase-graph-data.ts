import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GraphData } from '@/components/Dashboard/BubbleChart2/types';

interface AvailableGraph {
  graph_id: string;
  node_count: number;
  link_count: number;
}

export const useSupabaseGraphData = (graphId: string = 'romeo-and-juliet') => {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [availableGraphs, setAvailableGraphs] = useState<AvailableGraph[]>([]);
  
  // Fetch available graphs
  useEffect(() => {
    const fetchAvailableGraphs = async () => {
      try {
        // Type assertion to work around TypeScript limitations
        // We know this table exists as it was created in SQL
        const { data, error } = await (supabase as any)
          .from('graph_nodes')
          .select('graph_id');
        
        if (error) {
          throw error;
        }
        
        if (data) {
          // Process the data to get unique graph_ids
          const graphIds = [...new Set(data.map((item: any) => item.graph_id))];
          const graphsList: AvailableGraph[] = [];
          
          for (const graphId of graphIds) {
            // Get node count
            const { count: nodeCount, error: nodeError } = await (supabase as any)
              .from('graph_nodes')
              .select('*', { count: 'exact', head: true })
              .eq('graph_id', graphId);
              
            if (nodeError) throw nodeError;
            
            // Get link count
            const { count: linkCount, error: linkError } = await (supabase as any)
              .from('graph_links')
              .select('*', { count: 'exact', head: true })
              .eq('graph_id', graphId);
              
            if (linkError) throw linkError;
            
            // Ensure graphId is treated as a string
            graphsList.push({
              graph_id: String(graphId),
              node_count: nodeCount || 0,
              link_count: linkCount || 0
            });
          }
          
          setAvailableGraphs(graphsList);
        }
      } catch (err) {
        console.error('Error fetching available graphs:', err);
        // We don't set the error state here to not block the main graph data fetch
      }
    };
    
    fetchAvailableGraphs();
  }, []);
  
  // Fetch graph data
  useEffect(() => {
    if (!graphId) {
      setGraphData(null);
      setIsLoading(false);
      return;
    }
    
    const fetchGraphData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch nodes - using type assertion to bypass TypeScript checks
        const { data: nodesData, error: nodesError } = await (supabase as any)
          .from('graph_nodes')
          .select('node_id, family, val, display_name')
          .eq('graph_id', graphId);
        
        if (nodesError) throw nodesError;
        
        // Fetch links - using type assertion to bypass TypeScript checks
        const { data: linksData, error: linksError } = await (supabase as any)
          .from('graph_links')
          .select('source, target, value')
          .eq('graph_id', graphId);
        
        if (linksError) throw linksError;
        
        // Transform data to match the GraphData type with safe type assertions
        const transformedData: GraphData = {
          nodes: (nodesData || []).map((node: any) => ({
            id: node.node_id,
            family: node.family,
            val: node.val,
            display_name: node.display_name // Ensure display_name is included
          })),
          links: (linksData || []).map((link: any) => ({
            source: link.source,
            target: link.target,
            value: link.value
          }))
        };
        
        setGraphData(transformedData);
      } catch (err) {
        console.error('Error fetching graph data:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch graph data'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGraphData();
  }, [graphId]);
  
  return {
    graphData,
    isLoading,
    error,
    availableGraphs,
  };
};
