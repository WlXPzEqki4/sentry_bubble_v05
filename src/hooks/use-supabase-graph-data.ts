
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GraphData } from '@/components/Dashboard/BubbleChart2/types';

interface SupabaseGraphNode {
  id: string;
  family: string;
  val: number;
  label?: string;
}

interface SupabaseGraphLink {
  source: string;
  target: string;
  value: number;
}

interface SupabaseGraphData {
  nodes: SupabaseGraphNode[];
  links: SupabaseGraphLink[];
}

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
        const response = await fetch(`${supabase.supabaseUrl}/rest/v1/rpc/get_available_graphs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabase.supabaseKey,
            'Authorization': `Bearer ${supabase.supabaseKey}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch available graphs');
        }
        
        const data = await response.json();
        setAvailableGraphs(data || []);
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
        const response = await fetch(`${supabase.supabaseUrl}/rest/v1/rpc/get_graph_data`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabase.supabaseKey,
            'Authorization': `Bearer ${supabase.supabaseKey}`
          },
          body: JSON.stringify({ p_graph_id: graphId })
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch graph data');
        }
        
        const data = await response.json();
        
        // Transform data to match the GraphData type
        if (data) {
          setGraphData(data);
        } else {
          setGraphData({ nodes: [], links: [] });
        }
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
