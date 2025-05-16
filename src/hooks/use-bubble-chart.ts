import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MarkerType } from 'reactflow';

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
        // Fetch nodes from the database
        const { data: nodesData, error: nodesError } = await supabase
          .rpc('get_bubble_chart_nodes', { p_network_id: networkId });

        if (nodesError) {
          throw new Error(`Error fetching nodes: ${nodesError.message}`);
        }

        // Fetch edges from the database
        const { data: edgesData, error: edgesError } = await supabase
          .rpc('get_bubble_chart_edges', { p_network_id: networkId });

        if (edgesError) {
          throw new Error(`Error fetching edges: ${edgesError.message}`);
        }

        if (nodesData && edgesData) {
          // Process nodes to add reactflow-specific properties
          const processedNodes = nodesData.map(node => ({
            id: node.id,
            data: { 
              label: node.label,
              size: node.size,
              community: node.community,
              description: node.description
            },
            type: 'bubbleNode',
            position: { 
              x: node.position_x || Math.random() * 800, 
              y: node.position_y || Math.random() * 600 
            },
            draggable: true,
            selectable: true,
          }));
          
          // Process edges to add reactflow-specific properties
          const processedEdges = edgesData.map(edge => ({
            id: edge.id,
            source: edge.source_id,
            target: edge.target_id,
            style: { strokeWidth: edge.weight },
            markerEnd: {
              type: MarkerType.Arrow,
            },
            label: edge.label,
            animated: edge.weight > 3, // Animate edges with higher weights
          }));
          
          setNodes(processedNodes);
          setEdges(processedEdges);
        } else {
          console.warn('No data returned from database, using mock data');
          
          // Fall back to mock data
          let mockNodes: any[] = [];
          let mockEdges: any[] = [];

          switch(networkId) {
            case '00000000-0000-0000-0000-000000000001':
              // Sample terrorist network structure
              mockNodes = [
                { id: 'n1', data: { label: 'A', size: 3.5, community: 0, description: 'Network leader with connections to all communities' } },
                { id: 'n2', data: { label: 'B', size: 2.8, community: 1, description: 'Intelligence handler' } },
                { id: 'n3', data: { label: 'C', size: 2.5, community: 1, description: 'Field operative' } },
                { id: 'n4', data: { label: 'D', size: 2.2, community: 2, description: 'Operations coordinator' } },
                { id: 'n5', data: { label: 'E', size: 1.8, community: 2, description: 'Field operative' } },
                { id: 'n6', data: { label: 'F', size: 1.5, community: 3, description: 'Logistics coordinator' } },
                { id: 'n7', data: { label: 'G', size: 1.3, community: 3, description: 'Supply chain manager' } },
                { id: 'n8', data: { label: 'H', size: 1.0, community: 4, description: 'Communications specialist' } },
                { id: 'n9', data: { label: 'I', size: 0.8, community: 5, description: 'Regional commander' } },
                { id: 'n10', data: { label: 'J', size: 0.7, community: 5, description: 'Regional commander' } },
              ];
              
              mockEdges = [
                { id: 'e1-2', source: 'n1', target: 'n2', style: { strokeWidth: 3 }, animated: true },
                { id: 'e1-4', source: 'n1', target: 'n4', style: { strokeWidth: 3 } },
                { id: 'e1-6', source: 'n1', target: 'n6', style: { strokeWidth: 2 } },
                { id: 'e1-8', source: 'n1', target: 'n8', style: { strokeWidth: 1.5 } },
                { id: 'e1-9', source: 'n1', target: 'n9', style: { strokeWidth: 2 } },
                { id: 'e1-10', source: 'n1', target: 'n10', style: { strokeWidth: 2 } },
                { id: 'e2-3', source: 'n2', target: 'n3', style: { strokeWidth: 4 } },
                { id: 'e4-5', source: 'n4', target: 'n5', style: { strokeWidth: 3 } },
                { id: 'e6-7', source: 'n6', target: 'n7', style: { strokeWidth: 2.5 } },
                { id: 'e2-4', source: 'n2', target: 'n4', style: { strokeWidth: 1 } },
                { id: 'e3-5', source: 'n3', target: 'n5', style: { strokeWidth: 1 } },
                { id: 'e9-10', source: 'n9', target: 'n10', style: { strokeWidth: 1.5 } },
              ];
              break;
              
            case '00000000-0000-0000-0000-000000000002':
              // Sample criminal organization structure
              mockNodes = [
                { id: 'c1', data: { label: 'Boss', size: 4.0, community: 0, description: 'Organization leader' } },
                { id: 'c2', data: { label: 'Underboss', size: 3.2, community: 0, description: 'Second in command' } },
                { id: 'c3', data: { label: 'Consigliere', size: 3.0, community: 0, description: 'Advisor' } },
                { id: 'c4', data: { label: 'Capo 1', size: 2.5, community: 1, description: 'Captain of crew 1' } },
                { id: 'c5', data: { label: 'Capo 2', size: 2.5, community: 2, description: 'Captain of crew 2' } },
                { id: 'c6', data: { label: 'Capo 3', size: 2.5, community: 3, description: 'Captain of crew 3' } },
                { id: 'c7', data: { label: 'Soldier 1', size: 1.5, community: 1, description: 'Crew 1 member' } },
                { id: 'c8', data: { label: 'Soldier 2', size: 1.5, community: 1, description: 'Crew 1 member' } },
                { id: 'c9', data: { label: 'Soldier 3', size: 1.5, community: 2, description: 'Crew 2 member' } },
                { id: 'c10', data: { label: 'Soldier 4', size: 1.5, community: 2, description: 'Crew 2 member' } },
                { id: 'c11', data: { label: 'Soldier 5', size: 1.5, community: 3, description: 'Crew 3 member' } },
                { id: 'c12', data: { label: 'Soldier 6', size: 1.5, community: 3, description: 'Crew 3 member' } },
                { id: 'c13', data: { label: 'Associate 1', size: 0.8, community: 1, description: 'External helper' } },
                { id: 'c14', data: { label: 'Associate 2', size: 0.8, community: 2, description: 'External helper' } },
                { id: 'c15', data: { label: 'Associate 3', size: 0.8, community: 3, description: 'External helper' } },
              ];
              
              mockEdges = [
                { id: 'ce1-2', source: 'c1', target: 'c2', style: { strokeWidth: 5 } },
                { id: 'ce1-3', source: 'c1', target: 'c3', style: { strokeWidth: 4 } },
                { id: 'ce2-3', source: 'c2', target: 'c3', style: { strokeWidth: 3 } },
                { id: 'ce2-4', source: 'c2', target: 'c4', style: { strokeWidth: 3 } },
                { id: 'ce2-5', source: 'c2', target: 'c5', style: { strokeWidth: 3 } },
                { id: 'ce2-6', source: 'c2', target: 'c6', style: { strokeWidth: 3 } },
                { id: 'ce4-7', source: 'c4', target: 'c7', style: { strokeWidth: 2 } },
                { id: 'ce4-8', source: 'c4', target: 'c8', style: { strokeWidth: 2 } },
                { id: 'ce5-9', source: 'c5', target: 'c9', style: { strokeWidth: 2 } },
                { id: 'ce5-10', source: 'c5', target: 'c10', style: { strokeWidth: 2 } },
                { id: 'ce6-11', source: 'c6', target: 'c11', style: { strokeWidth: 2 } },
                { id: 'ce6-12', source: 'c6', target: 'c12', style: { strokeWidth: 2 } },
                { id: 'ce7-13', source: 'c7', target: 'c13', style: { strokeWidth: 1 } },
                { id: 'ce9-14', source: 'c9', target: 'c14', style: { strokeWidth: 1 } },
                { id: 'ce11-15', source: 'c11', target: 'c15', style: { strokeWidth: 1 } },
              ];
              break;
              
            case '00000000-0000-0000-0000-000000000003':
              // Sample intelligence community structure
              mockNodes = [
                { id: 'i1', data: { label: 'CIA', size: 3.8, community: 0, description: 'Central Intelligence Agency' } },
                { id: 'i2', data: { label: 'FBI', size: 3.5, community: 1, description: 'Federal Bureau of Investigation' } },
                { id: 'i3', data: { label: 'NSA', size: 3.5, community: 2, description: 'National Security Agency' } },
                { id: 'i4', data: { label: 'DIA', size: 2.8, community: 0, description: 'Defense Intelligence Agency' } },
                { id: 'i5', data: { label: 'NGA', size: 2.5, community: 0, description: 'National Geospatial-Intelligence Agency' } },
                { id: 'i6', data: { label: 'NRO', size: 2.5, community: 0, description: 'National Reconnaissance Office' } },
                { id: 'i7', data: { label: 'FinCEN', size: 2.0, community: 1, description: 'Financial Crimes Enforcement Network' } },
                { id: 'i8', data: { label: 'ATF', size: 2.0, community: 1, description: 'Bureau of Alcohol, Tobacco, Firearms and Explosives' } },
                { id: 'i9', data: { label: 'CYBERCOM', size: 2.2, community: 2, description: 'United States Cyber Command' } },
                { id: 'i10', data: { label: 'USCG Intel', size: 1.8, community: 0, description: 'Coast Guard Intelligence' } },
                { id: 'i11', data: { label: 'DOS-INR', size: 1.7, community: 3, description: 'Department of State - Bureau of Intelligence and Research' } },
                { id: 'i12', data: { label: 'DHS-I&A', size: 1.7, community: 3, description: 'Department of Homeland Security - Intelligence and Analysis' } },
                { id: 'i13', data: { label: 'DEA', size: 1.8, community: 1, description: 'Drug Enforcement Administration' } },
                { id: 'i14', data: { label: 'OICI', size: 1.4, community: 3, description: 'Office of Intelligence and Counterintelligence' } },
                { id: 'i15', data: { label: 'Five Eyes', size: 3.0, community: 4, description: 'Intelligence alliance of five countries' } },
                { id: 'i16', data: { label: 'MI6', size: 2.7, community: 4, description: 'UK Secret Intelligence Service' } },
                { id: 'i17', data: { label: 'CSIS', size: 2.5, community: 4, description: 'Canadian Security Intelligence Service' } },
              ];
              
              mockEdges = [
                { id: 'ie1-2', source: 'i1', target: 'i2', style: { strokeWidth: 2.5 } },
                { id: 'ie1-3', source: 'i1', target: 'i3', style: { strokeWidth: 3 } },
                { id: 'ie1-4', source: 'i1', target: 'i4', style: { strokeWidth: 4 } },
                { id: 'ie1-5', source: 'i1', target: 'i5', style: { strokeWidth: 3.5 } },
                { id: 'ie1-6', source: 'i1', target: 'i6', style: { strokeWidth: 3.5 } },
                { id: 'ie1-15', source: 'i1', target: 'i15', style: { strokeWidth: 4 } },
                { id: 'ie2-7', source: 'i2', target: 'i7', style: { strokeWidth: 3 } },
                { id: 'ie2-8', source: 'i2', target: 'i8', style: { strokeWidth: 2.5 } },
                { id: 'ie2-13', source: 'i2', target: 'i13', style: { strokeWidth: 3 } },
                { id: 'ie3-9', source: 'i3', target: 'i9', style: { strokeWidth: 4 } },
                { id: 'ie11-12', source: 'i11', target: 'i12', style: { strokeWidth: 2 } },
                { id: 'ie12-14', source: 'i12', target: 'i14', style: { strokeWidth: 1.5 } },
                { id: 'ie15-16', source: 'i15', target: 'i16', style: { strokeWidth: 3.5 } },
                { id: 'ie15-17', source: 'i15', target: 'i17', style: { strokeWidth: 3 } },
                { id: 'ie3-15', source: 'i3', target: 'i15', style: { strokeWidth: 2.5 } },
                { id: 'ie2-12', source: 'i2', target: 'i12', style: { strokeWidth: 2 } },
              ];
              break;
              
            default:
              mockNodes = [];
              mockEdges = [];
          }
          
          // Process nodes to add reactflow-specific properties
          const processedNodes = mockNodes.map(node => ({
            ...node,
            type: 'bubbleNode',
            position: { x: Math.random() * 800, y: Math.random() * 600 }, // Random initial positions
            draggable: true,
            selectable: true,
          }));
          
          // Process edges to add reactflow-specific properties
          const processedEdges = mockEdges.map(edge => ({
            ...edge,
            markerEnd: {
              type: MarkerType.Arrow,
            },
          }));
          
          setNodes(processedNodes);
          setEdges(processedEdges);
        }
      } catch (error) {
        console.error('Error fetching network data:', error);
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
