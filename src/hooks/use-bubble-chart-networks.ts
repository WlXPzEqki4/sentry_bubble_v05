
import { useState, useEffect } from 'react';
import { toast } from "sonner";

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
        // Using mock data since the tables don't exist in the database types
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
        
        const normalizedUserClassLevel = userClassificationLevel.toLowerCase().replace(/[_\s-]+/g, '');
        console.log(`User classification level: ${userClassificationLevel} (normalized: ${normalizedUserClassLevel})`);
        
        // Filter networks based on user classification level
        const filteredNetworks = mockNetworks.filter(network => {
          const normalizedNetworkClass = network.classification_level.toLowerCase().replace(/[_\s-]+/g, '');
          console.log(`Network: ${network.name}, Class: ${network.classification_level} (normalized: ${normalizedNetworkClass})`);
          
          // Simple classification hierarchy check
          if (normalizedUserClassLevel === 'topsecret') return true;
          if (normalizedUserClassLevel === 'secret' && normalizedNetworkClass !== 'topsecret') return true;
          if (normalizedUserClassLevel === 'unclassified' && normalizedNetworkClass === 'unclassified') return true;
          
          return false;
        });
        
        console.log(`Filtered networks: ${filteredNetworks.length}`);
        
        setNetworkOptions(filteredNetworks);
        
        // Set default selected network if we have options and nothing is currently selected
        if (filteredNetworks.length > 0 && !selectedNetwork) {
          setSelectedNetwork(filteredNetworks[0].id);
        }
      } catch (error) {
        console.error('Error preparing network options:', error);
        setError(error instanceof Error ? error : new Error('Failed to prepare networks'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchNetworks();
  }, [userClassificationLevel, selectedNetwork]);

  useEffect(() => {
    // Show notification that we're using demo data
    toast.info('Using demo network visualization data');
  }, []);

  return {
    networkOptions,
    selectedNetwork,
    setSelectedNetwork,
    isLoading,
    error,
  };
};
