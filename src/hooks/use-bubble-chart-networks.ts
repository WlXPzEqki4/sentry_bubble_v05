
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNetworkClassification } from '@/hooks/use-knowledge-graph-networks';

export interface NetworkOption {
  id: string;
  name: string;
  description?: string;
  classification_level: string;
}

export const useBubbleChartNetworks = (userClassificationLevel: string = 'unclassified') => {
  const [networkOptions, setNetworkOptions] = useState<NetworkOption[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<string>('romeo-and-juliet-network');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { normalizeClassification, canAccessNetwork } = useNetworkClassification();

  useEffect(() => {
    const fetchNetworks = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log('Fetching available network options from Supabase');
        
        // Fetch networks from knowledge_graph_networks table
        const { data: networksData, error: networksError } = await supabase
          .from('knowledge_graph_networks')
          .select('id, name, description, classification')
          .order('name');
        
        if (networksError) {
          throw new Error(`Error fetching networks: ${networksError.message}`);
        }
        
        // Map to expected format and add the classification_level field
        const networks = networksData.map(network => ({
          id: network.id,
          name: network.name,
          description: network.description,
          classification_level: network.classification
        }));
        
        console.log(`Retrieved ${networks.length} networks from Supabase`);
        
        // Filter networks based on user classification level
        const filteredNetworks = networks.filter(network => 
          canAccessNetwork(network.classification_level, userClassificationLevel)
        );
        
        console.log(`Filtered to ${filteredNetworks.length} networks based on user classification level`);
        
        setNetworkOptions(filteredNetworks);
        
        // Set default selected network if none is selected or the selected one is not accessible
        if (filteredNetworks.length > 0) {
          const networkExists = filteredNetworks.some(n => n.id === selectedNetwork);
          if (!networkExists || !selectedNetwork) {
            setSelectedNetwork(filteredNetworks[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching network options:', error);
        setError(error instanceof Error ? error : new Error('Failed to fetch networks'));
        
        // Fallback to mock networks if Supabase fetch fails
        fallbackToMockNetworks(userClassificationLevel);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNetworks();
  }, [userClassificationLevel]); // Re-fetch when user classification level changes

  // Fallback function to use mock data if Supabase fetch fails
  const fallbackToMockNetworks = (userClassificationLevel: string) => {
    console.log("Using fallback mock network data for development");
    
    // Mock network data with Romeo and Juliet network added
    const mockNetworks: NetworkOption[] = [
      {
        id: 'romeo-and-juliet-network',
        name: 'Romeo and Juliet Character Network',
        description: 'Character relationships from Shakespeare\'s Romeo and Juliet',
        classification_level: 'unclassified',
      },
      {
        id: 'terrorist-network',
        name: 'Terrorist Network Analysis',
        description: 'Analysis of terrorist network connections and communities',
        classification_level: 'secret',
      },
      {
        id: 'criminal-network',
        name: 'Criminal Organization Structure',
        description: 'Mapping of criminal organization hierarchy and relationships',
        classification_level: 'unclassified',
      },
      {
        id: 'intelligence-network',
        name: 'Intelligence Community Links',
        description: 'Connections between intelligence agencies and operatives',
        classification_level: 'top_secret',
      },
    ];

    // Filter networks based on user classification level
    const filteredNetworks = mockNetworks.filter(network => {
      // Simple classification hierarchy check
      if (userClassificationLevel === 'top_secret') return true;
      if (userClassificationLevel === 'secret' && network.classification_level !== 'top_secret') return true;
      if (userClassificationLevel === 'unclassified' && network.classification_level === 'unclassified') return true;
      return false;
    });
    
    setNetworkOptions(filteredNetworks);
    
    // Set default selected network if none is selected
    if (filteredNetworks.length > 0 && !selectedNetwork) {
      setSelectedNetwork(filteredNetworks[0].id);
    }
  };

  return {
    networkOptions,
    selectedNetwork,
    setSelectedNetwork,
    isLoading,
    error,
  };
};
