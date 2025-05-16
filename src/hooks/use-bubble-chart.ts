import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { forceSimulation, forceManyBody, forceCenter, forceLink, forceCollide, SimulationNodeDatum, SimulationLinkDatum } from 'd3-force';

interface Node extends SimulationNodeDatum {
  id: number;
  label: string;
  family: string;
  size: number;
  x?: number;
  y?: number;
  // Add these properties needed for d3-force
  fx: number | null;
  fy: number | null;
}

interface Edge extends SimulationLinkDatum<Node> {
  source: number | Node;
  target: number | Node;
  weight: number;
}

interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

export const useBubbleChart = (networkId: string, userClassificationLevel: string = 'unclassified') => {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const simulationRef = useRef<any>(null);
  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);

  // Function to set up the force simulation
  const setupForceSimulation = (nodes: Node[], edges: Edge[]) => {
    // Store references to nodes and edges
    nodesRef.current = nodes;
    edgesRef.current = edges;

    // Create force simulation
    simulationRef.current = forceSimulation(nodes)
      .force('charge', forceManyBody().strength(-200))
      .force('center', forceCenter(0.5, 0.5))
      .force('collision', forceCollide().radius((d: any) => (d.size || 5) / 10 + 0.1))
      .force('link', forceLink(edges).id((d: any) => d.id).strength((d: any) => d.weight / 10))
      .on('tick', () => {
        // Update the graph data on each tick of the simulation
        setGraphData({
          nodes: [...nodes],
          edges: [...edges]
        });
      });

    // Run the simulation for a few ticks to get initial positions
    simulationRef.current.tick(10);

    return simulationRef.current;
  };

  // Restart simulation when dragging a node
  const restartSimulation = () => {
    if (simulationRef.current) {
      simulationRef.current.alpha(0.3).restart();
    }
  };

  // Handle node dragging
  const handleNodeDrag = (nodeId: string, x: number, y: number) => {
    const node = nodesRef.current.find(n => n.id.toString() === nodeId);
    if (node) {
      // Update node position
      node.fx = x;
      node.fy = y;
      restartSimulation();
    }
  };

  // Release node after drag
  const handleNodeDragEnd = (nodeId: string) => {
    const node = nodesRef.current.find(n => n.id.toString() === nodeId);
    if (node) {
      // Release fixed position to let simulation take over again
      node.fx = null;
      node.fy = null;
      restartSimulation();
    }
  };

  useEffect(() => {
    if (!networkId) {
      setGraphData(null);
      setIsLoading(false);
      return;
    }

    const fetchNetworkData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch nodes from Supabase
        const { data: nodesData, error: nodesError } = await supabase
          .from('knowledge_graph_nodes')
          .select('id, title, type, properties')
          .eq('network_id', networkId);

        if (nodesError) throw nodesError;

        // Fetch edges from Supabase
        const { data: edgesData, error: edgesError } = await supabase
          .from('knowledge_graph_edges')
          .select('id, source, target, label, properties')
          .eq('network_id', networkId);

        if (edgesError) throw edgesError;

        // Process nodes to match our Node interface
        const processedNodes: Node[] = nodesData.map((node: any) => {
          // Parse properties if they are a string
          const properties = typeof node.properties === 'string' 
            ? JSON.parse(node.properties) 
            : node.properties;

          return {
            id: parseInt(node.id),
            label: node.title,
            family: properties?.family || 'default',
            size: properties?.size || 5,
            fx: null,
            fy: null
          };
        });

        // Process edges to match our Edge interface
        const processedEdges: Edge[] = edgesData.map((edge: any) => {
          // Parse properties if they are a string
          const properties = typeof edge.properties === 'string'
            ? JSON.parse(edge.properties)
            : edge.properties;

          return {
            source: parseInt(edge.source),
            target: parseInt(edge.target),
            weight: properties?.weight || 1,
          };
        });

        // If we have data from Supabase, use it
        if (processedNodes.length > 0) {
          const simulation = setupForceSimulation(processedNodes, processedEdges);
          
          // Set graph data with processed data
          setGraphData({
            nodes: processedNodes,
            edges: processedEdges
          });
        } else {
          // Fall back to mock data if no data in Supabase
          // Romeo and Juliet character network data based on the images provided
          const romeoAndJulietData: GraphData = {
            nodes: [
              { id: 1, label: 'Romeo', family: 'Montague', size: 15, fx: null, fy: null },
              { id: 2, label: 'Juliet', family: 'Capulet', size: 15, fx: null, fy: null },
              { id: 3, label: 'Mercutio', family: 'Neutral', size: 10, fx: null, fy: null },
              { id: 4, label: 'Tybalt', family: 'Capulet', size: 12, fx: null, fy: null },
              { id: 5, label: 'Benvolio', family: 'Montague', size: 8, fx: null, fy: null },
              { id: 6, label: 'Capulet', family: 'Capulet', size: 10, fx: null, fy: null },
              { id: 7, label: 'Lady Capulet', family: 'Capulet', size: 8, fx: null, fy: null },
              { id: 8, label: 'Lady Montague', family: 'Montague', size: 7, fx: null, fy: null },
              { id: 9, label: 'Montague', family: 'Montague', size: 10, fx: null, fy: null },
              { id: 10, label: 'Friar Lawrence', family: 'Neutral', size: 13, fx: null, fy: null },
              { id: 11, label: 'Paris', family: 'Capulet', size: 8, fx: null, fy: null },
              { id: 12, label: 'The Nurse', family: 'Capulet', size: 12, fx: null, fy: null },
              { id: 13, label: 'Peter', family: 'Capulet', size: 5, fx: null, fy: null },
              { id: 14, label: 'Sampson', family: 'Capulet', size: 6, fx: null, fy: null },
              { id: 15, label: 'Gregory', family: 'Capulet', size: 6, fx: null, fy: null },
              { id: 16, label: 'Balthasar', family: 'Montague', size: 7, fx: null, fy: null },
              { id: 17, label: 'Abram', family: 'Montague', size: 6, fx: null, fy: null },
              { id: 18, label: 'Prince Escalus', family: 'Neutral', size: 11, fx: null, fy: null },
              { id: 19, label: 'Friar John', family: 'Neutral', size: 7, fx: null, fy: null }
            ],
            edges: [
              { source: 1, target: 2, weight: 10 },
              { source: 1, target: 3, weight: 6 },
              { source: 1, target: 5, weight: 8 },
              { source: 1, target: 10, weight: 7 },
              { source: 1, target: 6, weight: 2 },
              { source: 2, target: 4, weight: 5 },
              { source: 2, target: 12, weight: 7 },
              { source: 2, target: 7, weight: 6 },
              { source: 2, target: 11, weight: 4 },
              { source: 6, target: 4, weight: 4 },
              { source: 6, target: 7, weight: 9 },
              { source: 7, target: 12, weight: 5 },
              { source: 5, target: 17, weight: 3 },
              { source: 3, target: 18, weight: 2 },
              { source: 10, target: 19, weight: 3 },
              { source: 9, target: 1, weight: 4 },
              { source: 8, target: 1, weight: 3 },
              { source: 1, target: 16, weight: 3 },
              { source: 14, target: 15, weight: 2 },
              { source: 4, target: 13, weight: 1 }
            ]
          };
          
          // Criminal network structure
          const criminalNetworkData: GraphData = {
            nodes: [
              { id: 1, label: 'Boss', family: 'Leadership', size: 20, fx: null, fy: null },
              { id: 2, label: 'Underboss', family: 'Leadership', size: 16, fx: null, fy: null },
              { id: 3, label: 'Consigliere', family: 'Leadership', size: 15, fx: null, fy: null },
              { id: 4, label: 'Capo 1', family: 'Management', size: 12, fx: null, fy: null },
              { id: 5, label: 'Capo 2', family: 'Management', size: 12, fx: null, fy: null },
              { id: 6, label: 'Capo 3', family: 'Management', size: 12, fx: null, fy: null },
              { id: 7, label: 'Soldier 1', family: 'Operations', size: 8, fx: null, fy: null },
              { id: 8, label: 'Soldier 2', family: 'Operations', size: 8, fx: null, fy: null },
              { id: 9, label: 'Soldier 3', family: 'Operations', size: 8, fx: null, fy: null },
              { id: 10, label: 'Soldier 4', family: 'Operations', size: 8, fx: null, fy: null },
              { id: 11, label: 'Associate 1', family: 'External', size: 5, fx: null, fy: null },
              { id: 12, label: 'Associate 2', family: 'External', size: 5, fx: null, fy: null },
              { id: 13, label: 'Associate 3', family: 'External', size: 5, fx: null, fy: null },
            ],
            edges: [
              { source: 1, target: 2, weight: 10 },
              { source: 1, target: 3, weight: 9 },
              { source: 2, target: 4, weight: 7 },
              { source: 2, target: 5, weight: 7 },
              { source: 2, target: 6, weight: 7 },
              { source: 4, target: 7, weight: 5 },
              { source: 4, target: 8, weight: 5 },
              { source: 5, target: 9, weight: 5 },
              { source: 5, target: 10, weight: 5 },
              { source: 7, target: 11, weight: 3 },
              { source: 8, target: 12, weight: 3 },
              { source: 9, target: 13, weight: 3 },
              { source: 3, target: 4, weight: 4 },
              { source: 3, target: 5, weight: 4 },
              { source: 3, target: 6, weight: 4 },
            ]
          };
          
          // Intelligence network structure
          const intelligenceNetworkData: GraphData = {
            nodes: [
              { id: 1, label: 'CIA', family: 'US Intelligence', size: 18, fx: null, fy: null },
              { id: 2, label: 'FBI', family: 'US Domestic', size: 16, fx: null, fy: null },
              { id: 3, label: 'NSA', family: 'US Intelligence', size: 16, fx: null, fy: null },
              { id: 4, label: 'MI6', family: 'UK Intelligence', size: 14, fx: null, fy: null },
              { id: 5, label: 'GCHQ', family: 'UK Intelligence', size: 14, fx: null, fy: null },
              { id: 6, label: 'Mossad', family: 'Israel', size: 14, fx: null, fy: null },
              { id: 7, label: 'FSB', family: 'Russia', size: 15, fx: null, fy: null },
              { id: 8, label: 'SVR', family: 'Russia', size: 13, fx: null, fy: null },
              { id: 9, label: 'BND', family: 'Germany', size: 12, fx: null, fy: null },
              { id: 10, label: 'DGSE', family: 'France', size: 12, fx: null, fy: null },
              { id: 11, label: 'MSS', family: 'China', size: 15, fx: null, fy: null },
              { id: 12, label: 'Five Eyes', family: 'Alliance', size: 18, fx: null, fy: null },
              { id: 13, label: 'NATO Intel', family: 'Alliance', size: 14, fx: null, fy: null },
              { id: 14, label: 'CSIS', family: 'Canada', size: 10, fx: null, fy: null },
              { id: 15, label: 'ASIS', family: 'Australia', size: 10, fx: null, fy: null },
            ],
            edges: [
              { source: 1, target: 3, weight: 10 },
              { source: 1, target: 12, weight: 9 },
              { source: 1, target: 4, weight: 8 },
              { source: 1, target: 6, weight: 7 },
              { source: 2, target: 3, weight: 8 },
              { source: 3, target: 5, weight: 7 },
              { source: 3, target: 12, weight: 9 },
              { source: 4, target: 5, weight: 10 },
              { source: 4, target: 12, weight: 9 },
              { source: 5, target: 12, weight: 9 },
              { source: 7, target: 8, weight: 8 },
              { source: 9, target: 10, weight: 6 },
              { source: 9, target: 13, weight: 8 },
              { source: 10, target: 13, weight: 8 },
              { source: 12, target: 14, weight: 8 },
              { source: 12, target: 15, weight: 8 },
              { source: 6, target: 1, weight: 7 },
              { source: 7, target: 11, weight: 6 },
            ]
          };

          // Select data based on network ID
          let mockData: GraphData;
          switch(networkId) {
            case 'terrorist-network':
              mockData = intelligenceNetworkData;
              break;
            case 'criminal-network':
              mockData = criminalNetworkData;
              break;
            case 'intelligence-network':
            case 'romeo-and-juliet-network':
            default:
              mockData = romeoAndJulietData;
              break;
          }
          
          // Add a slight delay to simulate API call
          setTimeout(() => {
            setupForceSimulation(mockData.nodes, mockData.edges);
            setGraphData(mockData);
            setIsLoading(false);
          }, 500);
        }
      } catch (error) {
        console.error('Error fetching network data:', error);
        setError(error instanceof Error ? error : new Error('Failed to fetch network data'));
        setIsLoading(false);
      }
    };

    fetchNetworkData();

    // Clean up simulation when component unmounts or networkId changes
    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, [networkId, userClassificationLevel]);

  return {
    graphData,
    isLoading,
    error,
    handleNodeDrag,
    handleNodeDragEnd,
    restartSimulation
  };
};
