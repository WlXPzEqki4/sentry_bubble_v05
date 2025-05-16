
import { useState, useEffect } from 'react';

interface Node {
  id: number;
  label: string;
  family: string;
  size: number;
}

interface Edge {
  source: number;
  target: number;
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
        let mockData: GraphData;
        
        // Romeo and Juliet character network data
        const romeoAndJulietData: GraphData = {
          nodes: [
            { id: 1, label: 'Romeo', family: 'Montague', size: 15 },
            { id: 2, label: 'Juliet', family: 'Capulet', size: 15 },
            { id: 3, label: 'Mercutio', family: 'Neutral', size: 10 },
            { id: 4, label: 'Tybalt', family: 'Capulet', size: 12 },
            { id: 5, label: 'Benvolio', family: 'Montague', size: 8 },
            { id: 6, label: 'Capulet', family: 'Capulet', size: 10 },
            { id: 7, label: 'Lady Capulet', family: 'Capulet', size: 8 },
            { id: 8, label: 'Lady Montague', family: 'Montague', size: 7 },
            { id: 9, label: 'Montague', family: 'Montague', size: 10 },
            { id: 10, label: 'Friar Lawrence', family: 'Neutral', size: 13 },
            { id: 11, label: 'Paris', family: 'Capulet', size: 8 },
            { id: 12, label: 'The Nurse', family: 'Capulet', size: 12 },
            { id: 13, label: 'Peter', family: 'Capulet', size: 5 },
            { id: 14, label: 'Sampson', family: 'Capulet', size: 6 },
            { id: 15, label: 'Gregory', family: 'Capulet', size: 6 },
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
          ]
        };
        
        // Criminal network structure
        const criminalNetworkData: GraphData = {
          nodes: [
            { id: 1, label: 'Boss', family: 'Leadership', size: 20 },
            { id: 2, label: 'Underboss', family: 'Leadership', size: 16 },
            { id: 3, label: 'Consigliere', family: 'Leadership', size: 15 },
            { id: 4, label: 'Capo 1', family: 'Management', size: 12 },
            { id: 5, label: 'Capo 2', family: 'Management', size: 12 },
            { id: 6, label: 'Capo 3', family: 'Management', size: 12 },
            { id: 7, label: 'Soldier 1', family: 'Operations', size: 8 },
            { id: 8, label: 'Soldier 2', family: 'Operations', size: 8 },
            { id: 9, label: 'Soldier 3', family: 'Operations', size: 8 },
            { id: 10, label: 'Soldier 4', family: 'Operations', size: 8 },
            { id: 11, label: 'Associate 1', family: 'External', size: 5 },
            { id: 12, label: 'Associate 2', family: 'External', size: 5 },
            { id: 13, label: 'Associate 3', family: 'External', size: 5 },
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
            { id: 1, label: 'CIA', family: 'US Intelligence', size: 18 },
            { id: 2, label: 'FBI', family: 'US Domestic', size: 16 },
            { id: 3, label: 'NSA', family: 'US Intelligence', size: 16 },
            { id: 4, label: 'MI6', family: 'UK Intelligence', size: 14 },
            { id: 5, label: 'GCHQ', family: 'UK Intelligence', size: 14 },
            { id: 6, label: 'Mossad', family: 'Israel', size: 14 },
            { id: 7, label: 'FSB', family: 'Russia', size: 15 },
            { id: 8, label: 'SVR', family: 'Russia', size: 13 },
            { id: 9, label: 'BND', family: 'Germany', size: 12 },
            { id: 10, label: 'DGSE', family: 'France', size: 12 },
            { id: 11, label: 'MSS', family: 'China', size: 15 },
            { id: 12, label: 'Five Eyes', family: 'Alliance', size: 18 },
            { id: 13, label: 'NATO Intel', family: 'Alliance', size: 14 },
            { id: 14, label: 'CSIS', family: 'Canada', size: 10 },
            { id: 15, label: 'ASIS', family: 'Australia', size: 10 },
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
          setGraphData(mockData);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching network data:', error);
        setError(error instanceof Error ? error : new Error('Failed to fetch network data'));
        setIsLoading(false);
      }
    };

    fetchNetworkData();
  }, [networkId, userClassificationLevel]);

  return {
    graphData,
    isLoading,
    error,
  };
};
