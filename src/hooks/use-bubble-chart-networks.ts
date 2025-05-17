
import { useState, useEffect } from 'react';

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

  useEffect(() => {
    const fetchNetworks = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Mock network data with Romeo and Juliet network added
        const mockNetworks: NetworkOption[] = [
          {
            id: 'romeo-and-juliet-network',
            name: 'Romeo and Juliet Character Network',
            description: 'Character relationships from Shakespeare\'s Romeo and Juliet',
            classification_level: 'unclassified',
          },
          {
            id: 'terrorism-network',
            name: 'Terrorism Network Analysis',
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
        
        // Set default selected network if none is selected or if the previously selected one isn't available
        if (filteredNetworks.length > 0) {
          const isCurrentNetworkAvailable = filteredNetworks.some(
            network => network.id === selectedNetwork
          );
          
          if (!isCurrentNetworkAvailable) {
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
  }, [userClassificationLevel, selectedNetwork]); // Re-fetch when user classification level changes

  return {
    networkOptions,
    selectedNetwork,
    setSelectedNetwork,
    isLoading,
    error,
  };
};
