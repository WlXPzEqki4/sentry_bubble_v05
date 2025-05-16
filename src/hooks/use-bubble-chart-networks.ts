
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface NetworkOption {
  id: string;
  name: string;
  description?: string;
  classification_level: string;
}

export const useBubbleChartNetworks = (userClassificationLevel: string = 'unclassified') => {
  const [networkOptions, setNetworkOptions] = useState<NetworkOption[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchNetworks = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Call the function to get networks filtered by classification level
        const { data, error: supabaseError } = await supabase
          .rpc('get_bubble_chart_networks', { p_classification_level: userClassificationLevel });

        if (supabaseError) {
          throw new Error(supabaseError.message);
        }

        if (data) {
          const networks: NetworkOption[] = data.map(network => ({
            id: network.id,
            name: network.name,
            description: network.description || undefined,
            classification_level: network.classification_level
          }));
          
          setNetworkOptions(networks);
          
          // Set default selected network
          if (networks.length > 0 && !selectedNetwork) {
            setSelectedNetwork(networks[0].id);
          }
        } else {
          // If the function fails or is not available, fall back to mock data
          console.warn('Using fallback mock data for networks');
          
          const mockNetworks: NetworkOption[] = [
            {
              id: '00000000-0000-0000-0000-000000000001',
              name: 'Terrorist Network Analysis',
              description: 'Analysis of terrorist network connections and communities',
              classification_level: 'secret',
            },
            {
              id: '00000000-0000-0000-0000-000000000002',
              name: 'Criminal Organization Structure',
              description: 'Mapping of criminal organization hierarchy and relationships',
              classification_level: 'unclassified',
            },
            {
              id: '00000000-0000-0000-0000-000000000003',
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
          
          // Set default selected network
          if (filteredNetworks.length > 0 && !selectedNetwork) {
            setSelectedNetwork(filteredNetworks[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching network options:', error);
        setError(error instanceof Error ? error : new Error('Failed to fetch networks'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchNetworks();
  }, [userClassificationLevel]); // Re-fetch when user classification level changes

  return {
    networkOptions,
    selectedNetwork,
    setSelectedNetwork,
    isLoading,
    error,
  };
};
